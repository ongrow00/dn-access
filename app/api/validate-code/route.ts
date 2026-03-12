import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getEnv } from '@/lib/env';
import type { ValidateCodeRequest, ValidateCodeSuccessResponse } from '@/types';

const CODE_LENGTH = 8;
const INVALID_MESSAGE = 'Código inválido ou já utilizado.';

function validateBody(body: unknown): { ok: true; data: ValidateCodeRequest } | { ok: false; status: number; message: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, message: 'Body inválido.' };
  }
  const { leadId, code } = body as Record<string, unknown>;
  if (typeof leadId !== 'string' || !leadId.trim()) {
    return { ok: false, status: 400, message: 'leadId é obrigatório.' };
  }
  if (typeof code !== 'string') {
    return { ok: false, status: 400, message: INVALID_MESSAGE };
  }
  const normalized = code.trim().replace(/\s/g, '').toUpperCase();
  if (normalized.length !== CODE_LENGTH || !/^[A-Z0-9]{8}$/.test(normalized)) {
    return { ok: false, status: 400, message: INVALID_MESSAGE };
  }
  return {
    ok: true,
    data: { leadId: leadId.trim(), code: normalized },
  };
}

/** Normaliza telefone para DDD+numero (apenas dígitos). */
function normalizePhone(phone: string): string {
  return (phone ?? '').replace(/\D/g, '').trim();
}

/**
 * Envia postback para a Cademi (entrega customizada).
 * Payload: application/x-www-form-urlencoded.
 * Se CADEMI_POSTBACK_URL ou CADEMI_TOKEN não estiverem definidos, não envia e retorna ok: true.
 */
async function sendCademiPostback(
  params: {
    codigoUnico: string;
    produtoId: string;
    produtoNome: string;
    clienteEmail: string;
    clienteNome: string;
    clienteCelular: string;
    clienteDoc: string | null;
  },
  url: string,
  token: string,
): Promise<{ ok: boolean }> {
  const body = new URLSearchParams({
    token,
    codigo: params.codigoUnico,
    status: 'aprovado',
    produto_id: params.produtoId,
    cliente_email: params.clienteEmail,
    produto_nome: params.produtoNome,
    cliente_nome: params.clienteNome,
    cliente_celular: normalizePhone(params.clienteCelular),
    tags: 'externo',
  });
  if (params.clienteDoc?.trim()) {
    body.set('cliente_doc', params.clienteDoc.trim());
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error('[api/validate-code] Cademi postback error:', res.status, text);
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error('[api/validate-code] Cademi postback fetch error:', e);
    return { ok: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = validateBody(body);
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.message },
        { status: validated.status }
      );
    }

    const { leadId, code } = validated.data;

    const supabase = getSupabase();
    const { data: lead, error: leadError } = await supabase
      .from('lead_physical_case')
      .select('id, name, email, phone, cpf, active')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json(
        { error: INVALID_MESSAGE },
        { status: 400 }
      );
    }

    if (lead.active === false) {
      return NextResponse.json(
        { error: INVALID_MESSAGE },
        { status: 400 }
      );
    }

    const { data: row, error: codeError } = await supabase
      .from('product_access_code')
      .select('id, product_id, product_name, status')
      .eq('code', code)
      .single();

    if (codeError || !row) {
      return NextResponse.json(
        { error: INVALID_MESSAGE },
        { status: 400 }
      );
    }

    if (row.status === true) {
      return NextResponse.json(
        { error: 'Código já utilizado.' },
        { status: 400 }
      );
    }

    const cademiUrl = getEnv('CADEMI_POSTBACK_URL');
    const cademiToken = getEnv('CADEMI_TOKEN');
    if (!cademiUrl || !cademiToken) {
      console.warn('[api/validate-code] CADEMI_POSTBACK_URL ou CADEMI_TOKEN não definidos, pulando postback Cademi');
      return NextResponse.json(
        { error: 'Configuração de entrega incompleta. Contate o suporte.' },
        { status: 503 }
      );
    }

    const cademiOk = await sendCademiPostback(
      {
        codigoUnico: row.id,
        produtoId: row.product_id,
        produtoNome: row.product_name ?? '',
        clienteEmail: lead.email,
        clienteNome: lead.name,
        clienteCelular: lead.phone,
        clienteDoc: lead.cpf ?? null,
      },
      cademiUrl,
      cademiToken,
    );
    if (!cademiOk.ok) {
      return NextResponse.json(
        { error: 'Falha ao processar. Tente novamente.' },
        { status: 502 }
      );
    }

    const now = new Date().toISOString();

    await supabase
      .from('product_access_code')
      .update({
        status: true,
        used_by_lead_id: leadId,
        updated_at: now,
      })
      .eq('id', row.id);

    const { data: currentLead } = await supabase
      .from('lead_physical_case')
      .select('code')
      .eq('id', leadId)
      .single();

    const existingCode = currentLead?.code?.trim() ?? '';
    const newCodeValue = existingCode ? `${existingCode},${code}` : code;

    await supabase
      .from('lead_physical_case')
      .update({ code: newCodeValue, updated_at: now })
      .eq('id', leadId);

    const response: ValidateCodeSuccessResponse = {
      success: true,
      productId: row.product_id,
      productName: row.product_name ?? undefined,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    console.error('[api/validate-code]', e);
    return NextResponse.json(
      { error: 'Erro ao validar. Tente novamente.' },
      { status: 500 }
    );
  }
}
