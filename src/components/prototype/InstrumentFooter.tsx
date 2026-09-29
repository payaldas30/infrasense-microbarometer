import React from 'react';
import { Activity, ShieldCheck, Radio } from 'lucide-react';

export const InstrumentFooter: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 pb-10 border-t border-slate-800/80 bg-[#060a12] text-slate-400 font-mono text-xs">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Brand Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-bold text-white tracking-wider text-sm">
                  INFRASENSE
                </span>
                <span className="text-[10px] text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800">
                  SIH26144 | NTRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                MEMS-Based Infrasound Microbarometer · Prototype Instrument Interface
              </p>
            </div>
          </div>

          {/* Center Specs */}
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="px-2.5 py-1 rounded bg-[#0a1020] border border-slate-800">
              Band: 0.01 – 20 Hz
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0a1020] border border-slate-800">
              Target Cost: ₹8,000 – ₹15,000
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0a1020] border border-slate-800">
              Topology: Differential MEMS
            </span>
          </div>

          {/* Right Status */}
          <div className="text-right text-[11px] text-slate-500">
            <div>Hardware Interface: USB-VCP / WebSocket</div>
            <div className="text-cyan-400">DMA 50 Hz Telemetry Engine</div>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-900 text-center text-[10px] text-slate-500 leading-relaxed max-w-4xl mx-auto">
          Student research prototype. Performance parameters are shown as measured only after experimental validation. Developed for Smart India Hackathon Problem Statement SIH26144 under NTRO.
        </div>
      </div>
    </footer>
  );
};
