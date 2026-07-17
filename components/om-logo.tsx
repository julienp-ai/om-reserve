interface OmLogoProps {
  size?: number
  className?: string
}

export function OmLogo({ size = 40, className }: OmLogoProps) {
  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      aria-label="Olympique de Marseille"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        {/* Shield background */}
        <path
          d="M50 4L10 18V52C10 72 30 88 50 96C70 88 90 72 90 52V18L50 4Z"
          fill="oklch(0.40 0.18 245)"
        />
        <path
          d="M50 10L16 22V52C16 69 33 84 50 91C67 84 84 69 84 52V22L50 10Z"
          fill="oklch(0.98 0.003 240)"
        />
        {/* OM letters */}
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="32"
          fill="oklch(0.40 0.18 245)"
          letterSpacing="-1"
        >
          OM
        </text>
        {/* Bottom star */}
        <path
          d="M50 74L52 80H58L53.5 83.5L55.5 89.5L50 86L44.5 89.5L46.5 83.5L42 80H48L50 74Z"
          fill="oklch(0.68 0.19 47)"
        />
      </svg>
    </div>
  )
}
