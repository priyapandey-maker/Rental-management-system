import React from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  theme?: 'dark' | 'light' | 'brand';
  isLink?: boolean;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  withText = true,
  theme = 'brand',
  isLink = true,
  linkTo = '/'
}) => {
  // Size variations
  const sizeMap = {
    sm: {
      box: 'w-6 h-6 rounded-md',
      icon: 'w-4 h-4',
      textMain: 'text-base',
      textSub: 'text-[9px]'
    },
    md: {
      box: 'w-8 h-8 rounded-lg',
      icon: 'w-5 h-5',
      textMain: 'text-xl',
      textSub: 'text-[10px]'
    },
    lg: {
      box: 'w-10 h-10 rounded-xl border',
      icon: 'w-6 h-6',
      textMain: 'text-2xl',
      textSub: 'text-xs'
    },
    xl: {
      box: 'w-12 h-12 rounded-xl border-2',
      icon: 'w-7 h-7',
      textMain: 'text-3xl',
      textSub: 'text-sm'
    }
  };

  // Theme variations
  const themeMap = {
    brand: {
      box: 'bg-brand-600 shadow-md shadow-brand-200 border-brand-700',
      icon: 'text-white',
      textMain: 'text-gray-900',
      textSub: 'text-gray-500'
    },
    light: {
      box: 'bg-white shadow-sm border-gray-200',
      icon: 'text-brand-600',
      textMain: 'text-gray-900',
      textSub: 'text-gray-500'
    },
    dark: {
      box: 'bg-gray-900 shadow-md shadow-gray-900/50 border-gray-700',
      icon: 'text-white',
      textMain: 'text-white',
      textSub: 'text-gray-400'
    }
  };

  const s = sizeMap[size];
  const t = themeMap[theme];

  const content = (
    <div className={`flex items-center gap-3 flex-shrink-0 group ${className}`}>
      <div className={`${s.box} ${t.box} flex items-center justify-center transition-transform group-hover:scale-105 duration-200`}>
        <CubeIcon className={`${s.icon} ${t.icon}`} strokeWidth={2.5} />
      </div>
      {withText && (
        <div className="leading-none flex flex-col justify-center">
          <span className={`block font-black tracking-tight uppercase ${s.textMain} ${t.textMain}`}>
            RMS
          </span>
          <span className={`block font-bold uppercase tracking-widest ${s.textSub} ${t.textSub} mt-0.5`}>
            Rental Management
          </span>
        </div>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link to={linkTo} className="inline-block focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};
