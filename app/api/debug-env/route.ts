import { NextResponse } from 'next/server';

/**
 * Só funciona em desenvolvimento. Mostra se as variáveis do Supabase estão
 * sendo carregadas (sem exibir os valores). Delete esta rota em produção.
 */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Só em desenvolvimento' }, { status: 404 });
  }

  const vars = {
    NEXT_PUBLIC_SUPABASE_URL: !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    ),
    SUPABASE_URL: !!(process.env.SUPABASE_URL?.trim()),
    SERVICE_ROLE_KEY: !!(process.env.SERVICE_ROLE_KEY?.trim()),
    SUPABASE_SERVICE_ROLE_KEY: !!(
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    ),
  };

  const urlOk = vars.NEXT_PUBLIC_SUPABASE_URL || vars.SUPABASE_URL;
  const keyOk = vars.SERVICE_ROLE_KEY || vars.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseOk = urlOk && keyOk;

  return NextResponse.json({
    env: vars,
    supabasePronto: supabaseOk,
    mensagem: supabaseOk
      ? 'Supabase OK – as variáveis estão carregadas.'
      : `Faltam variáveis: ${!urlOk ? 'URL ' : ''}${!keyOk ? 'SERVICE_ROLE_KEY' : ''}`,
  });
}
