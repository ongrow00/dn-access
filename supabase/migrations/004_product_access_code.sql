-- Tabela: product_access_code (códigos de acesso por produto e usuário)
CREATE TABLE IF NOT EXISTS product_access_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  product_name TEXT NOT NULL,
  product_id TEXT NOT NULL,
  code TEXT NOT NULL,
  status BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_access_code_user_id ON product_access_code (user_id);
CREATE INDEX IF NOT EXISTS idx_product_access_code_product_id ON product_access_code (product_id);
CREATE INDEX IF NOT EXISTS idx_product_access_code_status ON product_access_code (status);
CREATE INDEX IF NOT EXISTS idx_product_access_code_created_at ON product_access_code (created_at);

-- RLS: acesso apenas via service role (API)
ALTER TABLE product_access_code ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only product_access_code" ON product_access_code;
CREATE POLICY "Service role only product_access_code" ON product_access_code FOR ALL USING (false);
