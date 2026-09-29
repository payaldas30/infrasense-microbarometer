import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { 
  Database, 
  Circle, 
  Square, 
  Pause, 
  Play, 
  FileJson, 
  FileSpreadsheet, 
  Sliders
} from 'lucide-react';

export const DataAcquisitionPanel: React.FC = () => {
  const {
    isRecording,
    recordingDurationSeconds,
    startRecording,
    stopRecording,
    exportCSV,
    exportJSON,
    status,
    setSource,
    simParams,
    updateSimParams,
    isPaused,
    togglePause,
  } = useSensor();

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <section id="data" className="space-y-6 font-mono">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-t1 tracking-wider uppercase">
            DATA ACQUISITION &amp; OPERATING MODE
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-t3">
            Sampling: {status.samplingRate} Hz DMA Stream
          </span>
        </div>
      </div>

      {/* 1. Operating Mode Warning & Selector Banner */}
      <div className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-sm ${
        status.source === 'simulation'
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : 'bg-emerald-500/10 border-emerald-500/30'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                status.source === 'simulation' ? 'bg-cyan-500 animate-pulse' : 'bg-emerald-500 animate-ping'
              }`} />
              <span className="text-sm font-bold tracking-wider text-t1">
                {status.source === 'simulation'
                  ? 'SIMULATION MODE — DATA IS SYNTHETIC'
                  : 'LIVE HARDWARE — STM32 DATA STREAM ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-t2 mt-1">
              {status.source === 'simulation'
                ? 'Synthesizing physics-based 0.01–20 Hz multi-harmonic infrasound, 1/f atmospheric noise, and wind bursts.'
                : 'Streaming real-time 50 Hz differential pressure packets over USB-VCP / WebSocket bridge from STM32F4.'}
            </p>
          </div>

          {/* Operating Mode Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setSource('simulation')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                status.source === 'simulation'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                  : 'bg-panel border-theme text-t3 hover:text-t1'
              }`}
            >
              SIMULATION
            </button>
            <button
              onClick={() => setSource('hardware')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                status.source === 'hardware'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'bg-panel border-theme text-t3 hover:text-t1'
              }`}
            >
              LIVE HARDWARE
            </button>
          </div>
        </div>
      </div>

      {/* 2. Data Acquisition Control Bar */}
      <div className="p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme">
          <div>
            <span className="text-xs font-bold text-t1 uppercase tracking-wider block">
              DATA ACQUISITION CONTROLLER
            </span>
            <span className="text-[10px] text-t3">
              Record timestamped measurement packets for calibration analysis
            </span>
          </div>

          {/* Live Recording Status Badge & Timer */}
          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>RECORDING IN PROGRESS</span>
                <span className="text-t1 ml-1 font-mono">Duration: {formatDuration(recordingDurationSeconds)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-t3 px-3 py-1.5 rounded-lg bg-deep border border-theme">
                <span className="w-2 h-2 rounded-full bg-t3" />
                <span>STANDBY — NOT RECORDING</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Circle className="w-3.5 h-3.5 fill-white" />
              <span>START RECORDING</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>STOP RECORDING</span>
            </button>
          )}

          <button
            onClick={togglePause}
            className="px-4 py-2.5 rounded-lg bg-card hover:bg-deep border border-theme text-t1 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-lg bg-card hover:bg-deep border border-theme text-cyan-600 dark:text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors ml-auto"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={exportJSON}
            className="px-4 py-2.5 rounded-lg bg-card hover:bg-deep border border-theme text-cyan-600 dark:text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>EXPORT JSON</span>
          </button>
        </div>

        <div className="text-[10px] text-t3">
          CSV/JSON export schema: <code>timestamp</code>, <code>pressure</code>, <code>temperature</code>, <code>filteredPressure</code>, <code>signalRMS</code>, <code>dominantFrequency</code>, <code>noiseLevel</code>.
        </div>
      </div>

      {/* 3. Physics Simulation Parameter Tuning Sliders (Instrument Style) */}
      <div className="p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-theme">
          <span className="text-xs font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-500" />
            SYNTHETIC BENCH GENERATOR CONTROLS
          </span>
          <span className="text-[10px] text-t3">
            Real-time physical waveform synthesizer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Signal Amplitude */}
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <div className="flex justify-between">
              <span className="text-t3">Amplitude</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{simParams.signalAmplitude.toFixed(2)} Pa</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="15.0"
              step="0.25"
              value={simParams.signalAmplitude}
              onChange={(e) => updateSimParams({ signalAmplitude: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
            />
            <span className="text-[9px] text-t3 block">Peak-to-peak signal</span>
          </div>

          {/* Frequency */}
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <div className="flex justify-between">
              <span className="text-t3">Primary Freq</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{simParams.primaryFrequency.toFixed(3)} Hz</span>
            </div>
            <input 
              type="range"
              min="0.01"
              max="2.5"
              step="0.005"
              value={simParams.primaryFrequency}
              onChange={(e) => updateSimParams({ primaryFrequency: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
            />
            <span className="text-[9px] text-t3 block">Carrier frequency</span>
          </div>

          {/* Noise Level */}
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <div className="flex justify-between">
              <span className="text-t3">Noise Level</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{simParams.noiseLevel.toFixed(2)} Pa</span>
            </div>
            <input 
              type="range"
              min="0.1"
              max="3.0"
              step="0.05"
              value={simParams.noiseLevel}
              onChange={(e) => updateSimParams({ noiseLevel: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
            />
            <span className="text-[9px] text-t3 block">1/f + white noise</span>
          </div>

          {/* Wind Disturbance */}
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <div className="flex justify-between">
              <span className="text-t3">Wind Eddies</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{(simParams.windDisturbance * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={simParams.windDisturbance}
              onChange={(e) => updateSimParams({ windDisturbance: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
            />
            <span className="text-[9px] text-t3 block">Turbulent dynamic head</span>
          </div>

          {/* Temperature Drift */}
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <div className="flex justify-between">
              <span className="text-t3">Temp Drift</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{simParams.temperatureDrift.toFixed(2)} °C/h</span>
            </div>
            <input 
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={simParams.temperatureDrift}
              onChange={(e) => updateSimParams({ temperatureDrift: parseFloat(e.target.value) })}
              className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
            />
            <span className="text-[9px] text-t3 block">Diurnal chamber heating</span>
          </div>
        </div>
      </div>
    </section>
  );
};
