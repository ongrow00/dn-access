'use client';

import { useState, useEffect } from 'react';

const buildSteps = (name: string) => [
  'Carregando...',
  `Verificando credenciais do Detetive ${name}`,
  'Carregando arquivos confidenciais',
  'Aguarde',
  'Acesso liberado',
];

// quanto tempo cada mensagem fica visível (ms)
const DURATIONS = [1000, 1900, 1900, 1500, 1200];

interface Props {
  name: string;
  onComplete: () => void;
}

export default function AccessLoadingScreen({ name, onComplete }: Props) {
  const steps = buildSteps(name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const isLast = index === steps.length - 1;
    const timer = setTimeout(() => {
      if (isLast) {
        onComplete();
      } else {
        setIndex((i) => i + 1);
      }
    }, DURATIONS[index]);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const isSuccess = index === steps.length - 1;

  return (
    <div className="access-loading-screen">
      <p
        key={index}
        className={`access-loading-text${isSuccess ? ' access-loading-text--success' : ''}`}
      >
        {steps[index]}
      </p>
    </div>
  );
}
