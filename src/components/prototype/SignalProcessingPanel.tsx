import React, { useMemo } from 'react';
import { useSensor } from '../../context/SensorContext';
import { FilterType } from '../../types';
import { Badge } from '../common/Badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Sliders, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Zap
} from 'lucide-react';

export const SignalProcessingPanel: React.FC = () => {
  const {
    readings,
    currentReading,
    simParams,
    filterType,
    setFilterType,
    lowerCutoff,
    setLowerCutoff,
    upperCutoff,
    setUpperCutoff,
    applyFilter,
    resetFilter,
    toggleDcRemoval,
    toggleTempCompensation,
    toggleNoiseReduction,
    toggleEnableFft,
    toggleEnablePsd,
    tempDisplayMode,
    setTempDisplayMode,
    latestEvent,
    injectTransientEvent,
    status
  } = useSensor();

  const filterOptions: FilterType[] = ['OFF', 'LOW PASS', 'BAND PASS', 'HIGH PASS'];

  const windLevel = 
    simParams.windDisturbance < 0.25 ? 'LOW' :
    simParams.windDisturbance < 0.65 ? 'MODERATE' : 'HIGH';

  const windLevelColor = 
    windLevel === 'LOW' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    windLevel === 'MODERATE' ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30' :
    'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';

  const chartData = useMemo(() => {
    return readings.slice(-60);
  }, [readings]);

  const thermalCorrelationData = useMemo(() => {
    return readings.slice(-40).map((r, i) => ({
      index: i,
      temperature: r.temperature,
      thermalDrift: r.thermalDriftPa ?? ((r.temperature - 28.6) * 0.85),
      corrected: (r.thermalDriftPa ?? 0) * 0.05,
    }));
  }, [readings]);

  return (
    <section id="signal" className="space-y-6 font-mono">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-t1 tracking-wider uppercase">
            SIGNAL PROCESSING &amp; ENVIRONMENTAL COMPENSATION
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="SIMULATED" size="sm" />
          <span className="text-[11px] text-t3">
            Real-Time Edge DSP Pipeline
          </span>
        </div>
      </div>

      {/* Grid: Signal Processing Controls (Left) + Wind & Infrasonic Event (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Digital Filter & Processing Checkboxes */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-theme">
            <span className="text-xs font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-500" />
              DIGITAL FILTER CONTROLS
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
              4th-Order Butterworth
            </span>
          </div>

          {/* Filter Mode Selector */}
          <div>
            <label className="text-[11px] text-t3 block mb-1.5 font-semibold">FILTER MODE</label>
            <div className="grid grid-cols-4 gap-1.5">
              {filterOptions.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterType(mode)}
                  className={`py-1.5 text-xs rounded-lg border transition-colors ${
                    filterType === mode
                      ? 'bg-cyan-600 border-cyan-500 text-white font-bold shadow-sm'
                      : 'bg-card border-theme text-t3 hover:text-t1 hover:border-theme-sub'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cutoff Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-card rounded-xl border border-theme space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-t3">Lower Cutoff</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-bold">{lowerCutoff.toFixed(3)} Hz</span>
              </div>
              <input 
                type="range"
                min="0.005"
                max="0.5"
                step="0.005"
                value={lowerCutoff}
                onChange={(e) => setLowerCutoff(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
              />
              <span className="text-[9px] text-t3 block text-right">Acoustic HP cutoff</span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-theme space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-t3">Upper Cutoff</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-bold">{upperCutoff.toFixed(1)} Hz</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="30.0"
                step="0.5"
                value={upperCutoff}
                onChange={(e) => setUpperCutoff(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
              />
              <span className="text-[9px] text-t3 block text-right">Infrasonic LP cutoff</span>
            </div>
          </div>

          {/* Apply Filter & Reset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              APPLY FILTER
            </button>
            <button
              onClick={resetFilter}
              className="px-4 py-2 rounded-lg bg-card hover:bg-deep border border-theme text-t2 text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          </div>

          {/* Processing Checkboxes */}
          <div className="pt-2 border-t border-theme">
            <span className="text-[10px] uppercase text-t3 font-semibold block mb-2">
              PROCESSING PIPELINE MODULES
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <button 
                onClick={toggleDcRemoval} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-card text-t2"
              >
                {simParams.dcRemoval ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-t3" />}
                <span>DC Removal</span>
              </button>

              <button 
                onClick={toggleTempCompensation} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-card text-t2"
              >
                {simParams.tempCompensation ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-t3" />}
                <span>Temp Comp</span>
              </button>

              <button 
                onClick={toggleNoiseReduction} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-card text-t2"
              >
                {simParams.noiseReduction ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-t3" />}
                <span>Noise Filter</span>
              </button>

              <button 
                onClick={toggleEnableFft} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-card text-t2"
              >
                {simParams.enableFft ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-t3" />}
                <span>FFT Spectrum</span>
              </button>

              <button 
                onClick={toggleEnablePsd} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded-lg hover:bg-card text-t2"
              >
                {simParams.enablePsd ? <CheckSquare className="w-4 h-4 text-cyan-500" /> : <Square className="w-4 h-4 text-t3" />}
                <span>PSD Periodogram</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Wind Disturbance Monitor + Infrasonic Activity Detector */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Wind-Noise Monitoring Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-theme">
              <div className="flex items-center gap-1.5 text-xs font-bold text-t1">
                <Wind className="w-4 h-4 text-cyan-500" />
                <span>WIND / DISTURBANCE MONITOR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg font-bold text-[10px] border ${windLevelColor}`}>
                  {windLevel} TURBULENCE
                </span>
                <Badge type="SIMULATED" size="sm" />
              </div>
            </div>

            {/* Comparison Chart: Without vs With Wind Filtering */}
            <div className="h-32 w-full bg-deep/50 dark:bg-[#050812] rounded-xl border border-theme p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="timeLabel" tick={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(0)}P`} width={35} tickLine={false} />
                  <Tooltip content={() => null} />
                  <Line 
                    type="monotone" 
                    dataKey="unfilteredWindPressure" 
                    stroke="#f43f5e" 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[10px] pt-1 text-t3">
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Bare Port (No Filter)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Porous Hose Array (-18 dB)
              </span>
            </div>
          </div>

          {/* Infrasonic Activity Detector Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-theme">
              <div className="flex items-center gap-1.5 text-xs font-bold text-t1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>INFRASONIC ACTIVITY</span>
              </div>
              <button
                onClick={injectTransientEvent}
                className="px-2.5 py-1 text-[10px] bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 rounded-lg flex items-center gap-1 transition-colors font-bold"
              >
                <Zap className="w-3 h-3" />
                Inject Test Wavelet
              </button>
            </div>

            {/* Event Status Readout */}
            <div className="p-3 bg-card rounded-xl border border-theme flex items-center justify-between">
              <div>
                <span className="text-[10px] text-t3 block font-semibold">CURRENT ACTIVITY STATUS</span>
                <span className={`text-sm font-bold ${
                  latestEvent && latestEvent.status === 'SIGNAL DETECTED'
                    ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  {latestEvent ? latestEvent.status : 'NO SIGNIFICANT ACTIVITY'}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-t3 block text-[10px]">Peak Frequency</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-bold">{latestEvent?.dominantFreq || 0.043} Hz</span>
              </div>
            </div>

            {/* Event Parameters Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-card rounded-lg border border-theme">
                <span className="text-[10px] text-t3 block">Band Energy</span>
                <span className="text-t1 font-bold">{latestEvent?.bandEnergy || 1.45} Pa²</span>
              </div>
              <div className="p-2 bg-card rounded-lg border border-theme">
                <span className="text-[10px] text-t3 block">Duration</span>
                <span className="text-t1 font-bold">{latestEvent?.durationSec || 2.8} s</span>
              </div>
              <div className="p-2 bg-card rounded-lg border border-theme">
                <span className="text-[10px] text-t3 block">Amplitude</span>
                <span className="text-t1 font-bold">±{latestEvent?.peakAmplitude || 3.82} Pa</span>
              </div>
            </div>

            {/* Mandatory Scientific Disclaimer */}
            <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
              <strong>Notice:</strong> Experimental signal detection based on amplitude thresholding. Does <u>NOT</u> claim to identify earthquakes, explosions, aircraft, or missiles without multi-station spatial array cross-correlation.
            </p>
          </div>
        </div>
      </div>

      {/* Temperature Compensation Section */}
      <div className="p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-t1 tracking-wider uppercase">
                TEMPERATURE COMPENSATION
              </h3>
              <Badge type="SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-t3 mt-0.5">
              Adiabatic thermal variations inside reference volume induce fictitious pressure drift (PV = nRT)
            </p>
          </div>

          {/* Toggle: RAW SIGNAL vs COMPENSATED SIGNAL */}
          <div className="flex items-center gap-1.5 p-1 bg-deep rounded-lg border border-theme text-xs">
            <span className="text-t3 text-[10px] px-2 font-semibold">VIEW:</span>
            <button
              onClick={() => setTempDisplayMode('RAW')}
              className={`px-3 py-1 rounded-md transition-colors ${
                tempDisplayMode === 'RAW'
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-t3 hover:text-t1'
              }`}
            >
              RAW SIGNAL
            </button>
            <button
              onClick={() => setTempDisplayMode('COMPENSATED')}
              className={`px-3 py-1 rounded-md transition-colors ${
                tempDisplayMode === 'COMPENSATED'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-t3 hover:text-t1'
              }`}
            >
              COMPENSATED SIGNAL
            </button>
          </div>
        </div>

        {/* Temperature Compensation Physical Flow Diagram */}
        <div className="p-3 bg-card rounded-xl border border-theme text-xs">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-t2">
            <span className="px-2 py-1 rounded-md bg-deep text-amber-600 dark:text-amber-400 font-semibold">
              Temperature Drift (ΔT)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded-md bg-deep text-rose-600 dark:text-rose-400 font-semibold">
              Sensor Output Variation (ΔP_thermal)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded-md bg-deep text-cyan-600 dark:text-cyan-300 font-bold">
              Compensation Model (α·ΔT)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded-md bg-deep text-emerald-600 dark:text-emerald-400 font-bold">
              Corrected Pressure Signal
            </span>
          </div>
        </div>

        {/* Two Synchronized Graphs: Temperature vs Time & Pressure Drift vs Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Graph 1: Temperature vs Time */}
          <div className="p-3 bg-card rounded-xl border border-theme">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-t2 font-semibold">Temperature vs Time</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{currentReading.temperature.toFixed(2)} °C</span>
            </div>
            <div className="h-44 w-full bg-deep/50 dark:bg-[#050812] rounded-lg border border-theme p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 8, fill: 'var(--t3)' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(1)}°`} width={35} tickLine={false} />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-t3 mt-1 text-right">
              High-resolution 16-bit internal thermometer
            </div>
          </div>

          {/* Graph 2: Pressure Drift vs Temperature */}
          <div className="p-3 bg-card rounded-xl border border-theme">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-t2 font-semibold">Pressure Drift vs Temperature</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                {tempDisplayMode === 'RAW' ? 'Uncorrected: ~0.85 Pa/°C' : 'Residual: < 0.05 Pa'}
              </span>
            </div>
            <div className="h-44 w-full bg-deep/50 dark:bg-[#050812] rounded-lg border border-theme p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={thermalCorrelationData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="temperature" tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(1)}°`} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(1)}P`} width={35} tickLine={false} />
                  <Line 
                    type="monotone" 
                    dataKey={tempDisplayMode === 'RAW' ? 'thermalDrift' : 'corrected'} 
                    stroke={tempDisplayMode === 'RAW' ? '#f43f5e' : '#10b981'} 
                    strokeWidth={2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-t3 mt-1 text-right">
              Mode: {tempDisplayMode === 'RAW' ? 'Raw Thermal Drift' : 'Corrected Output'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
