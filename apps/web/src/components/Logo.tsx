/**
 * Logo da Feijuca da Lu em SVG (redesenhada a partir do post).
 * Fica embutida no código para usar a fonte da página; public/logo.svg é a versão para ícone.
 * Quando tiver o arquivo original, troque este componente por <img src="/logo-original.png" />.
 */
export function Logo({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Feijuca da Lu">
      <circle cx="60" cy="60" r="57" fill="#1c1312" stroke="#f2b233" strokeWidth="4" />
      <path d="M44 30c-6 0-9-7-4-11 2-6 10-7 13-2 3-6 13-5 15 1 6-2 11 5 7 10 3 4-1 9-5 8H48c-3 1-6-2-4-6z" fill="none" stroke="#f2b233" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M49 30v7h22v-7" fill="none" stroke="#f2b233" strokeWidth="2.6" />
      <text x="60" y="64" textAnchor="middle" fontFamily="Kaushan Script, Brush Script MT, cursive" fontSize="27" fill="#ffffff">Feijuca</text>
      <text x="62" y="88" textAnchor="middle" fontFamily="Kaushan Script, Brush Script MT, cursive" fontSize="24" fill="#f2b233">da Lu</text>
      <path d="M33 96h20M67 96h20" stroke="#d32f2f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M60 101c-6-4-8-7-6-9.5 1.6-2 4.4-1.4 6 .8 1.6-2.2 4.4-2.8 6-.8 2 2.5 0 5.5-6 9.5z" fill="none" stroke="#d32f2f" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
