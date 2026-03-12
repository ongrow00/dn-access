-- Leads: everyone who fills step 1 (name, email, phone)
-- status: 'pending' until they complete with a valid code, then 'completed'
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);

-- Validation codes: 8-digit codes with product_id for external API
-- used = true after successful validation and API call
CREATE TABLE IF NOT EXISTS validation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  used_by_lead_id UUID REFERENCES leads (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_validation_codes_code ON validation_codes (code);
CREATE INDEX IF NOT EXISTS idx_validation_codes_used ON validation_codes (used);

-- RLS: disable or allow only service role (API uses service role)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_codes ENABLE ROW LEVEL SECURITY;

-- Policy: no direct client access; API uses service role which bypasses RLS
DROP POLICY IF EXISTS "Service role only leads" ON leads;
CREATE POLICY "Service role only leads" ON leads FOR ALL USING (false);
DROP POLICY IF EXISTS "Service role only codes" ON validation_codes;
CREATE POLICY "Service role only codes" ON validation_codes FOR ALL USING (false);
