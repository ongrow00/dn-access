#!/usr/bin/env node
/**
 * Importa o CSV all_product_code_final.csv para a tabela product_access_code.
 *
 * Uso:
 *   node scripts/seed-product-access-code.mjs [caminho/do/arquivo.csv]
 *
 * Variáveis de ambiente (ex.: do .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY ou SERVICE_ROLE_KEY
 *
 * Antes de rodar: aplicar migrations 004 e 005 (tabela criada e user_id nullable).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Carrega .env.local (e depois .env) para ter as variáveis ao rodar com npm run
function loadEnv() {
  const dir = process.cwd();
  for (const file of ['.env.local', '.env']) {
    const path = resolve(dir, file);
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
}
loadEnv();

const BATCH_SIZE = 500;
const CSV_PATH = resolve(process.cwd(), process.argv[2] || 'all_product_code_final.csv');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;
if (!url?.trim() || !key?.trim()) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (ou SUPABASE_URL e SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(url.trim(), key.trim());

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(';').map((p) => p.trim());
    if (parts.length < 4) continue;
    const [origem, codigo, product, id] = parts;
    if (i === 0 && (origem === 'Origem' && codigo === 'Código')) continue;
    if (!codigo || !product || !id) continue;
    rows.push({
      product_name: product,
      product_id: id,
      code: codigo.trim().toUpperCase(),
      status: false,
      user_id: null,
    });
  }
  return rows;
}

async function main() {
  console.log('Lendo CSV:', CSV_PATH);
  let content;
  try {
    content = readFileSync(CSV_PATH, 'utf8');
  } catch (e) {
    console.error('Erro ao ler arquivo:', e.message);
    process.exit(1);
  }

  const rows = parseCSV(content);
  console.log('Linhas válidas:', rows.length);
  if (rows.length === 0) {
    console.log('Nada para importar.');
    return;
  }

  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase.from('product_access_code').insert(batch).select('id');
    if (error) {
      console.error('Erro no lote', Math.floor(i / BATCH_SIZE) + 1, ':', error.message);
      errors += batch.length;
    } else {
      inserted += (data?.length ?? 0);
    }
    if ((i + BATCH_SIZE) % 2000 === 0 || i + BATCH_SIZE >= rows.length) {
      console.log('Progresso:', Math.min(i + BATCH_SIZE, rows.length), '/', rows.length);
    }
  }

  console.log('Concluído. Inseridos:', inserted, 'Erros:', errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
