type IconProps = { size?: number; className?: string };

function Svg({ children, size = 18, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </Svg>
  );
}

export function GlassesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="13" r="3.5" />
      <circle cx="17" cy="13" r="3.5" />
      <path d="M10.5 13h3" />
      <path d="M1.5 11.5h2M20.5 11.5h2" />
    </Svg>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4.5h6v-1a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z" />
    </Svg>
  );
}

export function PrintIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 9V4h10v5" />
      <rect x="5" y="13" width="14" height="7" rx="1.5" />
      <path d="M7 18h10" />
      <path d="M18 11h.01" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}
