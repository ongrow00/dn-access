'use client';

import { useState, type FormEvent } from 'react';

/** Formata até 11 dígitos como telefone BR: (XX) XXXXX-XXXX */
function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Formata até 11 dígitos como CPF: 000.000.000-00 */
function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits.replace(/(\d{1,3})/, '$1');
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
}

/**
 * Valida CPF pelo algoritmo oficial (Receita Federal).
 * Verifica: 11 dígitos, não sequência repetida, e os dois dígitos verificadores.
 */
function isValidCpf(digits: string): boolean {
  if (digits.length !== 11 || !/^\d{11}$/.test(digits)) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[10], 10)) return false;

  return true;
}

const PHONE_PATTERN = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const CPF_LENGTH = 11;

/** Mensagens de validação em português */
const VALIDATION = {
  nameRequired: 'Preencha o nome.',
  emailRequired: 'Preencha o e-mail.',
  emailInvalid: (value: string) =>
    value.length === 0
      ? 'Preencha o e-mail.'
      : !value.includes('@')
        ? `Inclua um "@" no endereço de e-mail. "${value}" está sem "@".`
        : 'Digite um e-mail válido.',
  phoneRequired: 'Preencha o telefone no formato (00) 00000-0000.',
  phoneInvalid: 'Telefone inválido. Use o formato (00) 00000-0000 ou (00) 0000-0000.',
  cpfRequired: 'Preencha o CPF.',
  cpfInvalidLength: 'CPF inválido. Digite os 11 números.',
  cpfInvalidChecksum: 'CPF inválido. Verifique os números digitados.',
} as const;

export interface LeadFormStep1Data {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

interface LeadFormStep1Props {
  initialData?: Partial<LeadFormStep1Data>;
  onSubmit: (data: LeadFormStep1Data) => Promise<void>;
  error: string | null;
  loading: boolean;
  /** 'home' = classes da Home (home-menu-form); 'access' = layout centralizado */
  variant?: 'home' | 'access';
}

export default function LeadFormStep1({
  initialData = {},
  onSubmit,
  error,
  loading,
  variant = 'access',
}: LeadFormStep1Props) {
  const [name, setName] = useState(initialData.name ?? '');
  const [email, setEmail] = useState(initialData.email ?? '');
  const [phone, setPhone] = useState(() =>
    formatPhoneBR((initialData.phone ?? '').replace(/\D/g, ''))
  );
  const [cpf, setCpf] = useState(() =>
    formatCpf((initialData.cpf ?? '').replace(/\D/g, ''))
  );
  const [fieldError, setFieldError] = useState<string | null>(null);
  /** No iOS/Safari o autofill ignora autocomplete="off". Campos readonly não disparam autofill; removemos no foco. */
  const [inputReady, setInputReady] = useState({ name: false, email: false, phone: false, cpf: false });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldError(null);

    const form = e.currentTarget;
    const getName = () => (form.elements.namedItem('lead-name') as HTMLInputElement | null)?.value ?? '';
    const getEmail = () => (form.elements.namedItem('lead-email') as HTMLInputElement | null)?.value ?? '';
    const getPhone = () => (form.elements.namedItem('lead-phone') as HTMLInputElement | null)?.value ?? '';
    const getCpf = () => (form.elements.namedItem('lead-cpf') as HTMLInputElement | null)?.value ?? '';

    const nameTrim = (getName() || name).trim();
    const emailTrim = (getEmail() || email).trim();
    const phoneVal = getPhone() || phone;
    const phoneTrim = phoneVal.replace(/\D/g, '');
    const cpfFormatted = getCpf() || cpf;
    const cpfDigits = cpfFormatted.replace(/\D/g, '');

    if (!nameTrim) {
      setFieldError(VALIDATION.nameRequired);
      return;
    }
    if (!emailTrim) {
      setFieldError(VALIDATION.emailRequired);
      return;
    }
    if (!emailTrim.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setFieldError(VALIDATION.emailInvalid(emailTrim));
      return;
    }
    if (phoneTrim.length < 10) {
      setFieldError(VALIDATION.phoneRequired);
      return;
    }
    const phoneFormatted = formatPhoneBR(phoneTrim);
    if (!PHONE_PATTERN.test(phoneFormatted)) {
      setFieldError(VALIDATION.phoneInvalid);
      return;
    }
    if (cpfDigits.length !== CPF_LENGTH) {
      setFieldError(VALIDATION.cpfInvalidLength);
      return;
    }
    if (!isValidCpf(cpfDigits)) {
      setFieldError(VALIDATION.cpfInvalidChecksum);
      return;
    }

    await onSubmit({
      name: nameTrim,
      email: emailTrim,
      phone: phoneFormatted,
      cpf: cpfDigits,
    });
  }

  const isHome = variant === 'home';
  const formClass = isHome ? 'home-menu-form' : 'access-form';
  const fieldClass = isHome ? 'home-menu-field' : 'access-field';
  const labelClass = isHome ? 'home-menu-field-label' : 'access-field-label';
  const inputClass = isHome ? 'home-menu-input' : 'access-input';
  const btnClass = isHome ? 'home-menu-form-btn' : 'access-btn-primary';

  const showError = fieldError ?? error;

  return (
    <form
      onSubmit={handleSubmit}
      className={formClass}
      noValidate
      autoComplete="off"
      data-form-type="other"
    >
      <label className={fieldClass}>
        <span className={labelClass}>Nome</span>
        <input
          type="text"
          className={inputClass}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldError(null); }}
          onFocus={() => setInputReady((r) => ({ ...r, name: true }))}
          placeholder="Seu nome"
          autoComplete="nope"
          name="lead-name"
          readOnly={!inputReady.name}
          required
          disabled={loading}
          data-lpignore
          data-form-type="other"
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>E-mail</span>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldError(null); }}
          onFocus={() => setInputReady((r) => ({ ...r, email: true }))}
          placeholder="seu@email.com"
          autoComplete="nope"
          name="lead-email"
          readOnly={!inputReady.email}
          required
          disabled={loading}
          data-lpignore
          data-form-type="other"
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>Telefone</span>
        <input
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => { setPhone(formatPhoneBR(e.target.value)); setFieldError(null); }}
          onFocus={() => setInputReady((r) => ({ ...r, phone: true }))}
          placeholder="(00) 00000-0000"
          autoComplete="nope"
          name="lead-phone"
          readOnly={!inputReady.phone}
          required
          disabled={loading}
          maxLength={16}
          title="Telefone: (00) 00000-0000 ou (00) 0000-0000"
          data-lpignore
          data-form-type="other"
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>CPF</span>
        <input
          type="text"
          className={inputClass}
          value={cpf}
          onChange={(e) => { setCpf(formatCpf(e.target.value)); setFieldError(null); }}
          onFocus={() => setInputReady((r) => ({ ...r, cpf: true }))}
          placeholder="000.000.000-00"
          autoComplete="nope"
          name="lead-cpf"
          readOnly={!inputReady.cpf}
          inputMode="numeric"
          required
          disabled={loading}
          maxLength={14}
          title="CPF: 11 números"
          data-lpignore
          data-form-type="other"
        />
      </label>
      {showError && (
        <div className="access-error" role="alert">
          {showError}
        </div>
      )}
      {isHome ? (
        <button type="submit" className={btnClass} disabled={loading}>
          {loading ? 'Avançando...' : 'Avançar'}
        </button>
      ) : (
        <div className="access-box-footer">
          <button type="submit" className={btnClass} disabled={loading}>
            {loading ? 'Avançando...' : 'Avançar'}
          </button>
        </div>
      )}
    </form>
  );
}
