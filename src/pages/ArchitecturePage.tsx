import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { initialComponentSpecs } from '../config/projectConfig';
import { ComponentSpec } from '../types';
import { X, ChevronRight, ExternalLink, Layers, Cpu, Gauge, Activity, Thermometer, Wind } from 'lucide-react';

const blockConfig = [
  { id: 'wind-noise', label: 'WIND-NOISE REDUCTION', sub: 'Porous Line Array', color: 'border-cyan-600/60 hover:border-cyan-400', icon: Wind },
  { id: 'pneumatic-conditioning', label: 'PNEUMATIC CONDITIONING', sub: 'Capillary Equalization', color: 'border-cyan-600/60 hover:border-cyan-400', icon: Gauge },
  { id: 'mems-sensor', label: 'MEMS DIFFERENTIAL SENSOR', sub: 'ΔP Measurement', color: 'border-teal-500/60 hover:border-teal-400', icon: Activity },
  { id: 'signal-acquisition', label: 'SIGNAL ACQUISITION & AFE', sub: '24-bit Delta-Sigma ADC', color: 'border-indigo-500/60 hover:border-indigo-400', icon: Layers },
  { id: 'temperature-sensor', label: 'TEMPERATURE SENSOR', sub: 'Thermal Monitor', color: 'border-amber-600/60 hover:border-amber-400', icon: Thermometer },
  { id: 'stm32-processor', label: 'STM32 MCU / DSP ENGINE', sub: 'Cortex-M4 + FPU', color: 'border-violet-500/60 hover:border-violet-400', icon: Cpu },
];

const SpecDetail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="py-2.5 border-b border-theme/80 grid grid-cols-5 gap-2 text-xs">
    <span className="col-span-2 text-t3 font-mono">{label}</span>
    <span className="col-span-3 text-t2 font-mono font-medium break-words">{value}</span>
  </div>
);

const DetailPanel: React.FC<{ spec: ComponentSpec; onClose: () => void }> = ({ spec, onClose }) => (
  <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-card border-l border-theme-sub shadow-2xl overflow-y-auto flex flex-col">
    <div className="flex items-center justify-between px-5 py-4 border-b border-theme sticky top-0 bg-card z-10">
      <div>
        <h3 className="text-sm font-bold font-mono text-t1">{spec.name}</h3>
        <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 capitalize">{spec.category} subsystem</span>
      </div>
      <button onClick={onClose} className="p-1.5 text-t3 hover:text-t1 rounded hover:bg-card">
        <X className="w-5 h-5" />
      </button>
    </div>
    <div className="px-5 py-4 flex-1 space-y-1">
      <div className="p-3 rounded bg-amber-500/10/30 border border-amber-800/30 text-[10px] font-mono text-amber-300 mb-3">
        ⚠ Specifications below are engineering targets / candidate evaluations. Final values pending prototype measurement.
      </div>
      <SpecDetail label="Sensing Principle" value={spec.sensingPrinciple} />
      <SpecDetail label="Pressure Range" value={spec.pressureRange} />
      <SpecDetail label="Interface Type" value={spec.interfaceType} />
      <SpecDetail label="Resolution / Performance" value={spec.resolution} />
      <SpecDetail label="Response Time" value={spec.responseTime} />
      <SpecDetail label="Supply Voltage" value={spec.supplyVoltage} />
      <SpecDetail label="Thermal Characteristics" value={spec.temperatureCharacteristics} />
      <div className="py-2.5 border-b border-theme/80 grid grid-cols-5 gap-2 text-xs">
        <span className="col-span-2 text-t3 font-mono">Selected Component</span>
        <span className="col-span-3 text-cyan-300 font-mono font-semibold break-words">{spec.selectedComponent}</span>
      </div>
      <div className="pt-4">
        <p className="text-[11px] text-t2 font-sans leading-relaxed bg-panel p-3 rounded border border-theme">
          <span className="font-mono text-t3 block mb-1">Engineering Note:</span>
          {spec.notes}
        </p>
      </div>
      {spec.datasheetUrl && (
        <a
          href={spec.datasheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Datasheet / Reference
        </a>
      )}
    </div>
  </div>
);

export const ArchitecturePage: React.FC = () => {
  const [selected, setSelected] = useState<ComponentSpec | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Side Panel */}
      {selected && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <DetailPanel spec={selected} onClose={() => setSelected(null)} />
        </>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">End-To-End Signal Chain</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">System Architecture</h1>
          <p className="text-xs text-t3 font-mono mt-1">Click any block to inspect component specifications, sensing principle, and interface protocol</p>
        </div>
      </div>

      {/* Architecture Diagram */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="text-center space-y-0">

          {/* ATMOSPHERE */}
          <div className="flex flex-col items-center">
            <div className="px-8 py-3 rounded-lg border border-slate-600 bg-panel text-t1 font-mono font-bold text-sm tracking-wider w-64 text-center">
              ATMOSPHERE
              <div className="text-[10px] font-normal text-t3 mt-0.5">Acoustic & Turbulent Pressure Field</div>
            </div>
            <div className="h-6 w-px bg-slate-600" />
            <div className="text-xs font-mono text-t3 mb-1">↓ Acoustic wave front</div>
            <div className="h-4 w-px bg-slate-600" />
          </div>

          {/* Main Chain */}
          {blockConfig.map((block, idx) => {
            const Icon = block.icon;
            const spec = initialComponentSpecs[block.id];
            return (
              <div key={block.id} className="flex flex-col items-center">
                <button
                  onClick={() => spec && setSelected(spec)}
                  className={`px-6 py-4 rounded-xl border-2 bg-panel cursor-pointer transition-all duration-200 hover:bg-panel hover:shadow-lg hover:shadow-cyan-900/20 w-64 text-center group ${block.color}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-300" />
                    <span className="font-mono font-bold text-sm text-t1 group-hover:text-cyan-200 tracking-wide">
                      {block.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-t3 group-hover:text-t2">{block.sub}</span>
                  <div className="mt-2 text-[10px] font-mono text-cyan-500/60 group-hover:text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1">
                    Click to inspect <ChevronRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Split at signal-acquisition (ADC + Temp in parallel) */}
                {block.id === 'signal-acquisition' ? (
                  <div className="flex items-start gap-8 mt-0">
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-slate-600" />
                      <div className="text-[10px] font-mono text-t3/80">Temperature Input</div>
                      <div className="h-4 w-px bg-slate-600" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-slate-600" />
                      <div className="text-[10px] font-mono text-t3/80">ADC / Digital</div>
                      <div className="h-4 w-px bg-slate-600" />
                    </div>
                  </div>
                ) : (
                  idx < blockConfig.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="h-6 w-px bg-slate-600" />
                      {block.id === 'mems-sensor' && <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">ΔP</div>}
                      <div className="h-4 w-px bg-slate-600" />
                    </div>
                  )
                )}
              </div>
            );
          })}

          {/* DSP Layer */}
          <div className="flex flex-col items-center">
            <div className="h-4 w-px bg-slate-600" />
            <div className="px-6 py-3 rounded-lg border border-indigo-600/60 bg-card text-center w-64">
              <div className="font-mono font-bold text-sm text-t1 tracking-wide">DIGITAL SIGNAL PROCESSING</div>
              <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">Butterworth BPF · Welch PSD · Event Detection</div>
            </div>
            <div className="h-6 w-px bg-slate-600" />
            <div className="text-xs font-mono text-t3">↓</div>
            <div className="h-4 w-px bg-slate-600" />
            <div className="px-6 py-3 rounded-lg border border-emerald-600/60 bg-deep text-center w-64">
              <div className="font-mono font-bold text-sm text-emerald-300 tracking-wide">WAVEFORM / PSD OUTPUT</div>
              <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">0.01–20 Hz Characterized Infrasound Data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pneumatic System Detail */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">Acoustic Mechanical Subsystem</div>
        <h2 className="text-xl font-bold text-t1 font-mono mb-3">Pneumatic Conditioning System</h2>
        <p className="text-sm text-t2 leading-relaxed mb-6 max-w-3xl">
          The pneumatic interface controls how atmospheric pressure fluctuations reach the sensing element. It is specifically designed to reject large-amplitude, low-frequency diurnal barometric changes (1–3 kPa over hours) while faithfully transmitting infrasonic pressure fluctuations (0.01–2.0 Pa over seconds) across the MEMS diaphragm.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {[
            { label: 'ATMOSPHERIC INLET', sub: 'Ambient open port / porous cap', color: 'border-slate-600' },
            { label: 'WIND-NOISE MANIFOLD', sub: '4-arm porous hose array', color: 'border-cyan-700' },
            { label: 'TUBE / CAPILLARY', sub: 'High-impedance precision leak', color: 'border-cyan-600' },
            { label: 'REFERENCE VOLUME', sub: '0.8L insulated chamber', color: 'border-teal-600' },
            { label: 'MEMS DIAPHRAGM', sub: 'ΔP sensed here (Pa scale)', color: 'border-emerald-600' },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              <div className={`p-3 rounded border-2 bg-deep text-center ${item.color}`}>
                <div className="text-xs font-mono font-bold text-t1">{item.label}</div>
                <div className="text-[10px] font-mono text-t3 mt-0.5">{item.sub}</div>
              </div>
              {i < 4 && <div className="text-center text-t3/80 font-mono text-sm hidden md:block">→</div>}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 p-4 bg-deep rounded border border-cyan-900/40 text-xs font-mono text-t2 space-y-2">
          <div className="text-cyan-600 dark:text-cyan-400 font-semibold">Simplified Transfer Function Model <Badge type="SIMULATED" size="sm" className="ml-2" /></div>
          <div className="text-t2">
            The pneumatic RC acoustic high-pass filter has a -3 dB cutoff frequency:
          </div>
          <div className="text-center font-mono text-cyan-300 text-sm py-2">
            f<sub>c</sub> = 1 / (2π · Z<sub>cap</sub> · V<sub>ref</sub> / (ρ · c²)) ≈ 0.005 Hz
          </div>
          <div className="text-t3 leading-relaxed">
            Where Z<sub>cap</sub> is the acoustic impedance of the capillary leak (Pa·s/m³), V<sub>ref</sub> is the reference chamber volume (m³), ρ is air density (1.225 kg/m³), and c is the speed of sound (343 m/s). This creates a first-order high-pass mechanical filter. All weather tides below 0.005 Hz equalize passively; infrasound above this frequency creates differential pressure across the diaphragm.
          </div>
          <div className="text-amber-300">
            ⚠ This model is simplified for design guidance. Actual pneumatic response characteristics depend on capillary geometry and require experimental characterization.
          </div>
        </div>
      </div>

      {/* Hardware Connectivity Architecture */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <h2 className="text-xl font-bold text-t1 font-mono mb-2">Future Hardware Connectivity</h2>
        <p className="text-sm text-t3 mb-6">
          The dashboard is architected to connect to the physical STM32 prototype via multiple telemetry paths when hardware is ready.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 font-mono text-xs">
            <div className="text-cyan-600 dark:text-cyan-400 font-bold text-sm mb-3">Path 1 — USB Serial / WebSocket</div>
            {['STM32 ARM Cortex-M4', 'USB Virtual COM Port (VCP)', 'Python / Node.js Bridge', 'WebSocket Server', 'React Dashboard'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-deep border border-theme">
                <span className="text-cyan-600 dark:text-cyan-400 w-4 text-center">{i < 4 ? '↓' : '✓'}</span>
                <span className={i === 4 ? 'text-emerald-300 font-semibold' : 'text-t2'}>{step}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="text-purple-700 dark:text-purple-400 font-bold text-sm mb-3">Path 2 — Wi-Fi / MQTT Gateway</div>
            {['STM32 + ESP8266/ESP32 (SPI)', 'Wi-Fi / Ethernet Gateway', 'MQTT Broker (Mosquitto)', 'MQTT→WebSocket Bridge', 'React Dashboard'].map((step, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-deep border border-theme">
                <span className="text-purple-700 dark:text-purple-400 w-4 text-center">{i < 4 ? '↓' : '✓'}</span>
                <span className={i === 4 ? 'text-emerald-300 font-semibold' : 'text-t2'}>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 text-[11px] font-mono text-t3/80 p-3 bg-deep/60 rounded border border-theme">
          Current status: Frontend running on simulation engine. Backend integration requires STM32 firmware with UART/USB-VCP packet framing and a lightweight Node.js/Python WebSocket gateway.
        </div>
      </div>
    </div>
  );
};
