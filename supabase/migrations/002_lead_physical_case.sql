-- Tabela principal: leads do caso físico (nome, email, telefone, active, code)
CREATE TABLE IF NOT EXISTS lead_physical_case (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_physical_case_email ON lead_physical_case (email);
CREATE INDEX IF NOT EXISTS idx_lead_physical_case_active ON lead_physical_case (active);

-- RLS: acesso apenas via service role (API)
ALTER TABLE lead_physical_case ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only lead_physical_case" ON lead_physical_case;
CREATE POLICY "Service role only lead_physical_case" ON lead_physical_case FOR ALL USING (false);

-- validation_codes: criar se não existir (FK para lead_physical_case); senão só repontar a FK
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'validation_codes') THEN
    CREATE TABLE validation_codes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT NOT NULL UNIQUE,
      product_id TEXT NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      used_at TIMESTAMPTZ,
      used_by_lead_id UUID REFERENCES lead_physical_case (id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE UNIQUE INDEX idx_validation_codes_code ON validation_codes (code);
    CREATE INDEX idx_validation_codes_used ON validation_codes (used);
    ALTER TABLE validation_codes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Service role only codes" ON validation_codes FOR ALL USING (false);
  ELSE
    ALTER TABLE validation_codes DROP CONSTRAINT IF EXISTS validation_codes_used_by_lead_id_fkey;
    ALTER TABLE validation_codes ADD CONSTRAINT validation_codes_used_by_lead_id_fkey
      FOREIGN KEY (used_by_lead_id) REFERENCES lead_physical_case (id);
  END IF;
END $$;
