import React, { useState, useEffect } from 'react';
import { useSensor } from '../../context/SensorContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Radio, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Activity, 
  Layers, 
  Sliders, 
  Cpu, 
  CheckCircle, 
  Database,
  RefreshCw
} from 'lucide-react';

interface InstrumentHeaderProps {
  activeSection: string;
}

export const InstrumentHeader: React.FC<InstrumentHeaderProps> = ({ activeSection }) => {
  const { status, toggleSource } = useSensor();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'spectrum', label: 'Spectrum', icon: Sliders },
    { id: 'signal', label: 'Signal', icon: Layers },
    { id: 'system', label: 'System', icon: Cpu },
    { id: 'calibration', label: 'Calibration', icon: CheckCircle },
    { id: 'data', label: 'Data', icon: Database },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -70; // Header height offset
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/95 dark:bg-[#080c14]/95 border-b border-cyan-500/20 backdrop-blur-md transition-colors text-slate-100 font-mono shadow-md">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Project Brand & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-950">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-white">
                  INFRASENSE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-950/60 text-cyan-400 border border-cyan-700/50 rounded">
                  SIH26144
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-widest text-slate-400 uppercase">
                MEMS INFRASOUND MICROBAROMETER
              </p>
            </div>
          </div>

          {/* Center: Bandwidth Badge & Anchor Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="px-3 py-1 rounded bg-[#0e1726] border border-cyan-500/30 text-xs text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>0.01 – 20 Hz</span>
            </div>

            {/* Sticky Anchor Links */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Connection Status & Hardware Indicator & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Center Bandwidth on Mobile */}
            <div className="lg:hidden px-2 py-0.5 rounded bg-[#0e1726] border border-cyan-500/30 text-[10px] text-cyan-300 font-semibold">
              0.01–20 Hz
            </div>

            {/* Mode Indicator Button */}
            <button
              onClick={toggleSource}
              title="Click to toggle between Simulation Mode and Live Hardware"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono tracking-wider transition-colors ${
                status.source === 'simulation'
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50'
                  : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                status.source === 'simulation' ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400 animate-ping'
              }`} />
              <span className="font-bold">
                {status.source === 'simulation' ? 'SIMULATION' : 'LIVE HARDWARE'}
              </span>
              <RefreshCw className="w-3 h-3 ml-1 text-slate-400 hover:text-white" />
            </button>

            {/* STM32 Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0c1422] border border-slate-800 text-[11px]">
              <span className="text-slate-400">STM32:</span>
              <span className={`flex items-center gap-1 font-bold ${
                status.stm32Status === 'CONNECTED' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status.stm32Status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-rose-500'
                }`} />
                {status.stm32Status}
              </span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1424] border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left text-xs font-mono ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>STM32 MCU:</span>
            <span className="text-emerald-400 font-bold">● CONNECTED</span>
          </div>
        </div>
      )}
    </header>
  );
};
