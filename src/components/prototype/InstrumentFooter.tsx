import React from 'react';
import { Radio } from 'lucide-react';

export const InstrumentFooter: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 pb-10 border-t border-theme bg-panel text-t3 font-mono text-xs transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Brand Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-bold text-t1 tracking-wider text-sm">
                  INFRASENSE
                </span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/30 font-semibold">
                  SIH26144 | NTRO
                </span>
              </div>
              <p className="text-[11px] text-t3">
                MEMS-Based Infrasound Microbarometer · Prototype Instrument Interface
              </p>
            </div>
          </div>

          {/* Center Specs */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-t2 flex-wrap justify-center">
            <span className="px-2.5 py-1 rounded-lg bg-card border border-theme">
              Band: 0.01 – 20 Hz
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-card border border-theme">
              Target Cost: ₹8,000 – ₹15,000
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-card border border-theme">
              Topology: Differential MEMS
            </span>
          </div>

          {/* Right Status */}
          <div className="text-right text-[11px] text-t3">
            <div>Hardware Interface: USB-VCP / WebSocket</div>
            <div className="text-cyan-600 dark:text-cyan-400 font-semibold">DMA 50 Hz Telemetry Engine</div>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="mt-6 pt-4 border-t border-theme-sub text-center text-[10px] text-t3 leading-relaxed max-w-4xl mx-auto">
          Student research prototype. Performance parameters are shown as measured only after experimental validation. Developed for Smart India Hackathon Problem Statement SIH26144 under NTRO.
        </div>
      </div>
    </footer>
  );
};
