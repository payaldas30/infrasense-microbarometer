import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { SensorProvider } from './context/SensorContext';
import { InstrumentHeader } from './components/prototype/InstrumentHeader';
import { MonitorPanel } from './components/prototype/MonitorPanel';
import { SpectrumPanel } from './components/prototype/SpectrumPanel';
import { SignalProcessingPanel } from './components/prototype/SignalProcessingPanel';
import { SystemArchitecturePanel } from './components/prototype/SystemArchitecturePanel';
import { CalibrationPanel } from './components/prototype/CalibrationPanel';
import { DataAcquisitionPanel } from './components/prototype/DataAcquisitionPanel';
import { ComponentModal } from './components/prototype/ComponentModal';
import { InstrumentFooter } from './components/prototype/InstrumentFooter';

const InstrumentDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('monitor');

  // Scrollspy to detect currently active section
  useEffect(() => {
    const sectionIds = ['monitor', 'spectrum', 'signal', 'system', 'calibration', 'data'];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] dark:bg-[#080c14] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased flex flex-col">
      
      {/* 1. Fixed / Sticky Top Instrument Navigation Header */}
      <InstrumentHeader activeSection={activeSection} />

      {/* Thin technical scanline accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500/20 via-cyan-400 to-cyan-500/20 shadow-sm shadow-cyan-500/30" />

      {/* 2. Main Instrument Canvas Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 py-6 space-y-10">
        
        {/* Anchor Section 1: #monitor (Live Values & Oscilloscope) */}
        <MonitorPanel />

        {/* Anchor Section 2: #spectrum (Spectral Analysis & PSD) */}
        <SpectrumPanel />

        {/* Anchor Section 3: #signal (Digital Filter, Temp Compensation, Wind & Events) */}
        <SignalProcessingPanel />

        {/* Anchor Section 4: #system (Hardware Signal Chain, Pressure Input & Health) */}
        <SystemArchitecturePanel />

        {/* Anchor Section 5: #calibration (Calibration Bench & Validation Checklist) */}
        <CalibrationPanel />

        {/* Anchor Section 6: #data (Recording Bar, Operating Mode & Simulation Sliders) */}
        <DataAcquisitionPanel />

      </main>

      {/* Technical Component Specification Modal */}
      <ComponentModal />

      {/* 3. Compact Instrument Footer */}
      <InstrumentFooter />

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SensorProvider>
        <InstrumentDashboard />
      </SensorProvider>
    </ThemeProvider>
  );
};

export default App;
