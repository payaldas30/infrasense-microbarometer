import React, { useState } from 'react';
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
  RefreshCw,
  Settings
} from 'lucide-react';

interface InstrumentHeaderProps {
  activeSection: string;
  openSettings: () => void;
}

export const InstrumentHeader: React.FC<InstrumentHeaderProps> = ({ activeSection, openSettings }) => {
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
    <header className="sticky top-0 z-40 bg-panel/95 border-b border-theme backdrop-blur-md transition-colors text-t1 font-mono shadow-sm">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Project Brand & Subtitle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold tracking-wider text-t1">
                  INFRASENSE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 rounded font-semibold">
                  SIH26144
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-widest text-t3 uppercase font-semibold">
                MEMS INFRASOUND MICROBAROMETER
              </p>
            </div>
          </div>

          {/* Center: Bandwidth Badge & Anchor Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="px-3 py-1 rounded bg-card border border-cyan-500/30 text-xs text-cyan-600 dark:text-cyan-300 font-semibold tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
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
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                        : 'text-t2 hover:text-t1 hover:bg-card'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Telemetry Status, Hardware Indicator, Settings & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Center Bandwidth on Mobile */}
            <div className="lg:hidden px-2 py-0.5 rounded bg-card border border-cyan-500/30 text-[10px] text-cyan-600 dark:text-cyan-300 font-semibold">
              0.01–20 Hz
            </div>

            {/* Operating Mode Indicator Button */}
            <button
              onClick={toggleSource}
              title="Click to toggle between Simulation Mode and Live Hardware"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono tracking-wider transition-colors ${
                status.source === 'simulation'
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20'
                  : 'bg-emerald-500/15 border-emerald-500/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                status.source === 'simulation' ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500 animate-ping'
              }`} />
              <span className="font-bold hidden xs:inline">
                {status.source === 'simulation' ? 'SIMULATION' : 'LIVE HARDWARE'}
              </span>
              <RefreshCw className="w-3 h-3 text-t3 hover:text-t1" />
            </button>

            {/* STM32 Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-theme text-[11px]">
              <span className="text-t3">STM32:</span>
              <span className={`flex items-center gap-1 font-bold ${
                status.stm32Status === 'CONNECTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status.stm32Status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
                {status.stm32Status}
              </span>
            </div>

            {/* Settings Button */}
            <button
              onClick={openSettings}
              title="Open Instrument & System Settings"
              className="p-2 rounded-lg text-t3 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-card border border-transparent hover:border-theme transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg text-t3 hover:text-amber-500 hover:bg-card border border-transparent hover:border-theme transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-t3 hover:text-t1 rounded-lg hover:bg-card"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-panel border-b border-theme px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs font-mono ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-t2 hover:bg-card hover:text-t1'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-theme flex justify-between items-center text-xs text-t3">
            <span>STM32 MCU Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">● CONNECTED</span>
          </div>
        </div>
      )}
    </header>
  );
};
