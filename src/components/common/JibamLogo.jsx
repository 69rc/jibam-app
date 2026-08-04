/**
 * JibamLogo — Official brand logo using actual logo image
 * Brand colors: Forest Green #1B5E20 · Lime #8BC34A · Red Cross #D32F2F
 */

// Size map: height of the logo image in px
const IMG_SIZES = {
  xs: 28,
  sm: 40,
  md: 52,
  lg: 68,
  xl: 88,
};

// Text-only fallback sizes (used when variant="text")
const TEXT_SIZES = {
  xs: { jibam: 13, pharmacy: 9  },
  sm: { jibam: 18, pharmacy: 12 },
  md: { jibam: 24, pharmacy: 16 },
  lg: { jibam: 32, pharmacy: 22 },
  xl: { jibam: 42, pharmacy: 28 },
};

export default function JibamLogo({ size = 'md', variant = 'full', light = false, className = '' }) {
  const imgH = IMG_SIZES[size] || IMG_SIZES.md;
  const ts   = TEXT_SIZES[size] || TEXT_SIZES.md;

  const green  = light ? '#FFFFFF'              : '#1B5E20';
  const lime   = light ? 'rgba(255,255,255,0.8)': '#8BC34A';

  // Icon only: just the logo image
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/icons/logo.PNG"
          alt="Jibam Pharmacy"
          style={{ height: imgH, width: 'auto', display: 'block' }}
          draggable={false}
        />
      </div>
    );
  }

  // Text-only fallback (no image)
  if (variant === 'text') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span style={{ fontSize: ts.jibam, color: green, fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1 }}>
          JIBAM
        </span>
        <span style={{ fontSize: ts.pharmacy, color: lime, fontWeight: 800, letterSpacing: '0.18em' }}>
          PHARMACY
        </span>
      </div>
    );
  }

  // Default: actual logo image (full variant)
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/icons/logo.PNG"
        alt="Jibam Pharmacy & Stores"
        style={{ height: imgH, width: 'auto', display: 'block' }}
        draggable={false}
      />
    </div>
  );
}
