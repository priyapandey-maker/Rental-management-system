import React, { useState } from 'react';

// ── SKU-code → real product photo map ─────────────────────────────────────
// Images are served from /public/images/ (Vite static assets).
// Any SKU not matched here falls back to the generic placeholder SVG below.
const PRODUCT_PHOTO_MAP: Record<string, string> = {
  CAM: '/images/prod-cam.jpg',
  AUD: '/images/prod-aud.jpg',
  LGT: '/images/prod-lgt.jpg',
  LNS: '/images/prod-lns.jpg',
  TRP: '/images/prod-trp.jpg',
  VID: '/images/prod-vid.jpg',
  DRN: '/images/prod-drn.jpg',
  PRJ: '/images/prod-prj.jpg',
  LPT: '/images/prod-lpt.png',
  GAM: '/images/prod-gam.png',
  FURN: '/images/prod-furn.png',
  TVP: '/images/prod-tvp.png',
  WRB: '/images/prod-wrb.png',
  HAPP: '/images/prod-happ.png',
  EVT: '/images/prod-evt.png',
};

function getSkuCode(sku: string): string {
  const match = (sku || '').toUpperCase().match(/(?:PROD|SKU)-(?:D-)?([A-Z]+)-/);
  return match ? match[1] : '';
}

// ── ProductImage: returns the right SVG illustration by SKU ───────────────
// (Still used as a final fallback if the photo fails to load)
export const ProductImage: React.FC<{ sku?: string; className?: string }> = ({ sku, className = 'w-full h-full' }) => {
  const normSku = (sku || '').toUpperCase();

  if (normSku.includes('CAM')) {
    return (
      <svg className={`${className} text-sky-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="38" width="46" height="32" rx="4" fill="#e0f2fe" />
        <rect x="30" y="30" width="16" height="8" rx="1.5" fill="#bae6fd" />
        <circle cx="70" cy="54" r="14" fill="#f0f9ff" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="70" cy="54" r="6" fill="#38bdf8" />
        <path d="M12 44h8v20h-8z" fill="#bae6fd" />
        <path d="M30 30h20" strokeWidth="3" stroke="#38bdf8" />
      </svg>
    );
  }

  if (normSku.includes('AUD')) {
    return (
      <svg className={`${className} text-emerald-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="35" y="42" width="30" height="42" rx="4" fill="#ecfdf5" />
        <line x1="50" y1="42" x2="50" y2="18" strokeWidth="3" stroke="#10b981" />
        <circle cx="50" cy="18" r="3" fill="#10b981" />
        <rect x="42" y="50" width="16" height="10" rx="1.5" fill="#d1fae5" />
        <line x1="45" y1="55" x2="55" y2="55" stroke="#10b981" strokeWidth="2" />
        <path d="M65 72c10 0 15-8 15-18" stroke="#10b981" />
      </svg>
    );
  }

  if (normSku.includes('LGT')) {
    return (
      <svg className={`${className} text-amber-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="25" y="25" width="50" height="40" rx="2" fill="#fef3c7" />
        <rect x="30" y="30" width="40" height="30" fill="#fef08a" />
        {[36,45,54,63].map(x => [36,45,54].map(y => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#f59e0b" />
        )))}
        <path d="M25 25l-12-8v56l12-8z" fill="#fde68a" />
        <path d="M75 25l12-8v56l-12-8z" fill="#fde68a" />
        <path d="M50 65v25" stroke="#d97706" />
        <path d="M36 90h28" stroke="#d97706" />
      </svg>
    );
  }

  if (normSku.includes('LNS')) {
    return (
      <svg className={`${className} text-rose-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 25h40v14H30z" fill="#ffe4e6" />
        <path d="M25 39h50v40H25z" fill="#fecdd3" />
        <rect x="28" y="46" width="44" height="8" fill="#fda4af" />
        <rect x="28" y="60" width="44" height="8" fill="#fda4af" />
        <ellipse cx="50" cy="25" rx="20" ry="5" fill="#38bdf8" />
      </svg>
    );
  }

  if (normSku.includes('TRP')) {
    return (
      <svg className={`${className} text-teal-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="42" y="20" width="16" height="14" rx="2" fill="#ccfbf1" />
        <path d="M58 24h18" strokeWidth="3.5" stroke="#14b8a6" />
        <circle cx="50" cy="34" r="5" fill="#99f6e4" />
        <line x1="50" y1="39" x2="50" y2="52" strokeWidth="4" stroke="#14b8a6" />
        <line x1="50" y1="52" x2="24" y2="92" strokeWidth="3" stroke="#14b8a6" />
        <line x1="50" y1="52" x2="50" y2="94" strokeWidth="3" stroke="#14b8a6" />
        <line x1="50" y1="52" x2="76" y2="92" strokeWidth="3" stroke="#14b8a6" />
      </svg>
    );
  }

  if (normSku.includes('VID')) {
    return (
      <svg className={`${className} text-purple-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="38" width="44" height="46" rx="4" fill="#f3e8ff" />
        <line x1="36" y1="38" x2="24" y2="16" strokeWidth="3" stroke="#a855f7" />
        <circle cx="24" cy="16" r="3" fill="#a855f7" />
        <line x1="64" y1="38" x2="76" y2="16" strokeWidth="3" stroke="#a855f7" />
        <circle cx="76" cy="16" r="3" fill="#a855f7" />
        <rect x="36" y="46" width="28" height="16" rx="1.5" fill="#e9d5ff" />
        <path d="M40 54h14" stroke="#a855f7" strokeWidth="2" />
      </svg>
    );
  }

  if (normSku.includes('DRN')) {
    return (
      <svg className={`${className} text-sky-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="45" rx="20" ry="10" fill="#e0f2fe" />
        <line x1="34" y1="42" x2="16" y2="28" strokeWidth="3.5" stroke="#38bdf8" />
        <line x1="66" y1="42" x2="84" y2="28" strokeWidth="3.5" stroke="#38bdf8" />
        <line x1="34" y1="48" x2="14" y2="62" strokeWidth="3.5" stroke="#38bdf8" />
        <line x1="66" y1="48" x2="86" y2="62" strokeWidth="3.5" stroke="#38bdf8" />
        <circle cx="50" cy="60" r="5" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    );
  }

  if (normSku.includes('PRJ')) {
    return (
      <svg className={`${className} text-indigo-500`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="38" width="64" height="36" rx="4" fill="#eef2ff" />
        <circle cx="34" cy="56" r="10" fill="#e0e7ff" />
        <circle cx="34" cy="56" r="6" fill="#6366f1" />
        <circle cx="34" cy="56" r="3" fill="#e0e7ff" />
        <line x1="56" y1="48" x2="74" y2="48" strokeWidth="2" stroke="#6366f1" />
        <line x1="56" y1="54" x2="74" y2="54" strokeWidth="2" stroke="#6366f1" />
        <line x1="56" y1="60" x2="74" y2="60" strokeWidth="2" stroke="#6366f1" />
      </svg>
    );
  }

  return (
    <svg className={`${className} text-gray-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="25" width="50" height="50" rx="4" fill="#f3f4f6" />
      <path d="M25 60l15-15 10 10 15-15 10 10" stroke="#9ca3af" />
      <circle cx="38" cy="38" r="5" fill="#e5e7eb" />
    </svg>
  );
};

// ── ProductCardImage: real photo first, SVG fallback ──────────────────────
export const ProductCardImage: React.FC<{ imageUrl?: string; sku: string; alt: string }> = ({ imageUrl, sku, alt }) => {
  const [urlError, setUrlError] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const code = getSkuCode(sku);
  const photoSrc = PRODUCT_PHOTO_MAP[code];

  // 1. If the backend provided a real image URL and it hasn't errored, use it
  if (imageUrl && !urlError) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        onError={() => setUrlError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  // 2. Fall back to our generated product photo
  if (photoSrc && !photoError) {
    return (
      <img
        src={photoSrc}
        alt={alt}
        onError={() => setPhotoError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  // 3. Last resort: SVG illustration
  return <ProductImage sku={sku} className="w-full h-full p-6 object-contain" />;
};
