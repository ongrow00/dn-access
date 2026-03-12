import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { CreateLeadRequest, CreateLeadResponse } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBody(body: unknown): { ok: true; data: CreateLeadRequest } | { ok: false; status: number; message: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, message: 'Body inválido.' };
  }
  const { name, email, phone, cpf } = body as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    return { ok: false, status: 400, message: 'Nome é obrigatório.' };
  }
  if (typeof email !== 'string' || !email.trim()) {
    return { ok: false, status: 400, message: 'E-mail é obrigatório.' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { ok: false, status: 400, message: 'E-mail inválido.' };
  }
  if (typeof phone !== 'string' || !phone.trim()) {
    return { ok: false, status: 400, message: 'Telefone é obrigatório.' };
  }
  if (typeof cpf !== 'string' || !cpf.trim()) {
    return { ok: false, status: 400, message: 'CPF é obrigatório.' };
  }
  const cpfDigits = cpf.replace(/\D/g, '');
  if (cpfDigits.length !== 11 || !/^\d{11}$/.test(cpfDigits)) {
    return { ok: false, status: 400, message: 'CPF inválido. Digite os 11 números.' };
  }
  return {
    ok: true,
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      cpf: cpfDigits,
    },
  };
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

    const supabase = getSupabase();
    const { data: existing } = await supabase
      .from('lead_physical_case')
      .select('id')
      .eq('email', validated.data.email)
      .eq('cpf', validated.data.cpf)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('lead_physical_case')
        .update({
          name: validated.data.name,
          phone: validated.data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[api/lead] Supabase update error:', updateError);
        const isDev = process.env.NODE_ENV === 'development';
        return NextResponse.json(
          {
            error: 'Erro ao atualizar. Tente novamente.',
            ...(isDev && { detail: updateError.message, code: updateError.code }),
          },
          { status: 500 }
        );
      }

      const response: CreateLeadResponse = { leadId: existing.id };
      return NextResponse.json(response, { status: 200 });
    }

    const { data, error } = await supabase
      .from('lead_physical_case')
      .insert({
        name: validated.data.name,
        email: validated.data.email,
        phone: validated.data.phone,
        cpf: validated.data.cpf,
        active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[api/lead] Supabase error:', error);
      const isDev = process.env.NODE_ENV === 'development';
      return NextResponse.json(
        {
          error: 'Erro ao registrar. Tente novamente.',
          ...(isDev && { detail: error.message, code: error.code }),
        },
        { status: 500 }
      );
    }

    const response: CreateLeadResponse = { leadId: data.id };
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    console.error('[api/lead]', e);
    const isDev = process.env.NODE_ENV === 'development';
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json(
      {
        error: 'Erro ao registrar. Tente novamente.',
        ...(isDev && { detail: message }),
      },
      { status: 500 }
    );
  }
}
