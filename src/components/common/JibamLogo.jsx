/**
 * JibamLogo — Official brand logo for web
 * Navy #0D1B5E · Cyan #00AEEF
 */
export default function JibamLogo({ size = 'md', variant = 'full', light = false, className = '' }) {
  const sizes = {
    xs: { shield: 20, jibam: 13, pharmacy: 9,  rc: 7  },
    sm: { shield: 30, jibam: 18, pharmacy: 12, rc: 8  },
    md: { shield: 42, jibam: 24, pharmacy: 16, rc: 9  },
    lg: { shield: 56, jibam: 32, pharmacy: 22, rc: 11 },
    xl: { shield: 72, jibam: 42, pharmacy: 28, rc: 13 },
  };
  const s = sizes[size] || sizes.md;
  const navy  = light ? '#FFFFFF' : '#0D1B5E';
  const cyan  = light ? 'rgba(255,255,255,0.85)' : '#00AEEF';
  const rcClr = light ? 'rgba(255,255,255,0.6)'  : '#4A5578';

  const Shield = () => (
    <svg
      width={s.shield}
      height={s.shield * 1.15}
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M50 5 L92 22 L92 58 Q92 90 50 110 Q8 90 8 58 L8 22 Z"
        stroke={navy}
        strokeWidth="6"
        fill="none"
      />
      {/* Caduceus rod */}
      <line x1="50" y1="28" x2="50" y2="88" stroke={navy} strokeWidth="4" strokeLinecap="round" />
      {/* Top crossbar */}
      <line x1="32" y1="40" x2="68" y2="40" stroke={navy} strokeWidth="3.5" strokeLinecap="round" />
      {/* Mid crossbar */}
      <line x1="36" y1="54" x2="64" y2="54" stroke={navy} strokeWidth="3" strokeLinecap="round" />
      {/* Top S-curve */}
      <path d="M50 38 Q70 38 70 52 Q70 62 50 62" stroke={navy} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Bottom S-curve */}
      <path d="M50 62 Q30 62 30 72 Q30 82 50 82" stroke={navy} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Top node dot */}
      <circle cx="50" cy="26" r="5" fill={navy} />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Shield />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span style={{ fontSize: s.jibam, color: navy, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1 }}>JIBAM</span>
        <span style={{ fontSize: s.pharmacy, color: cyan, fontWeight: 800, letterSpacing: '0.18em' }}>PHARMACY</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Shield />
      <div className="flex flex-col">
        <span style={{ fontSize: s.rc, color: rcClr, fontWeight: 700, letterSpacing: '0.05em', textAlign: 'right' }}>RC: 1948976</span>
        <span style={{ fontSize: s.jibam, color: navy, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1 }}>JIBAM</span>
        <span style={{ fontSize: s.pharmacy, color: cyan, fontWeight: 800, letterSpacing: '0.18em' }}>PHARMACY</span>
      </div>
    </div>
  );
}
