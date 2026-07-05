interface Props {
  size?: number;
  className?: string;
  /** "roundel" = dragão em disco escuro · "mark" = dragão em currentColor */
  variant?: "roundel" | "mark";
  title?: string;
}

// Logo do Kali Linux — silhueta estilizada do dragão (símbolo do projeto),
// recriada em SVG leve. Aproximação em ciano Kali.
export function KaliLogo({ size = 40, className, variant = "roundel", title = "Kali Linux" }: Props) {
  const roundel = variant === "roundel";
  const gid = "kaliDragonGrad";
  const dragon = roundel ? `url(#${gid})` : "currentColor";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      {roundel && (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3AF0FF" />
              <stop offset="100%" stopColor="#12A9C9" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="96" height="96" rx="22" fill="#0b0f14" stroke="#1de9ff" strokeOpacity="0.25" />
        </>
      )}

      {/* corpo/pescoço do dragão em curva "S" */}
      <path
        d="M24 80 C 20 62 38 60 40 48 C 41 40 36 36 40 28"
        fill="none"
        stroke={dragon}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* cabeça do dragão (focinho para a esquerda-cima) + mandíbula aberta */}
      <path
        d="M40 28 C 44 20 56 18 64 24 L 52 30 L 66 33 C 60 40 48 40 42 34 Z"
        fill={dragon}
      />
      {/* chifre varrido para trás */}
      <path
        d="M56 22 C 66 14 76 16 82 22"
        fill="none"
        stroke={dragon}
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* olho */}
      <circle cx="52" cy="27" r="2.1" fill={roundel ? "#0b0f14" : "#000"} />
    </svg>
  );
}
