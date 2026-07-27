import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = true 
}) => {
  const dimensions = {
    sm: { box: 'w-8 h-8', text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', text: 'text-base sm:text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-xl sm:text-2xl', sub: 'text-xs' }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon Emblem */}
      <div className={`relative shrink-0 ${dimensions.box} rounded-xl bg-slate-950 p-1 border border-cyan-500/40 shadow-lg shadow-cyan-950/50 flex items-center justify-center group overflow-hidden`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* SVG Graphic - Car + Bubbles + Water Splash Emblem */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full relative z-10 drop-shadow-[0_2px_4px_rgba(0,174,239,0.5)]"
        >
          {/* Foam Bubbles on Top */}
          <circle cx="35" cy="22" r="4" fill="#38bdf8" />
          <circle cx="45" cy="18" r="5" fill="#ffffff" />
          <circle cx="58" cy="20" r="3.5" fill="#38bdf8" />
          <circle cx="68" cy="24" r="4.5" fill="#ffffff" />
          <circle cx="78" cy="30" r="3" fill="#38bdf8" />

          {/* Car Roof & Body Silhouette */}
          <path 
            d="M 25 48 C 30 36, 42 28, 65 30 C 78 31, 88 40, 92 48" 
            stroke="#ffffff" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
          />
          {/* Windows */}
          <path 
            d="M 42 34 L 52 34 C 52 34, 54 44, 52 45 L 38 45 Z" 
            fill="#38bdf8" 
          />
          <path 
            d="M 55 34 L 68 35 C 74 38, 77 43, 78 45 L 55 45 Z" 
            fill="#ffffff" 
          />

          {/* Sleek Lower Body & Swoosh Lines */}
          <path 
            d="M 12 55 C 30 52, 60 48, 90 52 C 94 53, 85 58, 60 58 C 35 58, 18 57, 12 55 Z" 
            fill="#00aeef" 
          />
          <path 
            d="M 58 60 C 70 60, 85 57, 94 54" 
            stroke="#38bdf8" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Bottom Water Splash Arc */}
          <path 
            d="M 32 64 C 38 82, 62 88, 78 72 C 72 80, 52 84, 38 72 C 34 68, 33 65, 32 64 Z" 
            fill="#00aeef" 
          />
          <circle cx="42" cy="68" r="3" fill="#ffffff" />
          <circle cx="52" cy="74" r="3.5" fill="#38bdf8" />
          <circle cx="62" cy="70" r="2.5" fill="#ffffff" />
        </svg>

        {/* Live Status Dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse z-20" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1 font-black tracking-tight font-sans">
            <span className="text-white text-base sm:text-lg">H</span>
            <span className="text-cyan-400 text-base sm:text-lg">R</span>
            <span className="text-slate-200 text-base sm:text-lg ml-0.5 font-extrabold tracking-wider">LAVACAR</span>
          </div>
          <span className={`text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 mt-0.5 ${dimensions.sub}`}>
            Estética Automotiva
          </span>
        </div>
      )}
    </div>
  );
};
