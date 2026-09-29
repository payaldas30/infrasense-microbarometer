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
import { Radio, Sliders, BarChart2, Info } from 'lucide-react';

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

  const filteredData = useMemo(() => {
    if (selectedBand === 'all') return spectrumData;
    return spectrumData.filter(p => p.band === selectedBand);
  }, [spectrumData, selectedBand]);

  return (
    <section id="spectrum" className="space-y-4 font-mono">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-t1 tracking-wider uppercase">
            SPECTRAL ANALYSIS
          </h2>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
            0.01 → 20 Hz Log Scale
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="SIMULATED" size="sm" />
          <span className="text-[11px] text-t3">
            Welch Periodogram Estimation (1024-pt)
          </span>
        </div>
      </div>

      {/* Selectable Frequency Bands Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-panel rounded-xl border border-theme shadow-sm">
        <span className="text-[11px] text-t3 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-cyan-500" />
          Selectable Band:
        </span>
        {bands.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBand(b.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
              selectedBand === b.id
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-600 dark:text-cyan-300 font-bold shadow-sm'
                : 'bg-card border-theme text-t3 hover:text-t1 hover:border-theme-sub'
            }`}
          >
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Frequency Spectrum Chart (Left) + Compact PSD & Info Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Large Frequency-Domain Chart */}
        <div className="lg:col-span-8 p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm relative">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-t1 font-bold">FFT / SPECTRAL POWER SPECTRUM</span>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Logarithmic Freq Axis
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-t3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Peak ({dominantFrequency.toFixed(3)} Hz)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-indigo-500 inline-block" /> PSD Curve
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-64 sm:h-72 w-full bg-deep/50 dark:bg-[#050812] rounded-xl border border-theme p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="spectrumAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis 
                  dataKey="frequency"
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  tickFormatter={(v) => `${v.toFixed(2)} Hz`}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                  tickFormatter={(v) => `${v} dB`}
                  width={55}
                  tickLine={false}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload;
                      return (
                        <div className="bg-panel border border-cyan-500/50 rounded-lg p-2.5 text-xs shadow-xl text-t1 font-mono">
                          <div className="text-t3">Freq: <strong className="text-t1">{pt.frequency} Hz</strong></div>
                          <div className="text-indigo-600 dark:text-indigo-300 font-bold">Power: {pt.power} dB/Hz</div>
                          <div className="text-cyan-600 dark:text-cyan-400 text-[11px]">Amp: {pt.amplitude} Pa</div>
                          <div className="text-t3 text-[10px] mt-1">Band: {pt.band} Hz</div>
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
                  strokeWidth={2}
                  fill="url(#spectrumAreaGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-[10px] text-t3 flex justify-between">
            <span>Low-Frequency Region (0.01 Hz)</span>
            <span>Mid-Band (0.1–1.0 Hz)</span>
            <span>Acoustic Boundary (20.0 Hz)</span>
          </div>
        </div>

        {/* Right Column: Compact PSD Graph & Information Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Compact PSD Plot */}
          <div className="p-4 rounded-2xl bg-panel border border-theme shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-t1">
                <Radio className="w-3.5 h-3.5 text-cyan-500" />
                <span>POWER SPECTRAL DENSITY</span>
              </div>
              <Badge type="SIMULATED" size="sm" />
            </div>

            <div className="h-32 w-full bg-deep/50 dark:bg-[#050812] rounded-xl border border-theme p-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spectrumData.slice(0, 45)} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="frequency" tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v.toFixed(2)}`} tickLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: 'var(--t3)' }} tickFormatter={(v) => `${v}dB`} width={40} tickLine={false} />
                  <Area type="monotone" dataKey="power" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 text-[9px] text-t3 text-right">
              Frequency (Hz) vs PSD (dB/Hz) · Log Scale
            </div>
          </div>

          {/* PSD Parameter Information Panel */}
          <div className="p-4 rounded-2xl bg-panel border border-theme shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-theme">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 tracking-wider">
                SPECTRAL METRICS
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                SIMULATED DATA
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-theme-sub">
              <span className="text-t3">Frequency Range:</span>
              <span className="text-t1 font-bold">0.01 – 20 Hz</span>
            </div>

            <div className="flex justify-between py-1 border-b border-theme-sub">
              <span className="text-t3">Dominant Frequency:</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{dominantFrequency.toFixed(3)} Hz</span>
            </div>

            <div className="flex justify-between py-1 border-b border-theme-sub">
              <span className="text-t3">Noise Floor:</span>
              <span className="text-t2">
                {status.source === 'simulation' ? `${noiseEstimate.toFixed(2)} Pa RMS` : 'AWAITING MEASUREMENT'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-theme-sub">
              <span className="text-t3">Signal RMS:</span>
              <span className="text-t2">
                {status.source === 'simulation' ? `${signalRMS.toFixed(2)} Pa` : 'AWAITING MEASUREMENT'}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-t3">Bandwidth (-3 dB):</span>
              <span className="text-t1 font-bold">19.99 Hz</span>
            </div>

            <div className="p-2.5 bg-card rounded-lg border border-theme text-[10px] text-t3 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
              <span>
                Values labeled <strong className="text-cyan-600 dark:text-cyan-300">SIMULATED</strong> are synthetic benchmark models. Live FFT outputs replace this block when connected to hardware.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
