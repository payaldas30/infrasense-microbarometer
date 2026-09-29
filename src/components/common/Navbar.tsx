import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSensor } from '../../context/SensorContext';
import { Badge } from './Badge';
import {
  Activity, Layers, Sliders, CheckCircle, Cpu, BookOpen,
  Award, Info, Sun, Moon, Menu, X, Settings, Radio
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
  openSettings: () => void;
}

const navLinks = [
  { name: 'Home',        path: '/',            icon: Activity   },
  { name: 'Dashboard',   path: '/dashboard',   icon: Activity   },
  { name: 'Architecture',path: '/architecture',icon: Layers     },
  { name: 'Signal Lab',  path: '/signal-lab',  icon: Sliders    },
  { name: 'Validation',  path: '/validation',  icon: CheckCircle},
  { name: 'Hardware',    path: '/hardware',    icon: Cpu        },
  { name: 'Research',    path: '/research',    icon: BookOpen   },
  { name: 'SIH26144',   path: '/sih26144',    icon: Award      },
  { name: 'About',       path: '/about',       icon: Info       },
];

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate, openSettings }) => {
  const { theme, toggleTheme } = useTheme();
  const { status } = useSensor();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => { navigate(path); setMobileOpen(false); };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-panel/90 backdrop-blur-md border-b border-theme shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <button
            onClick={() => go('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              <Radio className="w-5 h-5 text-cyan-500 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-wider text-t1 group-hover:text-cyan-500 transition-colors">
                  INFRASENSE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 rounded">
                  SIH26144
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-t3 uppercase">MEMS MICROBAROMETER</p>
            </div>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden xl:flex items-center gap-0.5">
            {navLinks.map(link => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-all ${
                    active
                      ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 font-semibold'
                      : 'text-t2 hover:text-t1 hover:bg-card'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* ── Medium screen truncated nav ── */}
          <nav className="hidden lg:flex xl:hidden items-center gap-0.5">
            {navLinks.slice(0, 6).map(link => {
              const active = currentPath === link.path;
              return (
                <button key={link.path} onClick={() => go(link.path)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded transition-all ${
                    active ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30' : 'text-t2 hover:text-t1 hover:bg-card'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Data source badge */}
            <div className="hidden sm:block">
              {status.source === 'simulation'
                ? <Badge type="SIMULATED" size="sm" />
                : <Badge type="SYSTEM ONLINE" size="sm" />
              }
            </div>

            {/* Settings */}
            <button
              onClick={openSettings}
              title="Settings"
              className="p-2 rounded text-t3 hover:text-cyan-500 hover:bg-card border border-transparent hover:border-theme transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              className="p-2 rounded text-t3 hover:text-amber-500 hover:bg-card border border-transparent hover:border-theme transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden p-2 rounded text-t3 hover:text-t1 hover:bg-card"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden bg-panel border-b border-theme px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const active = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => go(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-mono text-left transition-colors ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 font-semibold'
                    : 'text-t2 hover:bg-card hover:text-t1'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-500" />
                {link.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
