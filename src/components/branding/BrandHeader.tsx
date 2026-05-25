/**
 * Cabeçalho de identidade visual NPJ-ITES — logo + título + subtítulos.
 * Usado nas páginas de autenticação (centralizado acima do card).
 */
export function BrandHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center animate-fade-in-down">
      <BrandLogo />
      <div className="space-y-1">
        <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-ink">
          NPJ - ITES
        </h1>
        <p className="text-[14px] text-ink-muted">
          Sistema de Gestão de Atendimento Jurídico
        </p>
        <p className="text-[12px] text-ink-subtle">
          Instituto Taquaritinguense de Ensino Superior
        </p>
      </div>
    </div>
  );
}

export function BrandLogo({ size = 60 }: { size?: number }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-white shadow-apple-md ring-1 ring-white/20 transition-transform duration-300 ease-apple hover:scale-[1.04]"
      style={{ width: size, height: size }}
      aria-label="NPJ - ITES"
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[52%] w-[52%]"
        aria-hidden
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-transparent"
      />
    </div>
  );
}
