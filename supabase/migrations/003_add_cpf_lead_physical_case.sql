-- Adiciona coluna CPF (apenas dígitos, 11 caracteres) em lead_physical_case
ALTER TABLE lead_physical_case
  ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Índice para buscas por CPF (opcional)
CREATE INDEX IF NOT EXISTS idx_lead_physical_case_cpf ON lead_physical_case (cpf)
  WHERE cpf IS NOT NULL;
