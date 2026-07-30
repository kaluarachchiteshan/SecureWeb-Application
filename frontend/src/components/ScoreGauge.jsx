import React from 'react';

export const ScoreGauge = ({ score = 85, size = 160 }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10b981'; // Green
  let glowClass = 'text-glow-green';
  let label = 'SECURE';

  if (score < 40) {
    strokeColor = '#ef4444'; // Red
    glowClass = 'text-glow-red';
    label = 'CRITICAL';
  } else if (score < 65) {
    strokeColor = '#f59e0b'; // Amber
    label = 'WARNING';
  } else if (score < 85) {
    strokeColor = '#3b82f6'; // Blue
    label = 'GOOD';
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293d"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-extrabold tracking-tight ${glowClass}`} style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
};
