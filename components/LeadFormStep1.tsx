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
  cpfInvalid: 'CPF inválido. Digite os 11 números.',
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const nameTrim = name.trim();
    const emailTrim = email.trim();
    const phoneTrim = phone.replace(/\D/g, '');
    const cpfDigits = cpf.replace(/\D/g, '');

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
    if (!PHONE_PATTERN.test(phone)) {
      setFieldError(VALIDATION.phoneInvalid);
      return;
    }
    if (cpfDigits.length !== CPF_LENGTH) {
      setFieldError(VALIDATION.cpfInvalid);
      return;
    }

    await onSubmit({
      name: nameTrim,
      email: emailTrim,
      phone: phone.trim(),
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
    <form onSubmit={handleSubmit} className={formClass} noValidate>
      <label className={fieldClass}>
        <span className={labelClass}>Nome</span>
        <input
          type="text"
          className={inputClass}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldError(null); }}
          placeholder="Seu nome"
          autoComplete="name"
          required
          disabled={loading}
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>E-mail</span>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldError(null); }}
          placeholder="seu@email.com"
          autoComplete="email"
          required
          disabled={loading}
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>Telefone</span>
        <input
          type="tel"
          className={inputClass}
          value={phone}
          onChange={(e) => { setPhone(formatPhoneBR(e.target.value)); setFieldError(null); }}
          placeholder="(00) 00000-0000"
          autoComplete="tel"
          required
          disabled={loading}
          maxLength={16}
          title="Telefone: (00) 00000-0000 ou (00) 0000-0000"
        />
      </label>
      <label className={fieldClass}>
        <span className={labelClass}>CPF</span>
        <input
          type="text"
          className={inputClass}
          value={cpf}
          onChange={(e) => { setCpf(formatCpf(e.target.value)); setFieldError(null); }}
          placeholder="000.000.000-00"
          autoComplete="off"
          inputMode="numeric"
          required
          disabled={loading}
          maxLength={14}
          title="CPF: 11 números"
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
