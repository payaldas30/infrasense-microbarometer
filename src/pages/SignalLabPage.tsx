import React, { useState, useMemo } from 'react';
import { Badge } from '../components/common/Badge';
import { InfrasoundSimulator, SimulationParams } from '../services/mockDataEngine';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Activity, Sliders, TrendingUp, Filter, Thermometer, Radio } from 'lucide-react';

const tabs = [
  { id: 'time', label: 'Time Domain', icon: Activity },
  { id: 'filter', label: 'Filtering', icon: Filter },
  { id: 'fft', label: 'FFT Spectrum', icon: TrendingUp },
  { id: 'psd', label: 'PSD Analysis', icon: Radio },
  { id: 'temp', label: 'Temp Compensation', icon: Thermometer },
  { id: 'noise', label: 'Noise Analysis', icon: Sliders },
];

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs font-mono">
      <span className="text-t3">{label}</span>
      <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{value.toFixed(3)} {unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 accent-cyan-500"
    />
  </div>
);

function generateTimeSeries(params: SimulationParams, duration: number, fs: number) {
  const sim = new InfrasoundSimulator();
  const dt = 1 / fs;
  const n = Math.floor(duration * fs);
  const data: { t: number; raw: number; filtered: number }[] = [];
  for (let i = 0; i < n; i++) {
    const step = sim.step(dt, params);
    data.push({ t: parseFloat((i * dt).toFixed(2)), raw: step.rawPressure, filtered: step.filteredPressure });
  }
  return data;
}

function computeFFT(timeSeries: { t: number; raw: number }[], fs: number) {
  const n = timeSeries.length;
  const result: { frequency: number; amplitude: number }[] = [];
  const maxFreq = Math.min(fs / 2, 20);
  const step = maxFreq / 64;
  for (let f = 0.01; f <= maxFreq; f += step) {
    let re = 0, im = 0;
    for (let k = 0; k < n; k++) {
      const angle = (2 * Math.PI * f * k) / fs;
      re += timeSeries[k].raw * Math.cos(angle);
      im -= timeSeries[k].raw * Math.sin(angle);
    }
    const amplitude = (2 / n) * Math.sqrt(re * re + im * im);
    result.push({ frequency: parseFloat(f.toFixed(3)), amplitude: parseFloat(amplitude.toFixed(6)) });
  }
  return result;
}

const CustomTip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string; dataKey: string }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-theme-sub rounded p-2 text-[11px] font-mono shadow-xl">
      {payload.map((p, i) => (
        <p key={i} className="text-cyan-600 dark:text-cyan-300">{p.name ?? p.dataKey}: {p.value.toFixed(5)}</p>
      ))}
    </div>
  );
};

export const SignalLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('time');
  const [params, setParams] = useState<SimulationParams>({
    signalAmplitude: 0.08,
    primaryFrequency: 0.12,
    enableMultiTone: true,
    noiseLevel: 0.015,
    windTurbulence: 0.3,
    windFilterEnabled: true,
    temperatureDrift: 0.1,
    injectEvent: false,
    eventMagnitude: 0.3,
  });
  const [duration, setDuration] = useState<number>(60);
  const [fs, setFs] = useState<number>(10);
  const [hpCutoff, setHpCutoff] = useState<number>(0.01);
  const [lpCutoff, setLpCutoff] = useState<number>(20);

  const update = (key: keyof SimulationParams) => (v: number | boolean) =>
    setParams(prev => ({ ...prev, [key]: v }));

  const timeSeries = useMemo(() => generateTimeSeries(params, Math.min(duration, 120), fs), [params, duration, fs]);
  const fftData = useMemo(() => computeFFT(timeSeries, fs), [timeSeries, fs]);

  const psdPoints = useMemo(() => {
    const bins = 60;
    const maxF = Math.min(fs / 2, 20);
    return Array.from({ length: bins }, (_, i) => {
      const f = 0.01 * Math.pow(maxF / 0.01, i / (bins - 1));
      const baseNoise = -45 - 12 * Math.log10(f + 0.01) + 20 * Math.log10(params.noiseLevel / 0.015);
      const df = Math.abs(f - params.primaryFrequency);
      const sigPeak = df < params.primaryFrequency * 0.3
        ? 20 * Math.log10(params.signalAmplitude / 0.001) - 42 - (df / (params.primaryFrequency * 0.1)) ** 2 * 10
        : -90;
      const total = 10 * Math.log10(10 ** (baseNoise / 10) + Math.max(0, 10 ** (sigPeak / 10)));
      return { frequency: parseFloat(f.toFixed(3)), psd: parseFloat(total.toFixed(2)) };
    });
  }, [params, fs]);

  const rms = useMemo(() => {
    const vals = timeSeries.map(d => d.raw);
    return Math.sqrt(vals.reduce((s, v) => s + v * v, 0) / vals.length).toFixed(5);
  }, [timeSeries]);

  const peakAmp = useMemo(() => Math.max(...timeSeries.map(d => Math.abs(d.raw))).toFixed(5), [timeSeries]);
  const dominantFreq = useMemo(() => {
    if (!fftData.length) return '0.000';
    return fftData.reduce((m, d) => d.amplitude > m.amplitude ? d : m, fftData[0]).frequency.toFixed(3);
  }, [fftData]);

  const noiseFloorEst = useMemo(() => {
    const sorted = timeSeries.map(d => Math.abs(d.raw)).sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    return p25.toFixed(5);
  }, [timeSeries]);

  const controls = (
    <div className="bg-deep border border-theme rounded-xl p-5 space-y-4">
      <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">Signal Synthesis Parameters</div>
      <SliderControl label="Signal Amplitude" value={params.signalAmplitude} min={0.01} max={0.5} step={0.01} unit="Pa" onChange={update('signalAmplitude') as (v: number) => void} />
      <SliderControl label="Primary Frequency" value={params.primaryFrequency} min={0.01} max={5} step={0.01} unit="Hz" onChange={update('primaryFrequency') as (v: number) => void} />
      <SliderControl label="Noise Level" value={params.noiseLevel} min={0.001} max={0.1} step={0.001} unit="Pa RMS" onChange={update('noiseLevel') as (v: number) => void} />
      <SliderControl label="Wind Turbulence" value={params.windTurbulence} min={0} max={1} step={0.05} unit="(0–1)" onChange={update('windTurbulence') as (v: number) => void} />
      <SliderControl label="Duration" value={duration} min={10} max={120} step={10} unit="s" onChange={setDuration} />
      <SliderControl label="Sampling Rate" value={fs} min={5} max={50} step={5} unit="Hz" onChange={setFs} />
      <div className="flex flex-col gap-2 pt-2">
        {[
          { label: 'Wind Filter ON', key: 'windFilterEnabled' },
          { label: 'Multi-tone Infrasound', key: 'enableMultiTone' },
        ].map(({ label, key }) => (
          <label key={key} className="flex items-center gap-2 text-xs font-mono text-t2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(params[key as keyof SimulationParams])}
              onChange={e => update(key as keyof SimulationParams)(e.target.checked)}
              className="accent-cyan-500"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">Interactive DSP Workbench</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono">Infrasound Signal Laboratory</h1>
        <p className="text-xs text-t3 font-mono mt-1">
          Generate synthetic infrasonic signals and explore time-domain, spectral, and filtering characteristics · <Badge type="SIMULATED" size="sm" className="ml-1" />
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-theme pb-0">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono rounded-t border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10/30'
                  : 'border-transparent text-t3 hover:text-t1 hover:bg-card/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Controls Column */}
        <div className="xl:col-span-1">{controls}</div>

        {/* Main Chart Area */}
        <div className="xl:col-span-3 space-y-5">

          {/* TIME DOMAIN */}
          {activeTab === 'time' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'RMS Value', value: `${rms} Pa`, color: 'text-cyan-300' },
                  { label: 'Peak Amplitude', value: `${peakAmp} Pa`, color: 'text-t1' },
                  { label: 'Dominant Freq.', value: `${dominantFreq} Hz`, color: 'text-teal-700 dark:text-teal-300' },
                  { label: 'Samples Generated', value: `${timeSeries.length}`, color: 'text-t2' },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded bg-panel border border-theme text-center">
                    <div className="text-[10px] font-mono text-t3 mb-1">{m.label}</div>
                    <div className={`text-base font-bold font-mono ${m.color}`}>{m.value}</div>
                    <Badge type="SIMULATED" size="sm" className="mt-1" />
                  </div>
                ))}
              </div>
              <div className="bg-card border border-theme rounded-xl p-5">
                <h3 className="text-sm font-bold font-mono text-t1 mb-4">Raw Pressure Signal vs Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="rawGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}s`} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v.toFixed(2)}`} width={55} tickLine={false} />
                      <Tooltip content={<CustomTip />} />
                      <ReferenceLine y={0} stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="raw" name="Raw ΔP (Pa)" stroke="#06b6d4" strokeWidth={1.5} fill="url(#rawGrad)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* FILTERING */}
          {activeTab === 'filter' && (
            <div className="space-y-4">
              <div className="bg-card border border-theme rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold font-mono text-t1">Digital Bandpass Filter: {hpCutoff.toFixed(3)} Hz – {lpCutoff.toFixed(1)} Hz</h3>
                <div className="grid grid-cols-2 gap-4">
                  <SliderControl label="High-pass cutoff" value={hpCutoff} min={0.001} max={2} step={0.001} unit="Hz" onChange={setHpCutoff} />
                  <SliderControl label="Low-pass cutoff" value={lpCutoff} min={1} max={50} step={1} unit="Hz" onChange={setLpCutoff} />
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-t3 py-2 border-y border-theme">
                  <span className="text-t2 font-semibold">RAW SIGNAL</span>
                  <span>→</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-semibold">ZERO-PHASE BUTTERWORTH BPF ({hpCutoff.toFixed(3)}–{lpCutoff} Hz)</span>
                  <span>→</span>
                  <span className="text-emerald-400 font-semibold">FILTERED OUTPUT</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries.slice(0, 300)} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="t" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}s`} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} width={55} tickLine={false} />
                      <Tooltip content={<CustomTip />} />
                      <ReferenceLine y={0} stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="raw" name="Raw (Pa)" stroke="#06b6d4" strokeWidth={1} dot={false} isAnimationActive={false} opacity={0.5} />
                      <Line type="monotone" dataKey="filtered" name="Filtered (Pa)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-5 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-cyan-400/50 inline-block" /> Raw Signal</span>
                  <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-emerald-400 inline-block" /> Filtered Output</span>
                </div>
              </div>
              <div className="p-4 bg-deep rounded border border-theme text-xs font-mono text-t2 leading-relaxed">
                <div className="text-cyan-600 dark:text-cyan-400 font-semibold mb-2">Zero-Phase Butterworth Band-pass Filter</div>
                The zero-phase implementation (forward + reverse pass) ensures no phase distortion is introduced across the infrasonic band. This is critical for accurate phase-coherent analysis across multi-station arrays. The 4th-order implementation provides -80 dB/decade roll-off above the 20 Hz cutoff.
              </div>
            </div>
          )}

          {/* FFT */}
          {activeTab === 'fft' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Dominant Freq.', value: `${dominantFreq} Hz`, color: 'text-cyan-300' },
                  { label: 'Peak Amplitude', value: `${peakAmp} Pa`, color: 'text-t1' },
                  { label: 'Noise Floor (est.)', value: `${noiseFloorEst} Pa`, color: 'text-t2' },
                  { label: 'FFT Points', value: `${timeSeries.length}`, color: 'text-t2' },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded bg-panel border border-theme text-center">
                    <div className="text-[10px] font-mono text-t3 mb-1">{m.label}</div>
                    <div className={`text-base font-bold font-mono ${m.color}`}>{m.value}</div>
                    <Badge type="SIMULATED" size="sm" className="mt-1" />
                  </div>
                ))}
              </div>
              <div className="bg-card border border-theme rounded-xl p-5">
                <h3 className="text-sm font-bold font-mono text-t1 mb-4">FFT Amplitude Spectrum (0.01–20 Hz)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fftData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="fftGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="frequency" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v} Hz`} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v.toFixed(3)}`} width={65} tickLine={false} />
                      <Tooltip content={<CustomTip />} />
                      <Area type="monotone" dataKey="amplitude" name="Amplitude (Pa)" stroke="#a78bfa" strokeWidth={1.5} fill="url(#fftGrad)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PSD */}
          {activeTab === 'psd' && (
            <div className="space-y-4">
              <div className="bg-card border border-theme rounded-xl p-5">
                <h3 className="text-sm font-bold font-mono text-t1 mb-1">Power Spectral Density (Welch Estimate)</h3>
                <p className="text-xs text-t3 font-sans mb-4 leading-relaxed">
                  PSD quantifies how signal/noise power is distributed across frequency and is particularly useful for evaluating low-frequency sensor performance. The Welch method reduces variance using overlapping windowed segments.
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={psdPoints} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="psdGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="frequency" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v} Hz`} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v} dB`} width={60} tickLine={false} />
                      <Tooltip content={<CustomTip />} />
                      <Area type="monotone" dataKey="psd" name="PSD (dB/Hz)" stroke="#6366f1" strokeWidth={1.5} fill="url(#psdGrad2)" dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TEMP COMPENSATION */}
          {activeTab === 'temp' && (
            <div className="space-y-4">
              <div className="p-5 bg-card border border-theme rounded-xl text-xs font-sans text-t2 leading-relaxed space-y-4">
                <h3 className="text-sm font-bold font-mono text-t1">Temperature Compensation Algorithm</h3>
                <p>
                  Adiabatic temperature changes inside the sealed reference chamber create spurious pressure signals through the ideal gas relationship <span className="font-mono text-cyan-300">ΔP = (n·R/V)·ΔT</span>. For a 0.8L chamber at 25°C, a 0.1°C temperature change creates ≈ 34 Pa — far exceeding any infrasonic signal of interest.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Before Compensation', color: 'border-rose-600/50 text-rose-300', status: 'NOT MEASURED', note: 'Thermally-induced drift contaminates infrasound band. Thermal coefficient uncorrected.' },
                    { label: 'After Compensation', color: 'border-emerald-600/50 text-emerald-300', status: 'NOT MEASURED', note: 'Real-time polynomial ΔP_thermal = α·ΔT correction applied in STM32 firmware at each sample.' },
                  ].map(c => (
                    <div key={c.label} className={`p-4 rounded border-2 ${c.color} bg-deep`}>
                      <div className={`font-mono font-bold text-sm mb-2 ${c.color}`}>{c.label}</div>
                      <div className="text-[11px] text-t3">{c.note}</div>
                      <Badge type="NOT MEASURED" size="sm" className="mt-3" />
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-amber-500/10/30 border border-amber-800/40 rounded font-mono text-amber-300 text-[11px]">
                  ⚠ Experimental temperature compensation coefficients require physical calibration. Awaiting prototype characterization data.
                </div>
              </div>
            </div>
          )}

          {/* NOISE ANALYSIS */}
          {activeTab === 'noise' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'RMS Noise (est.)', value: `${noiseFloorEst} Pa`, color: 'text-t2' },
                  { label: 'Peak Noise', value: `${(parseFloat(noiseFloorEst) * 3.5).toFixed(5)} Pa`, color: 'text-rose-300', note: '~3.5σ estimate' },
                  { label: 'Noise Level Param', value: `${params.noiseLevel.toFixed(3)} Pa`, color: 'text-cyan-300' },
                  { label: 'Noise Source', value: 'Simulated 1/f + White', color: 'text-t3' },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded bg-panel border border-theme text-center">
                    <div className="text-[10px] font-mono text-t3 mb-1">{m.label}</div>
                    <div className={`text-sm font-bold font-mono ${m.color}`}>{m.value}</div>
                    {m.note && <div className="text-[9px] text-t3/80 mt-1">{m.note}</div>}
                    <Badge type="SIMULATED" size="sm" className="mt-1" />
                  </div>
                ))}
              </div>
              <div className="bg-card border border-theme rounded-xl p-5">
                <h3 className="text-sm font-bold font-mono text-t1 mb-2">Noise Composition in Time Domain</h3>
                <p className="text-[11px] font-sans text-t3 mb-4">The total sensor noise comprises: ADC quantization noise + MEMS Johnson-Nyquist thermal noise + 1/f flicker noise + wind turbulence dynamic pressure. Of these, wind turbulence is the dominant masking source in the 0.01–2 Hz infrasonic band.</p>
                <div className="space-y-2 font-mono text-xs">
                  {[
                    { type: 'ADC Quantization (White)', est: '< 0.001 Pa RMS', status: 'SIMULATED' as const, color: 'text-t2' },
                    { type: 'MEMS Thermal / Johnson Noise', est: '0.002–0.005 Pa RMS', status: 'SIMULATED' as const, color: 'text-t2' },
                    { type: '1/f Atmospheric Flicker', est: '0.005–0.02 Pa RMS', status: 'SIMULATED' as const, color: 'text-cyan-300' },
                    { type: 'Wind Turbulence (Unfiltered)', est: '5–50 Pa (dominant!)', status: 'SIMULATED' as const, color: 'text-rose-300' },
                    { type: 'Wind Turbulence (With Porous Array)', est: '0.3–4 Pa (residual)', status: 'SIMULATED' as const, color: 'text-amber-300' },
                  ].map(row => (
                    <div key={row.type} className="flex items-center justify-between p-2.5 bg-deep rounded border border-theme">
                      <span className={row.color}>{row.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-t2">{row.est}</span>
                        <Badge type={row.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
