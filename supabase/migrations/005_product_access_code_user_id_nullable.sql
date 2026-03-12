-- Permitir user_id nulo para importação de dados históricos (ex.: CSV sem usuário)
ALTER TABLE product_access_code ALTER COLUMN user_id DROP NOT NULL;

-- Trocar ON DELETE CASCADE por SET NULL para quando usuário for removido
ALTER TABLE product_access_code DROP CONSTRAINT IF EXISTS product_access_code_user_id_fkey;
ALTER TABLE product_access_code
  ADD CONSTRAINT product_access_code_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL;
