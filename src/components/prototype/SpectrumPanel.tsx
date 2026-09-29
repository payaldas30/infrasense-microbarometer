import React, { useMemo } from 'react';
import { useSensor } from '../../context/SensorContext';
import { Badge } from '../common/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Radio, Sliders, Activity, Info, BarChart2 } from 'lucide-react';

export const SpectrumPanel: React.FC = () => {
  const { 
    spectrumData, 
    selectedBand, 
    setSelectedBand, 
    dominantFrequency, 
    signalRMS, 
    noiseEstimate,
    status 
  } = useSensor();

  const bands: { id: 'all' | '0.01-0.1' | '0.1-1' | '1-10' | '10-20'; label: string; desc: string }[] = [
    { id: 'all', label: 'Full Band (0.01–20 Hz)', desc: 'Full infrasound passband' },
    { id: '0.01-0.1', label: '0.01 – 0.1 Hz', desc: 'Acoustic-gravity & mountain waves' },
    { id: '0.1-1', label: '0.1 – 1.0 Hz', desc: 'Microbaroms & long-range signals' },
    { id: '1-10', label: '1.0 – 10.0 Hz', desc: 'Volcanic, blast, & turbulence' },
    { id: '10-20', label: '10.0 – 20.0 Hz', desc: 'Near-acoustic transition band' },
  ];

  // Filter or color points depending on selectedBand
  const filteredData = useMemo(() => {
    if (selectedBand === 'all') return spectrumData;
    return spectrumData.filter(p => p.band === selectedBand);
  }, [spectrumData, selectedBand]);

  return (
    <section id="spectrum" className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wider">
            SPECTRAL ANALYSIS
          </h2>
          <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
            0.01 → 20 Hz Log Scale
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="SIMULATED" size="sm" />
          <span className="text-[11px] font-mono text-slate-400">
            Welch Periodogram Estimation (1024-pt)
          </span>
        </div>
      </div>

      {/* Selectable Frequency Bands Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-[#0a1020] rounded-xl border border-slate-800">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
          Selectable Band:
        </span>
        {bands.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBand(b.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
              selectedBand === b.id
                ? 'bg-cyan-600/30 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-950'
                : 'bg-[#0e1726] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Frequency Spectrum Chart (Left) + Compact PSD & Info Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Large Frequency-Domain Chart */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 relative">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">FFT / SPECTRAL POWER SPECTRUM</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                Logarithmic Freq Axis
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Dominant Peak ({dominantFrequency.toFixed(3)} Hz)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" /> PSD Curve
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-64 sm:h-72 w-full bg-[#050812] rounded-lg border border-slate-800/80 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="spectrumAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis 
                  dataKey="frequency"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b' }}
                  tickFormatter={(v) => `${v.toFixed(2)} Hz`}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: '#64748b' }}
                  tickFormatter={(v) => `${v} dB`}
                  width={55}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-[#0c1424] border border-cyan-500/40 rounded p-2 text-xs font-mono shadow-2xl">
                          <div className="text-slate-400">Freq: <strong className="text-white">{pt.frequency} Hz</strong></div>
                          <div className="text-indigo-300 font-bold">Power: {pt.power} dB/Hz</div>
                          <div className="text-cyan-400 text-[11px]">Amp: {pt.amplitude} Pa</div>
                          <div className="text-slate-500 text-[10px] mt-1">Band: {pt.band} Hz</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Dominant frequency marker */}
                <ReferenceLine 
                  x={dominantFrequency} 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Peak ${dominantFrequency.toFixed(3)} Hz`, 
                    position: 'top', 
                    fill: '#06b6d4', 
                    fontSize: 10, 
                    fontFamily: 'JetBrains Mono' 
                  }} 
                />
                <Area 
                  type="monotone"
                  dataKey="power"
                  name="Spectral Power"
                  stroke="#6366f1"
                  strokeWidth={1.8}
                  fill="url(#spectrumAreaGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Low-Frequency Region (0.01 Hz)</span>
            <span>Mid-Band (0.1–1.0 Hz)</span>
            <span>Acoustic Boundary (20.0 Hz)</span>
          </div>
        </div>

        {/* Right Column: Compact PSD Graph & Information Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Compact PSD Plot */}
          <div className="p-4 rounded-xl bg-[#091020] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span>POWER SPECTRAL DENSITY</span>
              </div>
              <Badge type="SIMULATED" size="sm" />
            </div>

            <div className="h-32 w-full bg-[#050812] rounded border border-slate-800 p-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spectrumData.slice(0, 45)} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="frequency" tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v.toFixed(2)}`} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: '#64748b' }} tickFormatter={(v) => `${v}dB`} width={40} tickLine={false} />
                  <Area type="monotone" dataKey="power" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[9px] font-mono text-slate-500 text-right">
              Frequency (Hz) vs PSD (dB/Hz) · Log Scale
            </div>
          </div>

          {/* PSD Parameter Information Panel */}
          <div className="p-4 rounded-xl bg-[#0c1424] border border-slate-800 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                SPECTRAL METRICS
              </span>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40">
                SIMULATED DATA
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Frequency Range:</span>
              <span className="text-white font-bold">0.01 – 20 Hz</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Dominant Frequency:</span>
              <span className="text-cyan-300 font-bold">{dominantFrequency.toFixed(3)} Hz</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Noise Floor:</span>
              <span className="text-slate-300">
                {status.source === 'simulation' ? `${noiseEstimate.toFixed(2)} Pa RMS` : 'AWAITING MEASUREMENT'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Signal RMS:</span>
              <span className="text-slate-300">
                {status.source === 'simulation' ? `${signalRMS.toFixed(2)} Pa` : 'AWAITING MEASUREMENT'}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Bandwidth (-3 dB):</span>
              <span className="text-white font-bold">19.99 Hz</span>
            </div>

            <div className="p-2 bg-[#091020] rounded border border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Values labeled <strong className="text-cyan-300">SIMULATED</strong> are synthetic benchmark models. When physical STM32 DMA stream is hooked up, live FFT outputs replace this block.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
