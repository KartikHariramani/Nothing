import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Custom Life Share SVG Icon: Interlocking Heart, Blood Drop, and Connected Nodes */}
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-500 text-white shadow-md shadow-brand-500/20 p-1.5 ${iconSizes[size]}`}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Blood Drop & Heart Fusion */}
          <path
            d="M12 2.5C12 2.5 6 9.5 6 14.5C6 17.8137 8.68629 20.5 12 20.5C15.3137 20.5 18 17.8137 18 14.5C18 9.5 12 2.5 12 2.5Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          {/* Pulse Connection Line */}
          <path
            d="M8.5 14.5H10.2L11.2 12.5L12.8 16.5L13.8 14.5H15.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Community Nodes */}
          <circle cx="8.5" cy="14.5" r="1" fill="#FEF2F2" />
          <circle cx="15.5" cy="14.5" r="1" fill="#FEF2F2" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-black tracking-tight text-slate-900 ${textSizes[size]}`}>
            LIFE<span className="text-brand-600">SHARE</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase">
            Connecting People. Mobilising Blood. Saving Lives.
          </span>
        )}
      </div>
    </div>
  );
};
