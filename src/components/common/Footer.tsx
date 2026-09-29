import React from 'react';
import { Activity, Shield } from 'lucide-react';

interface FooterProps { navigate: (path: string) => void; }

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const links = [
    ['Dashboard', '/dashboard'], ['Architecture', '/architecture'],
    ['Signal Lab', '/signal-lab'], ['Validation', '/validation'],
    ['Hardware', '/hardware'], ['Research', '/research'],
    ['SIH26144', '/sih26144'], ['About', '/about'],
  ];

  return (
    <footer className="bg-deep border-t border-theme text-t3 py-10 mt-16 font-mono text-xs no-print transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-t1">
              <Activity className="w-5 h-5 text-cyan-500" />
              <span className="font-bold text-base tracking-wider">INFRASENSE</span>
            </div>
            <p className="text-cyan-500 font-semibold text-[11px]">MEMS-Based Infrasound Microbarometer</p>
            <p className="text-t3 text-[11px] leading-relaxed max-w-xs">
              A low-cost MEMS differential-pressure platform for 0.01–20 Hz atmospheric infrasound detection, characterization and real-time DSP analysis.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['SIH26144', 'NTRO', 'Smart India Hackathon'].map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-card border border-theme text-[10px] text-t2">{tag}</span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-t1 font-bold uppercase tracking-wider text-[11px] mb-3">Platform Modules</h4>
            <ul className="space-y-2">
              {links.slice(0, 4).map(([label, path]) => (
                <li key={path}>
                  <button onClick={() => navigate(path)} className="hover:text-cyan-500 transition-colors text-t3">{label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-t1 font-bold uppercase tracking-wider text-[11px] mb-3">Documentation</h4>
            <ul className="space-y-2">
              {links.slice(4).map(([label, path]) => (
                <li key={path}>
                  <button onClick={() => navigate(path)} className="hover:text-cyan-500 transition-colors text-t3">{label}</button>
                </li>
              ))}
              <li className="pt-2 flex items-center gap-1.5 text-t3">
                <Shield className="w-3.5 h-3.5 text-cyan-500" />
                Defense &amp; Atmospheric Intelligence
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-t3">
          <p>Student research prototype — experimental results subject to ongoing validation. Not an official NTRO product.</p>
          <p className="flex items-center gap-2 shrink-0">
            <span>Band: 0.01–20 Hz</span>
            <span>·</span>
            <span>Target: ₹8k–₹15k</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
