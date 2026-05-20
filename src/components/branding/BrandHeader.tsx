/**
 * Cabeçalho de identidade visual NPJ-ITES — logo + título + subtítulos.
 * Usado nas páginas de autenticação (centralizado acima do card).
 */
export function BrandHeader() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <BrandLogo />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          NPJ - ITES
        </h1>
        <p className="text-sm text-slate-600">
          Sistema de Gestão de Atendimento Jurídico
        </p>
        <p className="text-xs text-slate-500">
          Instituto Taquaritinguense de Ensino Superior
        </p>
      </div>
    </div>
  );
}

export function BrandLogo({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20"
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
        className="h-1/2 w-1/2"
        aria-hidden
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
      </svg>
    </div>
  );
}
