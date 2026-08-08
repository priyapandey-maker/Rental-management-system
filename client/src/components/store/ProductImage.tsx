import React, { useState } from 'react';

// ProductImage SVG rendering component
export const ProductImage: React.FC<{ sku?: string; className?: string }> = ({ sku, className = "w-full h-full" }) => {
  const normSku = (sku || '').toUpperCase();

  // 1. Cameras
  if (normSku.includes('CAM')) {
    return (
      <svg className={`${className} text-blue-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="20" y="38" width="46" height="32" rx="4" fill="#1e293b" />
        <rect x="30" y="30" width="16" height="8" rx="1.5" fill="#334155" />
        <circle cx="70" cy="54" r="14" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        <circle cx="70" cy="54" r="6" fill="#38bdf8" />
        <path d="M12 44h8v20h-8z" fill="#334155" />
        <path d="M30 30h20" strokeWidth="3" />
      </svg>
    );
  }

  // 2. Audio
  if (normSku.includes('AUD')) {
    return (
      <svg className={`${className} text-emerald-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="35" y="42" width="30" height="42" rx="4" fill="#1e293b" />
        <line x1="50" y1="42" x2="50" y2="18" strokeWidth="3" />
        <circle cx="50" cy="18" r="3" fill="#10b981" />
        <rect x="42" y="50" width="16" height="10" rx="1.5" fill="#0f172a" />
        <line x1="45" y1="55" x2="55" y2="55" stroke="#10b981" strokeWidth="2" />
        <path d="M65 72c10 0 15-8 15-18" />
        <circle cx="80" cy="54" r="3" fill="#0f172a" />
        <rect x="78" y="46" width="4" height="8" fill="#334155" />
      </svg>
    );
  }

  // 3. Lighting
  if (normSku.includes('LGT')) {
    return (
      <svg className={`${className} text-amber-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="25" y="25" width="50" height="40" rx="2" fill="#1e293b" />
        <rect x="30" y="30" width="40" height="30" fill="#fef08a" />
        <circle cx="36" cy="36" r="2" fill="#f59e0b" />
        <circle cx="45" cy="36" r="2" fill="#f59e0b" />
        <circle cx="54" cy="36" r="2" fill="#f59e0b" />
        <circle cx="63" cy="36" r="2" fill="#f59e0b" />
        <circle cx="36" cy="45" r="2" fill="#f59e0b" />
        <circle cx="45" cy="45" r="2" fill="#f59e0b" />
        <circle cx="54" cy="45" r="2" fill="#f59e0b" />
        <circle cx="63" cy="45" r="2" fill="#f59e0b" />
        <circle cx="36" cy="54" r="2" fill="#f59e0b" />
        <circle cx="45" cy="54" r="2" fill="#f59e0b" />
        <circle cx="54" cy="54" r="2" fill="#f59e0b" />
        <circle cx="63" cy="54" r="2" fill="#f59e0b" />
        <path d="M25 25l-12-8v56l12-8z" fill="#334155" />
        <path d="M75 25l12-8v56l-12-8z" fill="#334155" />
        <path d="M50 65v25" />
        <path d="M36 90h28" />
      </svg>
    );
  }

  // 4. Lenses
  if (normSku.includes('LNS')) {
    return (
      <svg className={`${className} text-rose-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 25h40v14H30z" fill="#334155" />
        <path d="M25 39h50v40H25z" fill="#1e293b" />
        <rect x="28" y="46" width="44" height="8" fill="#0f172a" />
        <rect x="28" y="60" width="44" height="8" fill="#0f172a" />
        <ellipse cx="50" cy="25" rx="20" ry="5" fill="#38bdf8" />
        <line x1="34" y1="72" x2="38" y2="72" />
        <line x1="34" y1="75" x2="40" y2="75" />
      </svg>
    );
  }

  // 5. Tripods
  if (normSku.includes('TRP')) {
    return (
      <svg className={`${className} text-teal-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="42" y="20" width="16" height="14" rx="2" fill="#334155" />
        <path d="M58 24h18" strokeWidth="3.5" />
        <circle cx="50" cy="34" r="5" fill="#1e293b" />
        <line x1="50" y1="39" x2="50" y2="52" strokeWidth="4" />
        <line x1="50" y1="52" x2="24" y2="92" strokeWidth="3" />
        <line x1="50" y1="52" x2="50" y2="94" strokeWidth="3" />
        <line x1="50" y1="52" x2="76" y2="92" strokeWidth="3" />
        <rect x="34" y="70" width="6" height="5" fill="#0f172a" />
        <rect x="47" y="72" width="6" height="5" fill="#0f172a" />
        <rect x="60" y="70" width="6" height="5" fill="#0f172a" />
      </svg>
    );
  }

  // 6. Video
  if (normSku.includes('VID')) {
    return (
      <svg className={`${className} text-purple-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="28" y="38" width="44" height="46" rx="4" fill="#1e293b" />
        <line x1="36" y1="38" x2="24" y2="16" strokeWidth="3" />
        <circle cx="24" cy="16" r="3" fill="#a855f7" />
        <line x1="64" y1="38" x2="76" y2="16" strokeWidth="3" />
        <circle cx="76" cy="16" r="3" fill="#a855f7" />
        <rect x="36" y="46" width="28" height="16" rx="1.5" fill="#0f172a" />
        <path d="M40 54h14" stroke="#a855f7" strokeWidth="2" />
        <circle cx="38" cy="72" r="3" fill="#334155" />
        <circle cx="50" cy="72" r="3" fill="#334155" />
        <circle cx="62" cy="72" r="3" fill="#334155" />
      </svg>
    );
  }

  // 7. Drones
  if (normSku.includes('DRN')) {
    return (
      <svg className={`${className} text-sky-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="50" cy="45" rx="20" ry="10" fill="#1e293b" />
        <line x1="34" y1="42" x2="16" y2="28" strokeWidth="3.5" />
        <line x1="66" y1="42" x2="84" y2="28" strokeWidth="3.5" />
        <line x1="34" y1="48" x2="14" y2="62" strokeWidth="3.5" />
        <line x1="66" y1="48" x2="86" y2="62" strokeWidth="3.5" />
        <line x1="8" y1="28" x2="24" y2="28" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="76" y1="28" x2="92" y2="28" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="6" y1="62" x2="22" y2="62" strokeWidth="2.5" stroke="#38bdf8" />
        <line x1="78" y1="62" x2="94" y2="62" strokeWidth="2.5" stroke="#38bdf8" />
        <circle cx="50" cy="60" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
      </svg>
    );
  }

  // 8. Projectors
  if (normSku.includes('PRJ')) {
    return (
      <svg className={`${className} text-indigo-400`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="18" y="38" width="64" height="36" rx="4" fill="#1e293b" />
        <circle cx="34" cy="56" r="10" fill="#0f172a" />
        <circle cx="34" cy="56" r="6" fill="#6366f1" />
        <circle cx="34" cy="56" r="3" fill="#e0e7ff" />
        <rect x="26" y="32" width="10" height="6" fill="#334155" />
        <line x1="56" y1="48" x2="74" y2="48" strokeWidth="2" />
        <line x1="56" y1="54" x2="74" y2="54" strokeWidth="2" />
        <line x1="56" y1="60" x2="74" y2="60" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className={`${className} text-gray-600`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="25" y="25" width="50" height="50" rx="4" fill="#1e293b" />
      <path d="M25 60l15-15 10 10 15-15 10 10" />
      <circle cx="38" cy="38" r="5" fill="#334155" />
    </svg>
  );
};

// ProductCardImage helper
export const ProductCardImage: React.FC<{ imageUrl?: string; sku: string; alt: string }> = ({ imageUrl, sku, alt }) => {
  const [error, setError] = useState(false);

  if (imageUrl && !error) {
    return (
      <img 
        src={imageUrl} 
        alt={alt}
        onError={() => setError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return <ProductImage sku={sku} className="w-full h-full p-8 object-contain" />;
};
