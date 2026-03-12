'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import LeadFormStep1, { type LeadFormStep1Data } from '@/components/LeadFormStep1';
import VerificationStep from '@/components/VerificationStep';
import SuccessScreen from '@/components/SuccessScreen';
import AccessLoadingScreen from '@/components/AccessLoadingScreen';
import ErrorModal from '@/components/ErrorModal';

type Step = 1 | 2 | 3 | 4;

export default function AccessPage() {
  const [step, setStep] = useState<Step>(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadFormStep1Data>({ name: '', email: '', phone: '', cpf: '' });
  const [caseName, setCaseName] = useState<string>('seu caso');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [accessLoading, setAccessLoading] = useState(false);

  const handleLeadSubmit = useCallback(async (data: LeadFormStep1Data) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? 'Erro ao enviar. Tente novamente.';
        setError(json.detail ? `${msg} — ${json.detail}` : msg);
        return;
      }
      setLeadId(json.leadId);
      setLeadData(data);
      setStep(3);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCodeSubmit = useCallback(async (code: string) => {
    if (!leadId) return;
    setCodeError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.error ?? 'Código inválido ou já utilizado.';
        setModalError(msg);
        return;
      }
      if (typeof json.productName === 'string' && json.productName.trim()) {
        setCaseName(json.productName.trim());
      }
      setAccessLoading(true);
      setStep(4);
    } catch {
      setCodeError('Erro ao validar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  return (
    <div className="access-layout">
      <div className="access-container">
        <Image
          src="/dn_logo_full.svg"
          alt="DETECTIVE NIGHT"
          width={153}
          height={55}
          className="access-logo"
          priority
        />

        <div className="access-box-glow">
        <div className="access-content-box">
          <nav className="access-progress" aria-label="Etapas do acesso">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`access-progress-segment ${step === 1 ? 'access-progress-segment--current' : 'access-progress-segment--filled access-progress-segment--clickable'}`}
              aria-label="Ir para etapa 1: Boas-vindas"
              aria-current={step === 1 ? 'step' : undefined}
            />
            <button
              type="button"
              onClick={() => step >= 2 && setStep(2)}
              disabled={step < 2}
              className={`access-progress-segment ${step === 2 ? 'access-progress-segment--current' : step >= 2 ? 'access-progress-segment--filled access-progress-segment--clickable' : ''}`}
              aria-label="Ir para etapa 2: Seus dados"
              aria-current={step === 2 ? 'step' : undefined}
            />
            <button
              type="button"
              onClick={() => step >= 3 && setStep(3)}
              disabled={step < 3}
              className={`access-progress-segment ${step === 3 ? 'access-progress-segment--current' : step >= 3 ? 'access-progress-segment--filled access-progress-segment--clickable' : ''}`}
              aria-label="Ir para etapa 3: Código"
              aria-current={step === 3 ? 'step' : undefined}
            />
            <button
              type="button"
              onClick={() => step >= 4 && setStep(4)}
              disabled={step < 4}
              className={`access-progress-segment ${step === 4 ? 'access-progress-segment--current access-progress-segment--clickable' : step >= 4 ? 'access-progress-segment--filled access-progress-segment--clickable' : ''}`}
              aria-label="Ir para etapa 4: Sucesso"
              aria-current={step === 4 ? 'step' : undefined}
            />
          </nav>
          {step === 1 ? (
            <div key={1} className="access-step-body">
              <div className="access-step-body__content">
                <div className="flex justify-center mb-4">
                  <Image
                    src="/Group_56-adafcedb-2aca-4310-b34d-db7331948b3c.png"
                    alt="Acesso restrito"
                    width={200}
                    height={200}
                    className="object-contain opacity-60"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                </div>
                <h1 className="text-[22px] leading-[22px] font-semibold text-[rgba(196,196,196,1)] mb-2 text-center">
                  Arquivos sigilosos deste caso foram localizados.
                </h1>
                <p className="text-[14px] leading-[14px] text-[rgba(171,171,171,0.8)] mb-6 text-center">
                  Para acessar os documentos, áudios e vídeos ultra secretos, precisamos primeiro validar a sua identidade como detetive responsável pela investigação.
                </p>
              </div>
              <div className="access-box-footer">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="access-btn-primary"
                >
                  Avançar
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <div key={2} className="access-step-body access-step-body--form">
              <h1 className="text-[22px] leading-[22px] font-semibold text-[rgba(196,196,196,1)] mb-2 text-center pt-[25px]">
                Suas credenciais
              </h1>
              <p className="text-[14px] leading-[14px] text-[rgba(171,171,171,0.8)] mb-6 text-center pb-[25px]">
                Informe seus dados para confirmação de identidade e liberação do acesso.
              </p>
              <div className="access-step-body__form w-full text-left">
                <LeadFormStep1
                  initialData={leadData}
                  onSubmit={handleLeadSubmit}
                  error={error}
                  loading={loading}
                  variant="access"
                />
              </div>
            </div>
          ) : step === 3 ? (
            <div key={3} className="access-step-body">
              <h1 className="text-[22px] leading-[22px] font-semibold text-[rgba(196,196,196,1)] mb-2 text-center pt-[25px]">
                Código de acesso secreto
              </h1>
              <p className="text-[14px] leading-[14px] text-[rgba(171,171,171,0.8)] mb-6 text-center pb-[25px]">
                Digite o código secreto recebido junto com o seu material investigativo. Este código é único e permite a liberação dos arquivos confidenciais.
              </p>
              <VerificationStep
                onSubmit={handleCodeSubmit}
                error={codeError}
                loading={loading}
              />
            </div>
          ) : accessLoading ? (
            <div key="loading" className="access-step-body">
              <AccessLoadingScreen
                name={leadData.name}
                onComplete={() => setAccessLoading(false)}
              />
            </div>
          ) : (
            <div key={4} className="access-step-body">
              <SuccessScreen
                name={leadData.name}
                caseName={caseName}
                cpf={leadData.cpf}
                password="detetive"
                email={leadData.email}
              />
            </div>
          )}
        </div>
        </div>
      </div>

      {modalError && (
        <ErrorModal
          message={modalError}
          onClose={() => setModalError(null)}
        />
      )}
    </div>
  );
}
