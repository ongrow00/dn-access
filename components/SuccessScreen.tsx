'use client';

import { useCallback, useState } from 'react';

const CENTRAL_URL = 'https://conteudos.detectivenight.com.br/';

/** Formata 11 dígitos como CPF: 000.000.000-00 */
function formatCpfDisplay(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length < 11) return d;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

type SuccessScreenProps = {
  name?: string;
  caseName?: string;
  cpf?: string;
  password?: string;
  email?: string;
};

export default function SuccessScreen({
  name = '',
  caseName = 'seu caso',
  cpf = '',
  password = 'detetive',
  email = '',
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const handleCopyPassword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [password]);

  const cpfFormatted = cpf ? formatCpfDisplay(cpf) : '—';

  return (
    <div className="success-screen text-center">
      <div className="success-screen__main">
        <h2 className="success-screen__title">
          Acesso liberado,<br />
          Detetive <span className="success-screen__name">{name || 'NOME'}</span>!
        </h2>
        <p className="success-screen__text">
          Sua identidade foi confirmada com sucesso. Enviamos um e-mail com todos os detalhes de acesso ao caso{' '}
          <span className="success-screen__case-name">{caseName}</span>.
        </p>

        <h3 className="success-screen__section-title">Dados de acesso</h3>
        <div className="success-screen__data-box" role="group" aria-label="Dados de acesso">
          <div className="success-screen__data-row">
            <span className="success-screen__data-label">CPF</span>
            <span className="success-screen__data-value">{cpfFormatted}</span>
          </div>
          <div className="success-screen__data-row success-screen__data-row--last">
            <span className="success-screen__data-label">Senha</span>
            <span className="success-screen__data-value success-screen__data-value--with-copy">
              {password}
              <button
                type="button"
                onClick={handleCopyPassword}
                className="success-screen__copy-btn"
                title={copied ? 'Copiado!' : 'Copiar senha'}
                aria-label={copied ? 'Copiado!' : 'Copiar senha'}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </span>
          </div>
        </div>

        <div className="success-screen__accordion">
          <button
            type="button"
            className="success-screen__accordion-trigger"
            onClick={() => setAccordionOpen((open) => !open)}
            aria-expanded={accordionOpen}
            aria-controls="success-accordion-content"
            id="success-accordion-trigger"
          >
            <span>Informações de Acesso</span>
            <svg
              className={`success-screen__accordion-icon ${accordionOpen ? 'success-screen__accordion-icon--open' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            id="success-accordion-content"
            role="region"
            aria-labelledby="success-accordion-trigger"
            className={`success-screen__accordion-content ${accordionOpen ? 'success-screen__accordion-content--open' : ''}`}
            hidden={!accordionOpen}
          >
            <p className="success-screen__accordion-text">
              Os dados de acesso também foram enviados para o e-mail cadastrado {email || '—'}. Verifique sempre a
              caixa de spam ou lixo eletrônico. Se você já comprou com a gente anteriormente, basta utilizar o mesmo
              login e senha para acessar a área do detetive.
            </p>
          </div>
        </div>
      </div>

      <div className="access-box-footer success-screen__footer">
        <a
          href={CENTRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="access-btn-primary success-screen__btn"
        >
          Acessar Central
        </a>
      </div>
    </div>
  );
}
