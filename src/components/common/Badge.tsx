import React from 'react';

export type BadgeType = 'SIMULATED' | 'MEASURED' | 'TARGET' | 'NOT MEASURED' | 'SYSTEM ONLINE' | 'EXPERIMENTAL' | 'LIVE HARDWARE';

interface BadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, size = 'sm', className = '' }) => {
  const styles: Record<BadgeType, string> = {
    SIMULATED:           'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    MEASURED:            'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 font-semibold',
    'LIVE HARDWARE':     'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 font-bold',
    TARGET:              'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'NOT MEASURED':      'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'SYSTEM ONLINE':     'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
    EXPERIMENTAL:        'bg-violet-500/10 text-violet-400 border-violet-500/30',
  };

  const dotColors: Record<BadgeType, string> = {
    SIMULATED:      'bg-cyan-400 animate-pulse',
    MEASURED:       'bg-emerald-400',
    'LIVE HARDWARE':'bg-emerald-400 animate-ping',
    TARGET:         'bg-amber-400',
    'NOT MEASURED': 'bg-rose-400',
    'SYSTEM ONLINE':'bg-emerald-400 animate-pulse',
    EXPERIMENTAL:   'bg-violet-400',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3 py-1.5 tracking-wider',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono uppercase rounded border ${styles[type]} ${sizeClasses[size]} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[type]}`} />
      {type}
    </span>
  );
};
