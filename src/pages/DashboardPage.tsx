import React, { useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { Badge } from '../components/common/Badge';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  Play, Pause, Square, RotateCcw, Download, FileJson, Zap, Thermometer,
  Activity, Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock, FileText, TrendingUp
} from 'lucide-react';
import { ReportModal } from '../components/common/ReportModal';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-theme-sub rounded p-2 text-xs font-mono shadow-xl">
        <p className="text-t3 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-cyan-600 dark:text-cyan-300 font-semibold">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PSDTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { frequency: number } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-panel border border-theme-sub rounded p-2 text-xs font-mono shadow-xl">
        <p className="text-t3">f = {payload[0].payload.frequency.toFixed(3)} Hz</p>
        <p className="text-cyan-600 dark:text-cyan-300 font-semibold">PSD: {payload[0].value.toFixed(1)} dB/Hz</p>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC = () => {
  const {
    readings, currentReading, psdData, status, stats,
    isAcquiring, isPaused,
    startAcquisition, stopAcquisition, togglePause, clearBuffer,
    timeWindow, setTimeWindow,
    exportCSV, exportJSON,
    detectedEvents, triggerTransientEvent, simParams, updateSimParams
  } = useSensor();

  const [reportOpen, setReportOpen] = useState(false);
  const [showSimControls, setShowSimControls] = useState(false);
  const [psdScale, setPsdScale] = useState<'linear' | 'log'>('log');

  const isOnline = status.source === 'simulation' || status.stm32Status === 'ONLINE';

  const metricsCards = [
    {
      label: 'Current Pressure Variation',
      value: `${currentReading.pressure >= 0 ? '+' : ''}${currentReading.pressure.toFixed(4)} Pa`,
      sub: 'Differential ΔP',
      color: 'text-cyan-300',
      icon: Activity,
    },
    {
      label: 'Temperature',
      value: `${currentReading.temperature.toFixed(2)} °C`,
      sub: 'Reference Chamber',
      color: 'text-amber-300',
      icon: Thermometer,
    },
    {
      label: 'Dominant Frequency',
      value: `${stats.dominantFreq.toFixed(3)} Hz`,
      sub: 'Primary Infrasound',
      color: 'text-teal-700 dark:text-teal-300',
      icon: TrendingUp,
    },
    {
      label: 'Signal RMS',
      value: `${stats.rmsValue.toFixed(4)} Pa`,
      sub: 'Fluctuation RMS',
      color: 'text-t2',
      icon: Activity,
    },
    {
      label: 'Noise Estimate',
      value: `${stats.noiseFloor.toFixed(4)} Pa RMS`,
      sub: 'Estimated floor',
      color: 'text-t3',
      icon: Zap,
    },
    {
      label: 'Sampling Rate',
      value: `${status.samplingRate} Hz`,
      sub: 'Fixed acquisition rate',
      color: 'text-cyan-600 dark:text-cyan-400',
      icon: Clock,
    },
  ];

  const healthItems = [
    { name: 'MEMS SENSOR', value: status.memsStatus, ok: status.memsStatus === 'CONNECTED' },
    { name: 'TEMPERATURE', value: status.tempSensorStatus, ok: status.tempSensorStatus === 'CONNECTED' },
    { name: 'ADC STATUS', value: status.adcStatus, ok: status.adcStatus === 'READY' || status.adcStatus === 'SAMPLING' },
    { name: 'STM32 MCU', value: status.stm32Status, ok: status.stm32Status === 'ONLINE' },
    { name: 'DATA STREAM', value: isAcquiring && !isPaused ? 'ACTIVE' : isPaused ? 'PAUSED' : 'IDLE', ok: isAcquiring && !isPaused },
    { name: 'SIGNAL SAT.', value: status.signalSaturation ? 'SATURATED!' : 'CLEAR', ok: !status.signalSaturation },
    { name: 'NOISE FLOOR', value: stats.noiseFloor < 0.05 ? 'NOMINAL' : 'ELEVATED', ok: stats.noiseFloor < 0.05 },
    { name: 'DATA PACKETS', value: `${status.dataPacketRate} pkt/s`, ok: true },
  ];

  const eventStatusColor: Record<string, string> = {
    'NORMAL': 'text-emerald-400',
    'LOW-FREQUENCY DISTURBANCE': 'text-amber-400',
    'POSSIBLE EVENT': 'text-rose-400',
  };

  const displayedReadings = readings.slice(-300);
  const displayedPSD = psdScale === 'log'
    ? psdData
    : psdData.map(p => ({ ...p, frequency: p.frequency }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-t1 font-mono tracking-wide">
            Live Infrasound Monitoring
          </h1>
          <p className="text-xs text-t3 font-mono mt-1">
            Problem Statement SIH26144 · NTRO · 0.01–20 Hz Infrasonic Surveillance
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {status.source === 'simulation' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-500/10/60 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              SIMULATION MODE
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10/60 border border-emerald-500/40 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE HARDWARE
            </div>
          )}
          <button
            onClick={() => setReportOpen(true)}
            className="px-3 py-1.5 rounded bg-card border border-theme-sub text-xs font-mono text-t2 hover:text-t1 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Report
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="p-4 rounded-lg bg-panel border border-theme flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-t3 leading-tight">
                  {card.label}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-600" />
              </div>
              <div className={`text-base font-bold font-mono ${card.color}`}>{card.value}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-t3/80 font-mono">{card.sub}</span>
                <Badge type="SIMULATED" size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Controls Row */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-card rounded-lg border border-theme">
        <span className="text-xs font-mono text-t3 uppercase tracking-wider mr-2">CONTROLS:</span>
        <button
          onClick={isAcquiring ? stopAcquisition : startAcquisition}
          className={`px-3 py-1.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-colors ${
            isAcquiring
              ? 'bg-rose-900/40 border-rose-700/60 text-rose-300 hover:bg-rose-900/60'
              : 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
          }`}
        >
          {isAcquiring ? <><Square className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5" /> Start</>}
        </button>
        <button
          onClick={togglePause}
          disabled={!isAcquiring}
          className="px-3 py-1.5 rounded text-xs font-mono bg-amber-900/30 border border-amber-700/50 text-amber-300 hover:bg-amber-900/50 flex items-center gap-1.5 disabled:opacity-40 transition-colors"
        >
          <Pause className="w-3.5 h-3.5" /> {isPaused ? 'Resume' : 'Pause'}
        </button>
        <button
          onClick={clearBuffer}
          className="px-3 py-1.5 rounded text-xs font-mono bg-card border border-theme-sub text-t2 hover:text-t1 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <button
          onClick={triggerTransientEvent}
          className="px-3 py-1.5 rounded text-xs font-mono bg-purple-900/30 border border-purple-700/50 text-purple-700 dark:text-purple-300 hover:bg-purple-900/50 flex items-center gap-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" /> Inject Event
        </button>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] font-mono text-t3/80">WINDOW:</span>
          {(['1m', '5m', '15m', '1h'] as const).map(w => (
            <button
              key={w}
              onClick={() => setTimeWindow(w)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors ${
                timeWindow === w
                  ? 'bg-cyan-600/30 border-cyan-500/60 text-cyan-300'
                  : 'bg-card border-theme-sub text-t3 hover:text-t1'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          className="px-3 py-1.5 rounded text-xs font-mono bg-card border border-theme-sub text-t2 hover:text-t1 flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
        <button
          onClick={exportJSON}
          className="px-3 py-1.5 rounded text-xs font-mono bg-card border border-theme-sub text-t2 hover:text-t1 flex items-center gap-1.5 transition-colors"
        >
          <FileJson className="w-3.5 h-3.5" /> JSON
        </button>
      </div>

      {/* Live Waveform + Sensor Health (2-column) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Pressure Waveform - spans 2 cols */}
        <div className="xl:col-span-2 bg-card border border-theme rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono text-t1">Pressure vs Time</h3>
              <p className="text-[11px] text-t3 font-mono mt-0.5">
                Differential pressure fluctuation · Raw signal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge type="SIMULATED" size="sm" />
              <span className="text-[10px] font-mono text-t3/80">Data source: Simulation Engine</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedReadings} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="pressureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="timeLabel"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  interval="preserveStartEnd"
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  tickFormatter={(v) => `${v.toFixed(2)} Pa`}
                  width={65}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="pressure"
                  name="ΔP (Pa)"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  fill="url(#pressureGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="filteredPressure"
                  name="Filtered ΔP (Pa)"
                  stroke="#10b981"
                  strokeWidth={1}
                  fill="none"
                  strokeDasharray="4 2"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-mono text-t3">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Raw Pressure (Pa)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed" /> Filtered (0.01–20 Hz)</span>
          </div>
        </div>

        {/* Sensor Health Panel */}
        <div className="bg-card border border-theme rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-mono text-t1">Sensor Health</h3>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="space-y-2.5">
            {healthItems.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-deep border border-theme/60">
                <span className="text-t2 tracking-wide">{item.name}</span>
                <span className={`flex items-center gap-1.5 font-semibold ${item.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-2 bg-cyan-500/10/30 border border-cyan-800/30 rounded text-[10px] font-mono text-cyan-300">
            All sensor diagnostics are currently synthetic. Connect STM32 hardware via WebSocket to receive live status.
          </div>
        </div>
      </div>

      {/* PSD + Temperature (2-column) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Power Spectral Density */}
        <div className="bg-card border border-theme rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono text-t1">Power Spectral Density</h3>
              <p className="text-[11px] text-t3 font-mono mt-0.5">
                0.01–20 Hz · Simulated PSD (Pa²/Hz) in dB
              </p>
            </div>
            <div className="flex gap-1 items-center">
              <Badge type="SIMULATED" size="sm" />
              <button
                onClick={() => setPsdScale(s => s === 'log' ? 'linear' : 'log')}
                className="ml-2 px-2.5 py-1 rounded text-[10px] font-mono bg-card border border-theme-sub text-t2 hover:text-t1"
              >
                {psdScale === 'log' ? 'Log-X' : 'Linear-X'}
              </button>
            </div>
          </div>

          {/* Highlight band label */}
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
            <span className="w-3 h-1 bg-cyan-500/30 border border-cyan-500/50 rounded inline-block" />
            Target Measurement Band: 0.01–20 Hz
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayedPSD} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="psdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="frequency"
                  tickFormatter={(v) => `${v.toFixed(2)}`}
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  label={{ value: 'Frequency (Hz)', position: 'insideBottomRight', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  tickFormatter={(v) => `${v}dB`}
                  width={55}
                  tickLine={false}
                />
                <Tooltip content={<PSDTooltip />} />
                <Area
                  type="monotone"
                  dataKey="power"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  fill="url(#psdGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[10px] text-t3/80 font-mono">
            Note: Spectral peaks shown are algorithmically generated from the simulation engine. No physical measurement implied.
          </div>
        </div>

        {/* Temperature vs Time */}
        <div className="bg-card border border-theme rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono text-t1">Temperature vs Time</h3>
              <p className="text-[11px] text-t3 font-mono mt-0.5">
                Reference chamber thermal monitor · °C
              </p>
            </div>
            <Badge type="SIMULATED" size="sm" />
          </div>

          {/* Stat Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-xs font-mono">
            <div className="p-2 bg-deep rounded border border-theme text-center">
              <span className="text-t3 block text-[10px]">CURRENT</span>
              <span className="text-amber-300 font-bold">{currentReading.temperature.toFixed(2)} °C</span>
            </div>
            <div className="p-2 bg-deep rounded border border-theme text-center">
              <span className="text-t3 block text-[10px]">AVG</span>
              <span className="text-t2 font-bold">{stats.avgTemp.toFixed(2)} °C</span>
            </div>
            <div className="p-2 bg-deep rounded border border-theme text-center">
              <span className="text-t3 block text-[10px]">RANGE</span>
              <span className="text-t2 font-bold">{stats.minTemp.toFixed(1)}–{stats.maxTemp.toFixed(1)} °C</span>
            </div>
          </div>

          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedReadings} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="timeLabel" tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }} interval="preserveStartEnd" tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(1)}°`} width={40} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Simulation Controls (expandable) */}
      <div className="bg-card border border-theme rounded-xl overflow-hidden">
        <button
          onClick={() => setShowSimControls(s => !s)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-mono text-t2 hover:text-t1 hover:bg-card/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Simulation Parameters — Adjust synthetic infrasound signal properties
          </span>
          <span className={`transition-transform ${showSimControls ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showSimControls && (
          <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: 'Signal Amplitude (Pa)', key: 'signalAmplitude', min: 0.01, max: 0.5, step: 0.01 },
              { label: 'Primary Frequency (Hz)', key: 'primaryFrequency', min: 0.01, max: 5, step: 0.01 },
              { label: 'Noise Level (Pa RMS)', key: 'noiseLevel', min: 0.001, max: 0.1, step: 0.001 },
              { label: 'Wind Turbulence (0–1)', key: 'windTurbulence', min: 0, max: 1, step: 0.05 },
              { label: 'Temp Drift (°C/hr)', key: 'temperatureDrift', min: -1, max: 1, step: 0.05 },
            ].map(({ label, key, min, max, step }) => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-mono text-t3 uppercase tracking-wider">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={min} max={max} step={step}
                    value={(simParams as unknown as Record<string, number>)[key]}
                    onChange={(e) => updateSimParams({ [key]: parseFloat(e.target.value) })}
                    className="flex-1 accent-cyan-500 h-1.5"
                  />
                  <span className="text-cyan-300 font-mono text-[11px] w-12 text-right">
                    {(simParams as unknown as Record<string, number>)[key].toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 text-[11px] font-mono text-t2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simParams.windFilterEnabled}
                  onChange={(e) => updateSimParams({ windFilterEnabled: e.target.checked })}
                  className="accent-cyan-500"
                />
                Wind Filter ON
              </label>
              <label className="flex items-center gap-2 text-[11px] font-mono text-t2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simParams.enableMultiTone}
                  onChange={(e) => updateSimParams({ enableMultiTone: e.target.checked })}
                  className="accent-cyan-500"
                />
                Multi-tone
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Event Detection Panel */}
      <div className="bg-card border border-theme rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono text-t1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Infrasonic Event Detector
            </h3>
            <p className="text-[11px] text-t3 font-mono mt-0.5">
              Rule-based amplitude/energy threshold detection · <Badge type="EXPERIMENTAL" size="sm" className="ml-1" />
            </p>
          </div>
          <div className="text-xs font-mono text-amber-400 bg-amber-500/10/40 border border-amber-800/40 px-2 py-1 rounded">
            Experimental — Threshold-Based Only
          </div>
        </div>
        <p className="text-[11px] text-t3/80 font-mono mb-4">
          ⚠ This feature uses simple amplitude thresholding and frequency-band energy. It does NOT identify explosion type, origin, or range. Not validated with labeled field data.
        </p>

        {detectedEvents.length === 0 ? (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 p-3 bg-emerald-500/10/30 border border-emerald-800/30 rounded">
            <CheckCircle2 className="w-4 h-4" />
            NORMAL — No anomalous infrasonic energy detected in current window.
          </div>
        ) : (
          <div className="space-y-2">
            {detectedEvents.slice(0, 5).map((ev) => (
              <div key={ev.id} className="flex flex-wrap items-center gap-3 p-2.5 bg-deep rounded border border-theme text-xs font-mono">
                <span className={`font-bold ${eventStatusColor[ev.status] || 'text-t2'}`}>
                  ● {ev.status}
                </span>
                <span className="text-t3">f = {ev.dominantFreq.toFixed(3)} Hz</span>
                <span className="text-t3">Peak = {ev.peakAmplitude.toFixed(4)} Pa</span>
                <span className="text-t3">Duration ≈ {ev.durationSec.toFixed(1)}s</span>
                <span className="text-t3/80">Confidence = {(ev.confidence * 100).toFixed(0)}% (Simulation)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
