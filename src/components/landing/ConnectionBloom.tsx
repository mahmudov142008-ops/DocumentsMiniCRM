import React from 'react';

export const ConnectionBloom: React.FC = () => {
  return (
    <div
      className="connection-bloom-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes bloomBreathe {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.018);
          }
        }

        @keyframes floatGentleLeft {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(-0.5deg);
          }
        }

        @keyframes floatGentleRight {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-5px) rotate(0.6deg);
          }
        }

        @keyframes pulseRipples {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.75;
            transform: scale(1.02);
          }
        }

        .bloom-apex-group {
          transform-origin: 260px 105px;
          animation: bloomBreathe 8s ease-in-out infinite;
        }

        .bloom-left-branch {
          transform-origin: 150px 220px;
          animation: floatGentleLeft 7s ease-in-out infinite;
        }

        .bloom-right-branch {
          transform-origin: 370px 220px;
          animation: floatGentleRight 8.5s ease-in-out infinite;
        }

        .bloom-ripple-pulse {
          transform-origin: 260px 260px;
          animation: pulseRipples 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .bloom-apex-group,
          .bloom-left-branch,
          .bloom-right-branch,
          .bloom-ripple-pulse {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 520 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          overflow: 'visible',
          filter: 'drop-shadow(0 14px 34px rgba(37, 42, 37, 0.07))',
        }}
        aria-label="The Connection Bloom — Symbolic illustration of expanding customer relationships"
        role="img"
      >
        <defs>
          {/* Dimensional Soft Shadow */}
          <filter id="softDepth" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow
              dx="0"
              dy="5"
              stdDeviation="6"
              floodColor="#24392F"
              floodOpacity="0.09"
            />
          </filter>

          <filter id="crispShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="3"
              stdDeviation="3"
              floodColor="#24392F"
              floodOpacity="0.06"
            />
          </filter>

          {/* Canvas Textured Backdrop Pattern */}
          <pattern id="canvasStipple" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="14" cy="14" r="0.6" fill="#69735C" opacity="0.18" />
            <circle cx="2" cy="6" r="0.5" fill="#B49A69" opacity="0.12" />
            <circle cx="22" cy="24" r="0.5" fill="#69735C" opacity="0.14" />
          </pattern>
        </defs>

        {/* 1. ARCHITECTURAL PEDESTAL BACKDROP */}
        <rect
          x="26"
          y="18"
          width="468"
          height="504"
          rx="28"
          fill="#FAF9F5"
          stroke="#E5E1D8"
          strokeWidth="1.5"
        />
        <rect
          x="26"
          y="18"
          width="468"
          height="504"
          rx="28"
          fill="url(#canvasStipple)"
        />

        {/* Framing Inset Hairline with Notches */}
        <rect
          x="42"
          y="34"
          width="436"
          height="472"
          rx="20"
          fill="none"
          stroke="#EBE7DE"
          strokeWidth="1"
          strokeDasharray="6 4"
        />

        {/* Curated Editorial Brand Stamp */}
        <text
          x="58"
          y="56"
          fill="#74766F"
          fontSize="8"
          fontWeight="600"
          letterSpacing="0.14em"
          fontFamily="var(--font-sans)"
        >
          MINICRM
        </text>
        <text
          x="462"
          y="56"
          textAnchor="end"
          fill="#B49A69"
          fontSize="8"
          fontWeight="600"
          letterSpacing="0.12em"
          fontFamily="var(--font-sans)"
        >
          RELATIONSHIP SUITE
        </text>

        {/* 2. HARMONIC CONCENTRIC RIPPLE WAVES (Expanding Relationships) */}
        <g className="bloom-ripple-pulse" opacity="0.5">
          <circle
            cx="260"
            cy="270"
            r="85"
            fill="none"
            stroke="#A3B19B"
            strokeWidth="1"
            strokeDasharray="3 5"
          />
          <circle
            cx="260"
            cy="270"
            r="150"
            fill="none"
            stroke="#B49A69"
            strokeWidth="1"
            strokeDasharray="4 7"
            opacity="0.6"
          />
          <circle
            cx="260"
            cy="270"
            r="215"
            fill="none"
            stroke="#69735C"
            strokeWidth="1"
            strokeDasharray="3 9"
            opacity="0.35"
          />
        </g>

        {/* Fine Radial Coordinate Rays */}
        <line x1="260" y1="50" x2="260" y2="490" stroke="#EBE7DE" strokeWidth="1" strokeDasharray="3 4" />
        <line x1="50" y1="270" x2="470" y2="270" stroke="#EBE7DE" strokeWidth="1" strokeDasharray="3 4" />

        {/* 3. SIGNATURE CALLIGRAPHIC "M" STEM ARCHITECTURE */}
        {/* Foundation Base Pedestal */}
        <path
          d="M 215 478 C 215 464, 305 464, 305 478 Z"
          fill="#24392F"
        />
        <rect
          x="230"
          y="478"
          width="60"
          height="12"
          rx="4"
          fill="#B49A69"
        />
        <circle cx="260" cy="484" r="2.5" fill="#FFFFFF" />

        {/* Central Vertical Rising Spine */}
        <line
          x1="260"
          y1="464"
          x2="260"
          y2="135"
          stroke="#24392F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Accent brass twin wire along spine */}
        <line
          x1="264"
          y1="464"
          x2="264"
          y2="170"
          stroke="#B49A69"
          strokeWidth="1.25"
          strokeDasharray="4 4"
        />

        {/* Left Curving Branch ("M" left arch & shoulder) */}
        <path
          d="M 260 430 C 200 420, 115 350, 115 250 C 115 175, 185 150, 260 270"
          fill="none"
          stroke="#24392F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 256 428 C 198 418, 119 350, 119 252 C 119 180, 186 154, 258 270"
          fill="none"
          stroke="#69735C"
          strokeWidth="1.2"
          strokeDasharray="5 5"
        />

        {/* Right Curving Branch ("M" right arch & shoulder) */}
        <path
          d="M 260 430 C 320 420, 405 350, 405 250 C 405 175, 335 150, 260 270"
          fill="none"
          stroke="#24392F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 264 428 C 322 418, 401 350, 401 252 C 401 180, 334 154, 262 270"
          fill="none"
          stroke="#B49A69"
          strokeWidth="1.2"
          strokeDasharray="5 5"
        />

        {/* 4. LOWER FOLIAGE & OPPORTUNITY PODS */}
        {/* Lower Left Flank: Sage leaf + Terracotta seed */}
        <g filter="url(#crispShadow)">
          {/* Muted Olive & Sage fan leaf */}
          <path
            d="M 125 355 C 80 345, 75 305, 110 295 C 145 285, 155 330, 125 355 Z"
            fill="#A3B19B"
            opacity="0.85"
          />
          <path
            d="M 125 355 C 95 348, 92 318, 115 310"
            fill="none"
            stroke="#24392F"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Terracotta geometric seed droplet */}
          <circle cx="100" cy="305" r="16" fill="#C86D51" />
          <circle cx="100" cy="305" r="7" fill="#F7F5EF" />
          <circle cx="100" cy="305" r="3.5" fill="#24392F" />
        </g>

        {/* Lower Right Flank: Terracotta leaf + Coral seed */}
        <g filter="url(#crispShadow)">
          <path
            d="M 395 355 C 440 345, 445 305, 410 295 C 375 285, 365 330, 395 355 Z"
            fill="#69735C"
            opacity="0.9"
          />
          <path
            d="M 395 355 C 425 348, 428 318, 405 310"
            fill="none"
            stroke="#FAF9F5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Soft Coral blossom disc */}
          <circle cx="420" cy="305" r="16" fill="#E28B73" />
          <circle cx="420" cy="305" r="8" fill="#B49A69" />
          <circle cx="420" cy="305" r="3" fill="#FAF9F5" />
        </g>

        {/* 5. MID-LEVEL CONVERGENCE NODE (The "Heart of Trust") */}
        <g filter="url(#softDepth)">
          {/* Background Olive Anchor Ring */}
          <circle cx="260" cy="270" r="34" fill="#FFFFFF" stroke="#E5E1D8" strokeWidth="1.5" />
          <circle cx="260" cy="270" r="28" fill="#24392F" />
          {/* Overlapping Half-Moon Crescent in Terracotta */}
          <path
            d="M 260 244 A 26 26 0 0 1 260 296 Z"
            fill="#C86D51"
          />
          {/* Overlapping Radiant Brass Quarter Disc */}
          <path
            d="M 260 270 L 260 244 A 26 26 0 0 1 286 270 Z"
            fill="#B49A69"
          />
          {/* Center core ivory pearl */}
          <circle cx="260" cy="270" r="10" fill="#F7F5EF" />
          <circle cx="260" cy="270" r="4.5" fill="#24392F" />
        </g>

        {/* 6. LEFT BLOOM SHOULDER (Initial Discovery & Rapport) */}
        <g className="bloom-left-branch" filter="url(#softDepth)">
          {/* Layered Terracotta & Coral Flower Structure */}
          <circle cx="160" cy="180" r="36" fill="#C86D51" />
          {/* Intersecting Sage Crescent */}
          <path
            d="M 160 144 A 36 36 0 0 1 196 180 L 160 180 Z"
            fill="#A3B19B"
          />
          {/* Inset Deep Forest Green Oval */}
          <ellipse cx="152" cy="180" rx="20" ry="24" fill="#24392F" />
          {/* Concentric Brass Line Ring */}
          <circle cx="152" cy="180" r="15" fill="none" stroke="#B49A69" strokeWidth="1.5" />
          {/* Delicate Coral Stamen Dot */}
          <circle cx="152" cy="180" r="6" fill="#E28B73" />

          {/* Satellite Orbit Dot */}
          <line x1="160" y1="144" x2="140" y2="120" stroke="#69735C" strokeWidth="1.25" strokeDasharray="3 3" />
          <circle cx="140" cy="120" r="7" fill="#B49A69" />
          <circle cx="140" cy="120" r="2.5" fill="#FAF9F5" />
        </g>

        {/* 7. RIGHT BLOOM SHOULDER (Account Cultivation & Velocity) */}
        <g className="bloom-right-branch" filter="url(#softDepth)">
          {/* Layered Soft Coral Disc */}
          <circle cx="360" cy="180" r="36" fill="#E28B73" />
          {/* Intersecting Forest Green Semicircle */}
          <path
            d="M 360 144 A 36 36 0 0 1 360 216 Z"
            fill="#24392F"
          />
          {/* Antique Brass Offset Crescent */}
          <circle cx="368" cy="180" r="22" fill="#B49A69" />
          {/* Muted Olive Inset Center */}
          <circle cx="368" cy="180" r="14" fill="#69735C" />
          <circle cx="368" cy="180" r="5" fill="#F7F5EF" />

          {/* Satellite Orbit Dot */}
          <line x1="360" y1="144" x2="380" y2="120" stroke="#B49A69" strokeWidth="1.25" strokeDasharray="3 3" />
          <circle cx="380" cy="120" r="7" fill="#24392F" />
          <circle cx="380" cy="120" r="2.5" fill="#E28B73" />
        </g>

        {/* 8. THE APEX CROWN (Opportunity Realized — The Master Bloom) */}
        <g className="bloom-apex-group" filter="url(#softDepth)">
          {/* Radiating Opportunity Crown Rays */}
          <g stroke="#B49A69" strokeWidth="1.5" strokeLinecap="round">
            <line x1="260" y1="46" x2="260" y2="34" />
            <line x1="230" y1="56" x2="222" y2="46" />
            <line x1="290" y1="56" x2="298" y2="46" />
            <line x1="208" y1="80" x2="198" y2="74" />
            <line x1="312" y1="80" x2="322" y2="74" />
          </g>

          {/* Deep Forest Green Pedestal Cup */}
          <path
            d="M 220 120 C 220 160, 300 160, 300 120 Z"
            fill="#24392F"
          />

          {/* Main Terracotta Bloom Fan (Vertical Leaf / Petal) */}
          <path
            d="M 260 48 C 228 72, 224 116, 260 124 C 296 116, 292 72, 260 48 Z"
            fill="#C86D51"
          />
          {/* Overlapping Coral Core Leaf */}
          <path
            d="M 260 62 C 242 80, 240 108, 260 118 C 280 108, 278 80, 260 62 Z"
            fill="#E28B73"
          />
          {/* Warm Antique Brass Heart */}
          <circle cx="260" cy="98" r="16" fill="#B49A69" />
          {/* Crisp Ivory & Forest Green Seed Center */}
          <circle cx="260" cy="98" r="8" fill="#FAF9F5" />
          <circle cx="260" cy="98" r="4" fill="#24392F" />

          {/* Flanking Delicate Sage Wings */}
          <path
            d="M 220 120 C 200 110, 195 85, 218 82 C 230 96, 230 112, 220 120 Z"
            fill="#A3B19B"
            opacity="0.85"
          />
          <path
            d="M 300 120 C 320 110, 325 85, 302 82 C 290 96, 290 112, 300 120 Z"
            fill="#69735C"
            opacity="0.85"
          />
        </g>

        {/* 9. SUBTLE REFINED TITLE AT BASE */}
        <text
          x="260"
          y="506"
          textAnchor="middle"
          fill="#69735C"
          fontSize="8"
          fontWeight="600"
          letterSpacing="0.12em"
          fontFamily="var(--font-sans)"
        >
          THE CONNECTION BLOOM
        </text>
      </svg>
    </div>
  );
};
