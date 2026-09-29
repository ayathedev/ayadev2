import React from 'react';

interface AkornMascotProps {
  size?: number;
  className?: string;
  pose?: 'director' | 'rocker' | 'portrait';
}

export const AkornMascot: React.FC<AkornMascotProps> = ({ 
  size = 120, 
  className = '',
  pose = 'portrait' 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      title="Akorn - Half Cat, Half Squirrel Studio Mascot"
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-[0_15px_30px_rgba(234,88,12,0.35)]"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradients */}
          <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="45%" stopColor="#d97706" />
            <stop offset="85%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          
          <radialGradient id="tailGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#ea580c" />
            <stop offset="80%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </radialGradient>

          <radialGradient id="muzzleGrad" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="80%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </radialGradient>

          {/* Platinum / Silver Chain */}
          <linearGradient id="chainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#cbd5e1" />
            <stop offset="70%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Sunglasses Mirror */}
          <linearGradient id="shadesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Eye Sparkle Gradient */}
          <radialGradient id="eyeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          {/* Ear Pink */}
          <radialGradient id="innerEar" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#f43f5e" />
          </radialGradient>
        </defs>

        {/* --- GIANT FLUFFY SQUIRREL TAIL (Back Layer) --- */}
        <g className="transition-transform duration-500 origin-bottom-right hover:rotate-6">
          <path 
            d="M 115 130 C 135 150, 185 155, 188 105 C 190 65, 165 20, 125 15 C 98 12, 110 45, 120 58 C 135 75, 142 98, 125 120 Z" 
            fill="url(#tailGrad)" 
            stroke="#78350f" 
            strokeWidth="3"
          />
          {/* Tail Fur Strands / Highlights */}
          <path d="M 130 30 C 152 40, 168 70, 162 100" stroke="#fef08a" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <path d="M 142 45 C 160 65, 165 92, 155 115" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M 120 18 C 145 22, 172 45, 175 75" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </g>

        {/* --- CAT EARS --- */}
        {/* Left Cat Ear */}
        <path d="M 45 68 L 26 22 C 38 20, 68 36, 75 56 Z" fill="url(#bodyGrad)" stroke="#78350f" strokeWidth="3" />
        <path d="M 42 60 L 32 30 C 40 30, 58 42, 65 54 Z" fill="url(#innerEar)" opacity="0.9" />

        {/* Right Cat Ear */}
        <path d="M 125 56 C 132 36, 162 20, 174 22 L 155 68 Z" fill="url(#bodyGrad)" stroke="#78350f" strokeWidth="3" />
        <path d="M 135 54 C 142 42, 160 30, 168 30 L 158 60 Z" fill="url(#innerEar)" opacity="0.9" />

        {/* Rocker/Korn style spiky tufts on head */}
        <path d="M 85 45 L 80 20 L 93 38 L 102 15 L 108 38 L 120 22 L 115 45 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />

        {/* --- ROUND CHUBBY HEAD --- */}
        <circle cx="100" cy="98" r="54" fill="url(#bodyGrad)" stroke="#78350f" strokeWidth="3.5" />
        {/* Head highlight 3D sheen */}
        <ellipse cx="85" cy="65" rx="24" ry="12" fill="#fff" opacity="0.22" transform="rotate(-15 85 65)" />

        {/* Squirrel cheek puffs (extra round & fluffy) */}
        <ellipse cx="62" cy="112" rx="20" ry="16" fill="url(#bodyGrad)" />
        <ellipse cx="138" cy="112" rx="20" ry="16" fill="url(#bodyGrad)" />

        {pose === 'director' ? (
          /* Director / Akon Style Cool Aviators */
          <g>
            {/* Sunglasses Bridge */}
            <path d="M 90 92 L 110 92" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
            <path d="M 88 88 L 112 88" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            {/* Left Lens */}
            <rect x="52" y="82" width="40" height="28" rx="8" fill="url(#shadesGrad)" stroke="#0f172a" strokeWidth="3" />
            <path d="M 58 87 L 86 87" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            {/* Right Lens */}
            <rect x="108" y="82" width="40" height="28" rx="8" fill="url(#shadesGrad)" stroke="#0f172a" strokeWidth="3" />
            <path d="M 114 87 L 142 87" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          </g>
        ) : (
          /* Big Expressive Cute Anime Eyes */
          <g>
            {/* Left Eye */}
            <ellipse cx="76" cy="94" rx="14" ry="17" fill="#0f172a" />
            <ellipse cx="76" cy="94" rx="11" ry="14" fill="url(#eyeGrad)" />
            <circle cx="72" cy="88" r="5" fill="#fff" />
            <circle cx="80" cy="100" r="2.5" fill="#fff" />

            {/* Right Eye */}
            <ellipse cx="124" cy="94" rx="14" ry="17" fill="#0f172a" />
            <ellipse cx="124" cy="94" rx="11" ry="14" fill="url(#eyeGrad)" />
            <circle cx="120" cy="88" r="5" fill="#fff" />
            <circle cx="128" cy="100" r="2.5" fill="#fff" />
          </g>
        )}

        {/* --- MUZZLE & CAT WHISKERS --- */}
        {/* Cute Cream Muzzle */}
        <ellipse cx="100" cy="116" rx="20" ry="14" fill="url(#muzzleGrad)" stroke="#d97706" strokeWidth="1.5" />
        
        {/* Tiny Pink Cat Nose */}
        <polygon points="94,110 106,110 100,116" fill="#f43f5e" stroke="#be123c" strokeWidth="1" />
        
        {/* Cat Smile */}
        <path d="M 94 118 Q 100 124 100 117 Q 100 124 106 118" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Whiskers */}
        <path d="M 44 110 L 18 106 M 42 116 L 16 118 M 44 122 L 20 128" stroke="#78350f" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
        <path d="M 156 110 L 182 106 M 158 116 L 184 118 M 156 122 L 180 128" stroke="#78350f" strokeWidth="2" strokeLinecap="round" opacity="0.75" />

        {/* --- BODY / CHEST --- */}
        <path d="M 72 144 C 65 170, 60 188, 55 198 L 145 198 C 140 188, 135 170, 128 144 Z" fill="url(#bodyGrad)" stroke="#78350f" strokeWidth="3" />
        {/* Fluffy White Chest Fur */}
        <path d="M 85 146 Q 100 178 100 188 Q 100 178 115 146 Z" fill="url(#muzzleGrad)" />

        {/* --- AKON-STYLE PLATINUM BLING CHAIN WITH ACORN MEDALLION --- */}
        <path d="M 76 142 Q 100 168 124 142" stroke="url(#chainGrad)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M 76 142 Q 100 168 124 142" stroke="#fff" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" fill="none" />
        {/* Medallion: Stylized Acorn Pendant with 'A' */}
        <g transform="translate(90, 155)">
          <path d="M 4 2 Q 10 -2 16 2 L 17 6 Q 10 18 3 6 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
          <path d="M 3 2 Q 10 -2 17 2 L 18 4 L 2 4 Z" fill="#78350f" />
          <circle cx="10" cy="8" r="7" fill="url(#chainGrad)" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="7" y="11" fill="#0f172a" fontSize="8" fontWeight="900" fontFamily="sans-serif">A</text>
        </g>

        {/* Mini Rocker Piercing on Left Cat Ear */}
        <circle cx="34" cy="24" r="3" fill="none" stroke="url(#chainGrad)" strokeWidth="2" />
        <circle cx="28" cy="32" r="3" fill="none" stroke="#fbbf24" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default AkornMascot;
