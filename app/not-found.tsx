import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Página não encontrada</h1>
      <p>A página que você procura não existe.</p>
      <Link href="/">Voltar ao início</Link>
    </div>
  );
}
