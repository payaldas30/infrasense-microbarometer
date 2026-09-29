import React, { useEffect, useRef, useState } from 'react';
import { useSensor } from '../context/SensorContext';
import { Badge } from '../components/common/Badge';
import { 
  ArrowRight, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Wind, 
  Thermometer, 
  Cpu, 
  Gauge, 
  ShieldAlert, 
  Sliders, 
  ChevronRight,
  TrendingDown,
  Sparkles,
  Zap
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const { currentReading, projectConfig } = useSensor();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeProblemTab, setActiveProblemTab] = useState<'buried' | 'separated'>('buried');

  // Slow realistic infrasonic waveform canvas animation for the hero section
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.025; // Slow, physical infrasonic propagation rate
      const width = canvas.width;
      const height = canvas.height;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw faint scientific coordinate grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Zero baseline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Primary Infrasonic Waveform (0.05 Hz slow oscillation with microbarom ripple)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const spatialPhase = (x / width) * 4 * Math.PI;
        // Infrasound multi-harmonic sum
        const y1 = Math.sin(spatialPhase - t * 0.8) * 35;
        const y2 = Math.sin(spatialPhase * 2.3 - t * 1.5) * 12;
        const y3 = Math.sin(spatialPhase * 0.4 - t * 0.3) * 18;
        const y = midY + y1 + y2 + y3;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Glowing scanhead dot at the current reading position
      const leadX = width - 15;
      const leadY = midY + Math.sin(4 * Math.PI - t * 0.8) * 35 + Math.sin(4 * Math.PI * 2.3 - t * 1.5) * 12 + Math.sin(4 * Math.PI * 0.4 - t * 0.3) * 18;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(leadX, leadY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Outer glow
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      ctx.beginPath();
      ctx.arc(leadX, leadY, 10, 0, 2 * Math.PI);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const flowBlocks = [
    { name: 'ATMOSPHERE', sub: 'Acoustic & Turbulent Field', id: 'atmosphere' },
    { name: 'WIND-NOISE REDUCTION', sub: 'Porous Line Array (-18 dB)', id: 'wind-noise' },
    { name: 'PNEUMATIC CONDITIONING', sub: 'Capillary Leak & Reference Vol', id: 'pneumatic-conditioning' },
    { name: 'MEMS DIFFERENTIAL SENSOR', sub: 'Piezoresistive Diaphragm ΔP', id: 'mems-sensor' },
    { name: 'SIGNAL ACQUISITION', sub: '24-bit Delta-Sigma ADC', id: 'signal-acquisition' },
    { name: 'TEMPERATURE MEASUREMENT', sub: '0.008°C Thermal Transducer', id: 'temperature-sensor' },
    { name: 'STM32 MCU', sub: 'ARM Cortex-M4 @ 100MHz', id: 'stm32-processor' },
    { name: 'DIGITAL FILTERING', sub: 'Zero-Phase Butterworth BPF', id: 'digital-filtering' },
    { name: 'FFT / PSD ESTIMATION', sub: 'Welch Periodogram Engine', id: 'fft-psd' },
    { name: '0.01–20 Hz ANALYSIS', sub: 'Characterization & Event Log', id: 'analysis' },
  ];

  const solutionCards = [
    {
      num: '01',
      title: 'Wind-Noise Reduction',
      desc: 'Spatial averaging via symmetrical multi-port porous hose array cancels incoherent turbulent eddies while preserving coherent planar infrasound.',
      spec: '15–22 dB turbulence rejection',
      icon: Wind
    },
    {
      num: '02',
      title: 'Pneumatic Conditioning',
      desc: 'Precision reference chamber and acoustic capillary leak create a mechanical high-pass barrier (fc ≈ 0.005 Hz) rejecting 2 kPa weather swings.',
      spec: 'fc ≈ 0.005 Hz acoustic cutoff',
      icon: Gauge
    },
    {
      num: '03',
      title: 'MEMS Differential Sensing',
      desc: 'Piezoresistive micro-machined silicon diaphragm measures minute differential fluctuations (±0.01 Pa) without 100 kPa ambient offset saturation.',
      spec: '±250 Pa dynamic range',
      icon: Cpu
    },
    {
      num: '04',
      title: 'Low-Noise Acquisition',
      desc: 'Ultra-low-noise instrumental analog front-end and 24-bit Delta-Sigma converter with ENOB > 19.5 bits keep quantization noise far below thermal noise floor.',
      spec: '24-bit Delta-Sigma / Low 1/f',
      icon: Activity
    },
    {
      num: '05',
      title: 'Temperature Compensation',
      desc: 'Real-time mathematical polynomial correction compensates for adiabatic temperature changes inside the reference chamber using 16-bit thermal sensing.',
      spec: '0.0078 °C resolution',
      icon: Thermometer
    },
    {
      num: '06',
      title: 'Digital Signal Processing',
      desc: 'STM32 ARM Cortex-M4 computes 4th-order Butterworth bandpass filtering (0.01–20 Hz), running Welch PSD estimation and transient event detection.',
      spec: 'FPU-accelerated DSP @ 100 MHz',
      icon: Sliders
    }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 overflow-hidden border-b border-theme/80">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 tech-grid opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="px-2.5 py-1 rounded bg-cyan-500/10/70 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-semibold tracking-wider">
              SIH26144
            </span>
            <span className="px-2.5 py-1 rounded bg-deep border border-theme-sub text-t2 font-mono text-xs font-semibold">
              NTRO
            </span>
            <span className="px-2.5 py-1 rounded bg-deep border border-theme-sub text-t2 font-mono text-xs">
              Hardware Category
            </span>
            <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-xs">
              0.01–20 Hz
            </span>
            <Badge type="SIMULATED" size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Heading, Subtext, CTA */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-t1 leading-tight font-sans">
                Detecting What the <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 font-mono">
                  Human Ear Cannot Hear
                </span>
              </h1>

              <p className="text-t2 text-base sm:text-lg leading-relaxed max-w-2xl font-sans">
                A low-cost MEMS differential-pressure platform designed to detect and characterize infrasonic atmospheric pressure fluctuations from <strong className="text-t1 font-mono">0.01–20 Hz</strong>. Developed for defense, remote intelligence, and geodynamic atmospheric monitoring.
              </p>

              {/* Sensing Chain Pipeline Flow (Linear Breadcrumb) */}
              <div className="p-3 bg-panel rounded-lg border border-theme text-[11px] font-mono text-t2">
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-semibold mb-2 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Complete Physical Measurement Chain
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-t3">
                  <span className="text-t2">Atmospheric Pressure</span>
                  <span className="text-cyan-500">→</span>
                  <span className="text-t2">Pressure Conditioning</span>
                  <span className="text-cyan-500">→</span>
                  <span className="text-cyan-600 dark:text-cyan-300 font-semibold">MEMS Differential</span>
                  <span className="text-cyan-500">→</span>
                  <span className="text-t2">Signal Acquisition</span>
                  <span className="text-cyan-500">→</span>
                  <span className="text-t2">DSP</span>
                  <span className="text-cyan-500">→</span>
                  <span className="text-emerald-400 font-semibold">Infrasound</span>
                </div>
              </div>

              {/* Hero CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded bg-cyan-600 hover:bg-cyan-500 text-t1 font-mono text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all hover:translate-y-[-1px]"
                >
                  <Activity className="w-4 h-4" />
                  Explore Live Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/architecture')}
                  className="px-5 py-2.5 rounded bg-panel hover:bg-panel text-cyan-300 border border-theme-sub font-mono text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Explore Architecture
                </button>
                <button
                  onClick={() => navigate('/validation')}
                  className="px-4 py-2.5 rounded bg-transparent hover:bg-card/60 text-t2 font-mono text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                >
                  View Validation
                  <ChevronRight className="w-4 h-4 text-t3/80" />
                </button>
              </div>
            </div>

            {/* Right Column: Simulated Live Waveform Scientific Visualizer */}
            <div className="lg:col-span-5">
              <div className="bg-card rounded-lg border border-theme-sub/80 p-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-theme text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">LIVE INFRASONIC WAVEFORM</span>
                  </div>
                  <span className="text-[10px] text-t3 bg-card/80 px-2 py-0.5 rounded border border-theme-sub">
                    Fs = 10 Hz | 0.01–20 Hz
                  </span>
                </div>

                {/* Oscilloscope Canvas */}
                <div className="relative h-44 w-full bg-deep rounded border border-theme overflow-hidden flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={460}
                    height={176}
                    className="w-full h-full block"
                  />
                  {/* CRT scanline overlay */}
                  <div className="absolute inset-0 crt-scanline pointer-events-none opacity-40" />
                </div>

                {/* Live telemetry readout footer */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 bg-panel rounded border border-theme/60">
                    <span className="text-[10px] text-t3 block">Current ΔP</span>
                    <span className="text-cyan-300 font-bold font-mono">
                      {currentReading.pressure >= 0 ? `+${currentReading.pressure}` : currentReading.pressure} Pa
                    </span>
                  </div>
                  <div className="p-2 bg-panel rounded border border-theme/60">
                    <span className="text-[10px] text-t3 block">Temperature</span>
                    <span className="text-t2 font-semibold font-mono">{currentReading.temperature} °C</span>
                  </div>
                  <div className="p-2 bg-panel rounded border border-theme/60">
                    <span className="text-[10px] text-t3 block">RMS Fluctuation</span>
                    <span className="text-teal-700 dark:text-teal-300 font-semibold font-mono">{currentReading.signalRms} Pa</span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-t3/80 text-right">
                  Real-time simulation engine • Physics-based synthesis
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO METRICS (4 TECHNICAL CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-lg bg-panel border border-theme relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1 flex items-center justify-between">
              <span>FREQUENCY BAND</span>
              <Activity className="w-4 h-4 text-cyan-500/60" />
            </div>
            <div className="text-2xl font-bold font-mono text-t1 mt-1">0.01 – 20 Hz</div>
            <p className="text-xs text-t3 mt-2 leading-relaxed">
              Sub-audible acoustic spectrum spanning microbaroms, volcanic tremor, and atmospheric gravity waves.
            </p>
            <div className="mt-3">
              <Badge type="TARGET" size="sm" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-lg bg-panel border border-theme relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1 flex items-center justify-between">
              <span>SENSING PRINCIPLE</span>
              <Gauge className="w-4 h-4 text-cyan-500/60" />
            </div>
            <div className="text-2xl font-bold font-mono text-t1 mt-1">Differential MEMS</div>
            <p className="text-xs text-t3 mt-2 leading-relaxed">
              Piezoresistive silicon diaphragm measuring ΔP across a pneumatic capillary leak rather than 100 kPa absolute.
            </p>
            <div className="mt-3">
              <Badge type="TARGET" size="sm" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-lg bg-panel border border-theme relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1 flex items-center justify-between">
              <span>EMBEDDED PROCESSING</span>
              <Cpu className="w-4 h-4 text-cyan-500/60" />
            </div>
            <div className="text-2xl font-bold font-mono text-t1 mt-1">STM32 + DSP</div>
            <p className="text-xs text-t3 mt-2 leading-relaxed">
              ARM Cortex-M4 with hardware FPU for real-time 4th-order IIR bandpass filtering & 1024-pt Welch PSD.
            </p>
            <div className="mt-3">
              <Badge type="TARGET" size="sm" />
            </div>
          </div>

          {/* Card 4: Prototype Cost Target */}
          <div className="p-5 rounded-lg bg-panel border border-theme relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1 flex items-center justify-between">
              <span>TARGET PROTOTYPE COST</span>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                Target Cost
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">₹8,000 – ₹15,000</div>
            <p className="text-xs text-t3 mt-2 leading-relaxed">
              Target prototype cost estimate based on COTS MEMS and embedded hardware. Not final cost until BOM finalized.
            </p>
            <div className="mt-3">
              <Badge type="TARGET" size="sm" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM SECTION: Why Infrasound Detection Is Difficult */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme shadow-xl">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Instrumentation Challenge
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-t1 tracking-tight">
              Why Infrasound Detection Is Difficult
            </h2>
            <p className="text-t2 text-sm sm:text-base mt-3 leading-relaxed">
              Infrasonic signals occupy very low frequencies (0.01–20 Hz) and can be significantly affected by environmental pressure variations, wind-generated disturbances, thermal drift and sensor noise. The project therefore focuses on the <span className="text-cyan-600 dark:text-cyan-300 font-semibold">complete measurement chain</span> rather than only the pressure sensor.
            </p>
          </div>

          {/* Interactive Problem Visual: Buried vs Separated Signal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Diagram Column */}
            <div className="lg:col-span-7 bg-deep p-5 rounded-lg border border-theme">
              <div className="flex items-center justify-between pb-3 border-b border-theme text-xs font-mono">
                <span className="text-t2 font-semibold">PHYSICAL SIGNAL COMPOSITION</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveProblemTab('buried')}
                    className={`px-2.5 py-1 rounded text-[11px] ${
                      activeProblemTab === 'buried'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                        : 'text-t3 hover:text-t1'
                    }`}
                  >
                    Raw Combined Noise
                  </button>
                  <button
                    onClick={() => setActiveProblemTab('separated')}
                    className={`px-2.5 py-1 rounded text-[11px] ${
                      activeProblemTab === 'separated'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'text-t3 hover:text-t1'
                    }`}
                  >
                    Isolated Infrasound
                  </button>
                </div>
              </div>

              {activeProblemTab === 'buried' ? (
                <div className="mt-4 space-y-3 font-mono text-xs">
                  {/* Atmospheric Pressure */}
                  <div className="p-3 bg-deep/80 rounded border border-theme flex items-center justify-between">
                    <div>
                      <span className="text-t3 text-[10px] block">COMMON-MODE PRESSURE</span>
                      <span className="text-t1 font-semibold">Atmospheric Baseline Tides</span>
                    </div>
                    <span className="text-amber-400 font-bold">~ 101,325 ± 2,000 Pa</span>
                  </div>

                  <div className="text-center text-t3/80 text-xs font-bold">+</div>

                  {/* Wind Disturbance */}
                  <div className="p-3 bg-deep/80 rounded border border-rose-900/30 flex items-center justify-between">
                    <div>
                      <span className="text-t3 text-[10px] block">DYNAMIC TURBULENCE</span>
                      <span className="text-rose-300 font-semibold">Wind Dynamic Pressure (0.5·ρ·v²)</span>
                    </div>
                    <span className="text-rose-400 font-bold">10 to 50 Pa (Turbulent)</span>
                  </div>

                  <div className="text-center text-t3/80 text-xs font-bold">+</div>

                  {/* Temperature & Electronic Noise */}
                  <div className="p-3 bg-deep/80 rounded border border-theme flex items-center justify-between">
                    <div>
                      <span className="text-t3 text-[10px] block">THERMAL DRIFT & ADC NOISE</span>
                      <span className="text-t2 font-semibold">Diurnal Drift + 1/f Flicker</span>
                    </div>
                    <span className="text-t3 font-bold">0.05 to 0.5 Pa</span>
                  </div>

                  <div className="text-center text-cyan-600 dark:text-cyan-400 text-xs font-bold">↓ MEASURED COMPOSITE SIGNAL</div>

                  {/* Target Buried Signal Highlight */}
                  <div className="p-4 bg-cyan-500/10/40 rounded border border-cyan-500/50 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-cyan-600 dark:text-cyan-400 text-[10px] font-bold block uppercase tracking-wider">
                          DESIRED INFRASONIC SIGNAL (BURIED)
                        </span>
                        <span className="text-cyan-200 text-sm font-bold">
                          Acoustic Infrasonic Fluctuation (0.01–20 Hz)
                        </span>
                      </div>
                      <span className="text-emerald-400 text-base font-bold">0.01 to 2.0 Pa</span>
                    </div>
                    <p className="text-[11px] text-cyan-200/80 mt-2 font-sans">
                      The signal is up to <strong>100,000× smaller</strong> than ambient pressure, and <strong>20–50× smaller</strong> than wind turbulence! Without pneumatic conditioning and spatial filtering, no raw pressure sensor can resolve it.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-5 bg-deep rounded border border-cyan-500/30 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    After Infrasense Conditioning Chain:
                  </div>
                  <div className="p-3 bg-panel rounded border border-theme text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-t3">Pneumatic High-Pass Leak:</span>
                      <span className="text-emerald-400 font-semibold">Rejects 101 kPa common-mode DC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-t3">Porous Array Spatial Averaging:</span>
                      <span className="text-emerald-400 font-semibold">-18 dB Wind Turbulence Suppression</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-t3">24-bit Delta-Sigma ADC:</span>
                      <span className="text-emerald-400 font-semibold">0.01 Pa Equivalent Resolution</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-t3">STM32 Zero-Phase BPF:</span>
                      <span className="text-cyan-600 dark:text-cyan-300 font-semibold">Clean 0.01–20 Hz Infrasound Recovered</span>
                    </div>
                  </div>
                  <div className="text-xs text-t2 font-sans leading-relaxed">
                    By attacking noise at every physical stage—acoustically, pneumatically, electronically, and digitally—INFRASENSE extracts coherent infrasonic wavefronts that would otherwise be permanently lost.
                  </div>
                </div>
              )}
            </div>

            {/* Explanation Right Column */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-lg font-bold text-t1 font-mono flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Engineering Trade-Offs
              </h3>
              <p className="text-t2 text-xs sm:text-sm leading-relaxed">
                Most IoT weather stations use absolute barometers (e.g. BMP280, MS5611). When exposed to outdoor conditions, wind gusts cause pressure spikes that exceed normal infrasound by several orders of magnitude.
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded bg-deep border-l-2 border-cyan-400 text-xs text-t2">
                  <strong className="text-t1 block font-mono">1. Long Wavelength Physics</strong>
                  At 0.1 Hz, the acoustic wavelength is approximately 3.4 kilometers. Spatial arrays leverage this coherence to differentiate true infrasound from localized wind vortices.
                </div>
                <div className="p-3 rounded bg-deep border-l-2 border-cyan-400 text-xs text-t2">
                  <strong className="text-t1 block font-mono">2. Pneumatic Equalization</strong>
                  A reference chamber with a micro-capillary acts as a high-pass acoustic filter, preventing mechanical saturation while preserving sub-Hertz sensitivity.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION: 6 CONNECTED CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">
            Multi-Stage Hardware & Signal Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-t1 tracking-tight">
            Our Approach
          </h2>
          <p className="text-t3 text-sm mt-2">
            Six cohesive engineering subsystems working seamlessly to isolate, condition, and analyze low-frequency atmospheric pressure waves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                className="p-6 rounded-xl bg-card border border-theme hover:border-cyan-500/50 transition-all duration-200 group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-cyan-500/40 group-hover:text-cyan-600 dark:text-cyan-400 transition-colors">
                      {card.num}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10/60 border border-cyan-800/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:border-cyan-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-t1 group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-t3 mt-2 leading-relaxed font-sans">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-theme/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-t3/80">SPEC:</span>
                  <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{card.spec}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SYSTEM FLOW SECTION (Interactive Responsive Flow Diagram) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                END-TO-END INSTRUMENTATION PIPELINE
              </div>
              <h2 className="text-2xl font-bold text-t1">System Signal Flow</h2>
              <p className="text-xs text-t3 mt-1">
                Click any stage to inspect detailed component parameters and transfer functions on the Architecture page.
              </p>
            </div>
            <button
              onClick={() => navigate('/architecture')}
              className="px-4 py-2 rounded bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              Open Full Architecture
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Responsive Vertical/Horizontal Flow Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {flowBlocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={() => navigate('/architecture')}
                className="p-4 rounded-lg bg-panel border border-theme hover:border-cyan-400 hover:bg-panel cursor-pointer transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-cyan-600 dark:text-cyan-400 mb-1">
                    <span>STEP {String(idx + 1).padStart(2, '0')}</span>
                    <span className="text-t3/80 group-hover:text-cyan-600 dark:text-cyan-400 transition-colors">↗</span>
                  </div>
                  <div className="text-xs font-bold text-t1 group-hover:text-cyan-300 font-mono tracking-wide">
                    {block.name}
                  </div>
                  <p className="text-[11px] text-t3 mt-1 font-sans">
                    {block.sub}
                  </p>
                </div>
                {idx < flowBlocks.length - 1 && (
                  <div className="text-right text-slate-600 text-xs font-mono mt-3 hidden lg:block">
                    ↓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
