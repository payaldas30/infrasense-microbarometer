import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { generatePSD } from '../services/mockDataEngine';
import { defaultSimParams } from '../services/mockDataEngine';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

const calibrationData = Array.from({ length: 20 }, (_, i) => {
  const input = i * 0.1; // Pa (known input)
  const output = 8.5 * input + 0.003 * (Math.random() - 0.5); // mV
  return { input: parseFloat(input.toFixed(3)), output: parseFloat(output.toFixed(4)) };
});

const psdForNoise = generatePSD({ ...defaultSimParams, noiseLevel: 0.014, windFilterEnabled: true });
const psdNoFilter = generatePSD({ ...defaultSimParams, noiseLevel: 0.014, windFilterEnabled: false });

const tests = [
  {
    id: 'sensitivity',
    num: '01',
    title: 'Sensitivity Characterization',
    description: 'Known reference pressure input vs. measured sensor output voltage to derive pressure sensitivity (mV/Pa) and linearity.',
    status: 'simulated' as const,
    chart: 'sensitivity',
    cards: [
      { label: 'Sensitivity (Target)', value: '8.5 mV/Pa', status: 'TARGET' as const },
      { label: 'Linearity R²', value: '> 0.9995', status: 'TARGET' as const },
      { label: 'Zero-Input Offset', value: '< 0.5 mV', status: 'TARGET' as const },
    ],
  },
  {
    id: 'freq-response',
    num: '02',
    title: 'Frequency Response (0.01–20 Hz)',
    description: 'Swept-frequency acoustic excitation from 0.01 Hz to 20 Hz characterizing the flat amplitude response band.',
    status: 'not_measured' as const,
    chart: null,
    cards: [
      { label: '−3 dB Bandwidth', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
      { label: 'Low-end −3 dB (fc)', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
      { label: 'Phase Linearity', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
    ],
  },
  {
    id: 'noise-floor',
    num: '03',
    title: 'Noise Floor Measurement',
    description: 'Power spectral density of the sensor output in a quiescent anechoic environment to characterize the instrument noise floor.',
    status: 'simulated' as const,
    chart: 'noise',
    cards: [
      { label: 'RMS Noise (Target)', value: '< 0.02 Pa RMS', status: 'TARGET' as const },
      { label: 'Peak Noise (3σ)', value: '< 0.06 Pa', status: 'TARGET' as const },
      { label: 'Noise Floor Freq.', value: '~0.005 Hz (Mech. cutoff)', status: 'SIMULATED' as const },
    ],
  },
  {
    id: 'temperature',
    num: '04',
    title: 'Temperature Drift & Compensation',
    description: 'Characterize sensor output change with temperature variation, quantify thermal coefficient, and validate the polynomial compensation algorithm.',
    status: 'not_measured' as const,
    chart: null,
    cards: [
      { label: 'Thermal Coefficient', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
      { label: 'Comp. Residual Error', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
      { label: 'Test Temperature Range', value: '5 – 45 °C (planned)', status: 'TARGET' as const },
    ],
  },
  {
    id: 'wind',
    num: '05',
    title: 'Wind-Noise Reduction Test',
    description: 'Compare sensor noise floor with and without the porous hose array to quantify wind turbulence attenuation in the 0.05–4 Hz band.',
    status: 'simulated' as const,
    chart: 'wind',
    cards: [
      { label: 'Wind Attenuation (Sim.)', value: '~15–22 dB', status: 'SIMULATED' as const },
      { label: 'Actual Attenuation', value: 'Awaiting measurement', status: 'NOT MEASURED' as const },
      { label: 'Band of Effectiveness', value: '0.05 – 4 Hz', status: 'TARGET' as const },
    ],
  },
  {
    id: 'stability',
    num: '06',
    title: '24-Hour Long-Term Stability',
    description: 'Continuous 24-hour quiescent recording to characterize slow drift, baseline wander, and RMS fluctuation under stable lab conditions.',
    status: 'not_measured' as const,
    chart: null,
    cards: [
      { label: 'Max Baseline Drift', value: 'Awaiting experimental data', status: 'NOT MEASURED' as const },
      { label: 'RMS Variation (24hr)', value: 'Awaiting experimental data', status: 'NOT MEASURED' as const },
      { label: 'Recording Duration', value: '24 hours (planned)', status: 'TARGET' as const },
    ],
  },
];

const StatusIcon: React.FC<{ status: 'simulated' | 'not_measured' | 'measured' }> = ({ status }) => {
  if (status === 'measured') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
  if (status === 'simulated') return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  return <Clock className="w-5 h-5 text-rose-400" />;
};

const statusLabel: Record<string, string> = {
  measured: 'MEASURED',
  simulated: 'SIMULATED (Algorithm)',
  not_measured: 'NOT MEASURED',
};

const statusStyle: Record<string, string> = {
  measured: 'bg-emerald-500/10/40 border-emerald-700/40 text-emerald-300',
  simulated: 'bg-amber-500/10/40 border-amber-700/40 text-amber-300',
  not_measured: 'bg-rose-500/10/40 border-rose-700/40 text-rose-300',
};

const CustomTip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel border border-theme-sub rounded p-2 text-[11px] font-mono shadow-xl">
      {payload.map((p, i) => (
        <p key={i} className="text-cyan-600 dark:text-cyan-300">{p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</p>
      ))}
    </div>
  );
};

export const ValidationPage: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string>('sensitivity');

  const currentTest = tests.find(t => t.id === activeTest)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">Engineering Validation Protocol</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">Prototype Validation</h1>
        <p className="text-sm text-t3 font-mono mt-1">
          Six-test characterization protocol for INFRASENSE microbarometer. Results are clearly labeled MEASURED, SIMULATED, or TARGET.
        </p>
      </div>

      {/* IMPORTANT DISCLAIMER */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-700/50 bg-amber-500/10/30">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs font-sans text-amber-200 leading-relaxed">
          <span className="font-bold font-mono text-amber-300">Data Integrity Statement: </span>
          All experimental data on this page is clearly labeled. Tests marked <span className="font-mono font-bold">NOT MEASURED</span> show no fabricated results. Tests marked <span className="font-mono font-bold">SIMULATED</span> use algorithmic models, not physical measurements. Only data marked <span className="font-mono font-bold">MEASURED</span> represents actual experimental evidence. This distinction is enforced throughout.
        </div>
      </div>

      {/* Test Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tests.map(test => (
          <button
            key={test.id}
            onClick={() => setActiveTest(test.id)}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeTest === test.id
                ? 'border-cyan-500/70 bg-cyan-500/10/40 shadow-lg shadow-cyan-900/20'
                : 'border-theme bg-panel hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-t2 text-xs">{test.num}</span>
              <StatusIcon status={test.status} />
            </div>
            <div className="text-xs font-mono font-semibold text-t1 leading-tight">{test.title}</div>
            <div className={`mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded border inline-block ${statusStyle[test.status]}`}>
              {statusLabel[test.status]}
            </div>
          </button>
        ))}
      </div>

      {/* Active Test Detail */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-2xl font-bold text-cyan-500/40">TEST {currentTest.num}</span>
              <StatusIcon status={currentTest.status} />
            </div>
            <h2 className="text-xl font-bold text-t1 font-mono">{currentTest.title}</h2>
            <p className="text-sm text-t3 font-sans mt-1 max-w-2xl leading-relaxed">{currentTest.description}</p>
          </div>
          <div className={`shrink-0 px-4 py-2 rounded border text-xs font-mono font-bold ${statusStyle[currentTest.status]}`}>
            {statusLabel[currentTest.status]}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currentTest.cards.map(card => (
            <div key={card.label} className="p-4 rounded-lg bg-deep border border-theme">
              <div className="text-[10px] font-mono text-t3 uppercase tracking-wider mb-1">{card.label}</div>
              <div className="text-sm font-bold font-mono text-t1">{card.value}</div>
              <Badge type={card.status} size="sm" className="mt-2" />
            </div>
          ))}
        </div>

        {/* Charts per test */}
        {currentTest.chart === 'sensitivity' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-t1">Output vs Pressure (Calibration Curve)</h3>
              <Badge type="SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-t3 font-sans leading-relaxed">
              Simulated calibration data showing sensor output (mV) versus applied differential pressure (Pa). Actual calibration requires a traceable pressure source and precision voltage measurement. Slope = sensitivity in mV/Pa.
            </p>
            <div className="h-56 bg-deep rounded border border-theme p-3">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 5, right: 5, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="input" name="Input (Pa)" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v} Pa`} label={{ value: 'Input Pressure (Pa)', position: 'insideBottom', offset: -5, style: { fontSize: 9, fill: '#94a3b8' } }} />
                  <YAxis dataKey="output" name="Output (mV)" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v.toFixed(1)} mV`} width={65} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTip />} />
                  <Scatter data={calibrationData} fill="#06b6d4" opacity={0.9} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {currentTest.chart === 'noise' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-t1">Sensor Noise PSD</h3>
              <Badge type="SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-t3 font-sans leading-relaxed">
              Simulated Power Spectral Density of the sensor noise floor in a quiescent environment. The characteristic 1/f rise at low frequencies (below 0.1 Hz) is common in MEMS transducers and microelectronic instrumentation amplifiers.
            </p>
            <div className="h-56 bg-deep rounded border border-theme p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={psdForNoise} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="noiseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="frequency" tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v} Hz`} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}dB`} width={55} tickLine={false} />
                  <Tooltip content={<CustomTip />} />
                  <Area type="monotone" dataKey="power" name="PSD (dB/Hz)" stroke="#6366f1" strokeWidth={1.5} fill="url(#noiseGrad)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {currentTest.chart === 'wind' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-t1">Wind Noise Suppression Comparison</h3>
              <Badge type="SIMULATED" size="sm" />
            </div>
            <p className="text-xs text-t3 font-sans leading-relaxed">
              Simulated PSD comparison: sensor noise with the porous hose array active vs. bypassed. The spatial averaging causes wind-generated turbulence noise to cancel for incoherent eddies. Acoustic infrasound (long wavelength) passes coherently through both channels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'WITHOUT Wind Filter', data: psdNoFilter, color: '#f43f5e', grad: 'windNoFilterGrad', gradColor: '#f43f5e' },
                { label: 'WITH Wind Filter (Porous Array)', data: psdForNoise, color: '#10b981', grad: 'windFilterGrad', gradColor: '#10b981' },
              ].map(chart => (
                <div key={chart.label} className="bg-deep rounded border border-theme p-4">
                  <div className="text-xs font-mono font-bold text-t2 mb-3">{chart.label}</div>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chart.data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id={chart.grad} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.gradColor} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={chart.gradColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="frequency" tick={{ fontSize: 8, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}`} tickLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: 'var(--t3)', fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${v}dB`} width={45} tickLine={false} />
                        <Tooltip content={<CustomTip />} />
                        <Area type="monotone" dataKey="power" name="PSD (dB/Hz)" stroke={chart.color} strokeWidth={1.5} fill={`url(#${chart.grad})`} dot={false} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-deep rounded border border-theme text-[11px] font-mono text-t3">
              Numerical attenuation result will be displayed here after actual field measurement with a calibrated reference microphone. Simulated model predicts ~15–22 dB in the 0.05–2 Hz band.
            </div>
          </div>
        )}

        {currentTest.status === 'not_measured' && (
          <div className="flex flex-col items-center justify-center p-10 rounded-xl bg-deep border border-theme border-dashed text-center space-y-3">
            <XCircle className="w-10 h-10 text-rose-500/60" />
            <div className="text-sm font-mono font-bold text-rose-400">NOT MEASURED</div>
            <p className="text-xs text-t3 font-sans max-w-md leading-relaxed">
              Experimental data not yet available. This test requires the physical prototype hardware and calibration apparatus. Chart and numerical results will populate here when measurement data is uploaded.
            </p>
            <div className="text-[11px] font-mono text-t3/80 mt-2">
              Awaiting experimental data → Upload measurement CSV to populate
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
