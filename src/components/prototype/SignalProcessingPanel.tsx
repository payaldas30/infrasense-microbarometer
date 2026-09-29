import React, { useMemo } from 'react';
import { useSensor } from '../../context/SensorContext';
import { FilterType } from '../../types';
import { Badge } from '../common/Badge';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Sliders, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  ArrowRight,
  ShieldAlert,
  Flame,
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

  // Wind disturbance status calculation
  const windLevel = 
    simParams.windDisturbance < 0.25 ? 'LOW' :
    simParams.windDisturbance < 0.65 ? 'MODERATE' : 'HIGH';

  const windLevelColor = 
    windLevel === 'LOW' ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40' :
    windLevel === 'MODERATE' ? 'text-amber-400 bg-amber-950/60 border-amber-800/40' :
    'text-rose-400 bg-rose-950/60 border-rose-800/40';

  // Sampling for graphs
  const chartData = useMemo(() => {
    const slice = readings.slice(-60);
    return slice;
  }, [readings]);

  // Scatter/correlation data for Temperature vs Pressure Drift
  const thermalCorrelationData = useMemo(() => {
    return readings.slice(-40).map((r, i) => ({
      index: i,
      temperature: r.temperature,
      thermalDrift: r.thermalDriftPa ?? ((r.temperature - 28.6) * 0.85),
      corrected: (r.thermalDriftPa ?? 0) * 0.05,
    }));
  }, [readings]);

  return (
    <section id="signal" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wider">
            SIGNAL PROCESSING &amp; ENVIRONMENTAL COMPENSATION
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="SIMULATED" size="sm" />
          <span className="text-[11px] font-mono text-slate-400">
            Real-Time Edge DSP Pipeline
          </span>
        </div>
      </div>

      {/* Grid: Signal Processing Controls (Left) + Wind & Infrasonic Event (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Digital Filter & Processing Checkboxes */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              DIGITAL FILTER CONTROLS
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              4th-Order Butterworth
            </span>
          </div>

          {/* Filter Mode Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5">FILTER MODE</label>
            <div className="grid grid-cols-4 gap-1.5">
              {filterOptions.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterType(mode)}
                  className={`py-1.5 text-xs font-mono rounded border transition-colors ${
                    filterType === mode
                      ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                      : 'bg-[#0e1726] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Cutoff Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Lower Cutoff</span>
                <span className="text-cyan-300 font-bold">{lowerCutoff.toFixed(3)} Hz</span>
              </div>
              <input 
                type="range"
                min="0.005"
                max="0.5"
                step="0.005"
                value={lowerCutoff}
                onChange={(e) => setLowerCutoff(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded cursor-pointer"
              />
              <span className="text-[9px] font-mono text-slate-500 block text-right">Acoustic HP cutoff</span>
            </div>

            <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-400">Upper Cutoff</span>
                <span className="text-cyan-300 font-bold">{upperCutoff.toFixed(1)} Hz</span>
              </div>
              <input 
                type="range"
                min="1.0"
                max="30.0"
                step="0.5"
                value={upperCutoff}
                onChange={(e) => setUpperCutoff(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 accent-cyan-500 rounded cursor-pointer"
              />
              <span className="text-[9px] font-mono text-slate-500 block text-right">Infrasonic LP cutoff</span>
            </div>
          </div>

          {/* Apply Filter & Reset Buttons */}
          <div className="flex gap-2">
            <button
              onClick={applyFilter}
              className="flex-1 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors shadow-sm shadow-cyan-950"
            >
              APPLY FILTER
            </button>
            <button
              onClick={resetFilter}
              className="px-4 py-2 rounded bg-[#0e1726] hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              RESET
            </button>
          </div>

          {/* Processing Checkboxes */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block mb-2">
              PROCESSING PIPELINE MODULES
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <button 
                onClick={toggleDcRemoval} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {simParams.dcRemoval ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>DC Removal</span>
              </button>

              <button 
                onClick={toggleTempCompensation} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {simParams.tempCompensation ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>Temp Comp</span>
              </button>

              <button 
                onClick={toggleNoiseReduction} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {simParams.noiseReduction ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>Noise Filter</span>
              </button>

              <button 
                onClick={toggleEnableFft} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {simParams.enableFft ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>FFT Spectrum</span>
              </button>

              <button 
                onClick={toggleEnablePsd} 
                className="flex items-center gap-1.5 text-left p-1.5 rounded hover:bg-slate-800/40 text-slate-300"
              >
                {simParams.enablePsd ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4 text-slate-600" />}
                <span>PSD Periodogram</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Wind Disturbance Monitor + Infrasonic Activity Detector */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Wind-Noise Monitoring Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>WIND / DISTURBANCE MONITOR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${windLevelColor}`}>
                  {windLevel} TURBULENCE
                </span>
                <Badge type="SIMULATED" size="sm" />
              </div>
            </div>

            {/* Comparison Chart: Without vs With Wind Filtering */}
            <div className="h-32 w-full bg-[#050812] rounded border border-slate-800 p-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="timeLabel" tick={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v.toFixed(0)}P`} width={35} tickLine={false} />
                  <Tooltip content={() => null} />
                  <Line 
                    type="monotone" 
                    dataKey="unfilteredWindPressure" 
                    stroke="#f43f5e" 
                    strokeWidth={1.2} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#10b981" 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-400">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3 h-0.5 bg-rose-500 inline-block" /> Without Wind Filter (Bare Port)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> With Porous Hose Array (-18 dB)
              </span>
            </div>
          </div>

          {/* Infrasonic Activity Detector Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>INFRASONIC ACTIVITY</span>
              </div>
              <button
                onClick={injectTransientEvent}
                className="px-2 py-0.5 text-[10px] font-mono bg-purple-900/40 hover:bg-purple-900/60 border border-purple-700/50 text-purple-300 rounded flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3 h-3" />
                Inject Test Wavelet
              </button>
            </div>

            {/* Event Status Readout */}
            <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block">CURRENT ACTIVITY STATUS</span>
                <span className={`text-sm font-mono font-bold ${
                  latestEvent && latestEvent.status === 'SIGNAL DETECTED'
                    ? 'text-rose-400 animate-pulse'
                    : 'text-emerald-400'
                }`}>
                  {latestEvent ? latestEvent.status : 'NO SIGNIFICANT ACTIVITY'}
                </span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-slate-400 block text-[10px]">Peak Frequency</span>
                <span className="text-cyan-300 font-bold">{latestEvent?.dominantFreq || 0.043} Hz</span>
              </div>
            </div>

            {/* Event Parameters Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 bg-[#0c1424] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Band Energy</span>
                <span className="text-white font-bold">{latestEvent?.bandEnergy || 1.45} Pa²</span>
              </div>
              <div className="p-2 bg-[#0c1424] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Duration</span>
                <span className="text-white font-bold">{latestEvent?.durationSec || 2.8} s</span>
              </div>
              <div className="p-2 bg-[#0c1424] rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Amplitude</span>
                <span className="text-white font-bold">±{latestEvent?.peakAmplitude || 3.82} Pa</span>
              </div>
            </div>

            {/* Mandatory Scientific Disclaimer */}
            <p className="text-[10px] font-mono text-amber-300/80 leading-relaxed bg-amber-950/20 p-2 rounded border border-amber-900/30">
              <strong>Notice:</strong> Experimental signal detection based on simple amplitude and band energy thresholds. Does <u>NOT</u> claim to identify earthquakes, explosions, aircraft, or missiles without multi-station array cross-correlation and field labeling.
            </p>
          </div>
        </div>
      </div>

      {/* Temperature Compensation Section */}
      <div className="p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold font-mono text-white tracking-wider">
                TEMPERATURE COMPENSATION
              </h3>
              <Badge type="SIMULATED" size="sm" />
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Adiabatic thermal variations inside the sealed reference chamber induce fictitious pressure drift (PV = nRT)
            </p>
          </div>

          {/* Toggle: RAW SIGNAL vs COMPENSATED SIGNAL */}
          <div className="flex items-center gap-1.5 p-1 bg-[#060a14] rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 text-[10px] px-2 font-semibold">VIEW:</span>
            <button
              onClick={() => setTempDisplayMode('RAW')}
              className={`px-3 py-1 rounded transition-colors ${
                tempDisplayMode === 'RAW'
                  ? 'bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              RAW SIGNAL
            </button>
            <button
              onClick={() => setTempDisplayMode('COMPENSATED')}
              className={`px-3 py-1 rounded transition-colors ${
                tempDisplayMode === 'COMPENSATED'
                  ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              COMPENSATED SIGNAL
            </button>
          </div>
        </div>

        {/* Temperature Compensation Physical Flow Diagram */}
        <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-slate-300">
            <span className="px-2 py-1 rounded bg-[#0e1726] border border-amber-800/40 text-amber-300">
              Temperature Drift (ΔT)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded bg-[#0e1726] border border-rose-800/40 text-rose-300">
              Sensor Output Variation (ΔP_thermal)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded bg-[#0e1726] border border-cyan-800/40 text-cyan-300 font-bold">
              Compensation Model (α·ΔT)
            </span>
            <span className="text-cyan-500">→</span>
            <span className="px-2 py-1 rounded bg-[#0e1726] border border-emerald-800/40 text-emerald-300 font-bold">
              Corrected Pressure Signal
            </span>
          </div>
        </div>

        {/* Two Synchronized Graphs: Temperature vs Time & Pressure Drift vs Temperature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Graph 1: Temperature vs Time */}
          <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 font-semibold">Temperature vs Time</span>
              <span className="text-amber-400 font-bold">{currentReading.temperature.toFixed(2)} °C</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 8, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v.toFixed(1)}°`} width={35} tickLine={false} />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 text-right">
              High-resolution 16-bit internal thermometer
            </div>
          </div>

          {/* Graph 2: Pressure Drift vs Temperature */}
          <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 font-semibold">Pressure Drift vs Temperature</span>
              <span className="text-cyan-400 font-bold">
                {tempDisplayMode === 'RAW' ? 'Uncorrected: ~0.85 Pa/°C' : 'Residual: < 0.05 Pa'}
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={thermalCorrelationData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="temperature" tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v.toFixed(1)}°`} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v.toFixed(1)}P`} width={35} tickLine={false} />
                  <Line 
                    type="monotone" 
                    dataKey={tempDisplayMode === 'RAW' ? 'thermalDrift' : 'corrected'} 
                    stroke={tempDisplayMode === 'RAW' ? '#f43f5e' : '#10b981'} 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 text-right">
              Mode: {tempDisplayMode === 'RAW' ? 'Raw Thermal Drift' : 'Corrected Output'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
