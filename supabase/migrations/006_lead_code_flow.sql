-- used_by_lead_id: qual lead (lead_physical_case) usou o código
ALTER TABLE product_access_code
  ADD COLUMN IF NOT EXISTS used_by_lead_id UUID REFERENCES lead_physical_case (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_product_access_code_used_by_lead_id ON product_access_code (used_by_lead_id);

-- Remove duplicatas por code (mantém a linha com menor id por código) para permitir índice único
DELETE FROM product_access_code a
USING product_access_code b
WHERE a.code = b.code AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_access_code_code ON product_access_code (code);

-- Índice único para upsert por (email, cpf) em lead_physical_case
CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_physical_case_email_cpf_unique
  ON lead_physical_case (email, cpf)
  WHERE email IS NOT NULL AND cpf IS NOT NULL;
