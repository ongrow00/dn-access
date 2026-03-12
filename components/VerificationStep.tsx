'use client';

import { useState, useRef, useCallback, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';

interface VerificationStepProps {
  onSubmit: (code: string) => Promise<void>;
  error: string | null;
  loading: boolean;
}

const CODE_LENGTH = 8;

export default function VerificationStep({ onSubmit, error, loading }: VerificationStepProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const code = digits.join('');

  const setDigitAt = useCallback((index: number, value: string) => {
    const char = value.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, CODE_LENGTH);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) return;
    await onSubmit(code);
  }

  return (
    <form onSubmit={handleSubmit} className="access-form">
      <div className="access-field">
        <div className="access-code-cells" role="group" aria-label="Código de 8 caracteres">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="text"
              className="access-code-cell"
              value={digits[i]}
              onChange={(e) => setDigitAt(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              maxLength={1}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              disabled={loading}
              aria-label={`Caractere ${i + 1}`}
              aria-describedby={error ? 'code-error' : undefined}
            />
          ))}
        </div>
      </div>
      {error && (
        <div id="code-error" className="access-error" role="alert">
          {error}
        </div>
      )}
      <div className="access-box-footer">
        <button
          type="submit"
          className="access-btn-primary"
          disabled={loading || code.length < CODE_LENGTH}
          aria-disabled={loading || code.length < CODE_LENGTH}
        >
          {loading ? 'Validando...' : 'Avançar'}
        </button>
      </div>
    </form>
  );
}
