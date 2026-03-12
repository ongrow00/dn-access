'use client';

interface ErrorModalProps {
  message?: string;
  onClose: () => void;
}

const ACCESS_DENIED_TITLE = 'Acesso negado';
const ACCESS_DENIED_BODY =
  'O código secreto informado é inválido ou já foi utilizado por outro detetive. Revise o código e tente novamente. Se o problema continuar, entre em contato com a central investigativa.';

export default function ErrorModal({ onClose }: ErrorModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-[100] animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-md h-[300px] bg-[#1a1a1d] rounded-xl shadow-xl z-[101] p-6 border border-white/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-modal-title"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40 mb-4 animate-[alarm-shimmer_2s_ease-in-out_infinite]"
            aria-hidden
          >
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 id="error-modal-title" className="text-lg font-semibold text-white mb-2">
            {ACCESS_DENIED_TITLE}
          </h2>
          <p className="text-[rgba(255,255,255,0.85)] text-sm leading-[14px] mb-6">
            {ACCESS_DENIED_BODY}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="access-btn-primary w-full"
        >
          Fechar
        </button>
      </div>
    </>
  );
}
