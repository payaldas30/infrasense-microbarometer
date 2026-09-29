import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { initialBOM, initialDevStatus } from '../config/projectConfig';
import { BOMItem, DevStatusItem, DevStatusState } from '../types';
import { CheckCircle2, Clock, Circle, Edit2, Check, X, Cpu, Gauge, Thermometer, Layers, Wind, Package } from 'lucide-react';

const statusIcon: Record<DevStatusState, React.ReactNode> = {
  complete: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  in_progress: <Clock className="w-4 h-4 text-amber-400" />,
  pending: <Circle className="w-4 h-4 text-t3/80" />,
};
const statusLabel: Record<DevStatusState, string> = {
  complete: 'COMPLETE',
  in_progress: 'IN PROGRESS',
  pending: 'PENDING',
};
const statusStyle: Record<DevStatusState, string> = {
  complete: 'text-emerald-400 bg-emerald-500/10/30 border-emerald-700/40',
  in_progress: 'text-amber-400 bg-amber-500/10/30 border-amber-700/40',
  pending: 'text-t3 bg-card/40 border-theme-sub/40',
};

const hardwareSections = [
  {
    id: 'sensor',
    icon: Gauge,
    title: 'MEMS Differential Pressure Sensor',
    sub: 'Core transduction element',
    desc: 'Silicon piezoresistive micro-machined diaphragm that measures the differential pressure between the atmospheric inlet and the pneumatically equalized reference chamber. The ultra-low pressure range (±100–500 Pa) is specifically selected for infrasound — not conventional weather sensing.',
    specs: [
      ['Type', 'Differential Piezoresistive MEMS'],
      ['Candidate Range', '±250 Pa / ±500 Pa variants'],
      ['Interface', 'I2C / SPI digital output'],
      ['Target Resolution', '0.005–0.015 Pa RMS equivalent'],
      ['Supply', '3.3 V DC, < 3 mA'],
    ],
    status: 'TARGET' as const,
  },
  {
    id: 'controller',
    icon: Cpu,
    title: 'STM32 ARM MCU Controller',
    sub: 'Embedded acquisition & DSP host',
    desc: 'ARM Cortex-M4 microcontroller with hardware single-precision FPU executing DMA-triggered sampling, zero-phase IIR/FIR filtering, FFT estimation, and USB-VCP / UART telemetry framing. All processing runs deterministically without an RTOS scheduler jitter.',
    specs: [
      ['Core', 'ARM Cortex-M4 + FPU'],
      ['Candidate', 'STM32F401 / STM32F411 @ 84–100 MHz'],
      ['Peripherals', 'SPI, I2C, UART, DMA, TIM'],
      ['Telemetry', 'USB-VCP + optional UART/Wi-Fi'],
      ['Power', '3.3 V, < 120 mW active mode'],
    ],
    status: 'TARGET' as const,
  },
  {
    id: 'temp',
    icon: Thermometer,
    title: 'High-Resolution Temperature Sensor',
    sub: 'Reference chamber thermal monitor',
    desc: 'Silicon bandgap digital thermometer providing 16-bit temperature data at 0.0078 °C resolution for real-time dynamic compensation of thermal drift in the pneumatic reference chamber (PV = nRT effect).',
    specs: [
      ['Type', 'Silicon bandgap digital I2C'],
      ['Candidate', 'TI TMP117 / Sensirion SHT40'],
      ['Resolution', '0.0078 °C (16-bit word)'],
      ['Accuracy', '±0.1 °C (max ±0.2 °C)'],
      ['Supply', '1.8–3.3 V, < 15 µA'],
    ],
    status: 'TARGET' as const,
  },
  {
    id: 'adc',
    icon: Layers,
    title: 'Analog Front-End & ADC',
    sub: '24-bit precision acquisition',
    desc: 'Ultra-low-noise instrumentation amplifier and 24-bit Delta-Sigma ADC ensures quantization noise remains well below the MEMS sensor\'s own thermal noise floor. The precision low-dropout voltage reference is critical to eliminate ADC reference noise from masking sub-0.01 Pa signals.',
    specs: [
      ['Candidate', 'TI ADS1220 / ADS1256 (24-bit)'],
      ['ENOB', '> 19.5 bits effective'],
      ['Noise', '< 1 µV RMS internal (at 20 SPS)'],
      ['Interface', 'SPI with hardware DRDY pin'],
      ['Reference', '0.05 ppm/°C low-drift VREF'],
    ],
    status: 'TARGET' as const,
  },
  {
    id: 'pneumatic',
    icon: Wind,
    title: 'Pneumatic System',
    sub: 'Wind filter + reference chamber + capillary',
    desc: 'The most critical mechanical subsystem. Includes: (1) 4-arm star porous capillary hose wind noise reduction array, (2) 0.8L thermally insulated aluminum reference chamber, (3) high-impedance precision glass capillary acoustic leak creating fc ≈ 0.005 Hz mechanical high-pass barrier.',
    specs: [
      ['Wind Array', '4-arm porous PE tubing manifold'],
      ['Ref. Chamber', '0.8L aluminum + EPS insulation'],
      ['Capillary', 'Precision glass / needle valve (fc ≈ 0.005 Hz)'],
      ['Wind Suppression', '~15–22 dB (target; simulation)'],
      ['Materials', 'Silicone tube, sintered porous PE cap'],
    ],
    status: 'SIMULATED' as const,
  },
  {
    id: 'enclosure',
    icon: Package,
    title: 'Weatherproof Enclosure & Housing',
    sub: 'IP66 outdoor instrumentation housing',
    desc: 'Ruggedized IP66-rated outdoor housing with silicone gaskets, desiccant breather, vibration isolation rubber mounts, and external atmospheric inlet cap. Critical for field deployment in desert, coastal, or alpine environments.',
    specs: [
      ['Protection', 'IP66 (dust-tight, water-jet resistant)'],
      ['Material', 'ABS or aluminum die-cast'],
      ['Inlet', 'Sintered porous cap (acoustic transparent)'],
      ['Cable Entry', 'PG-7 gland (USB + Power)'],
      ['Thermal', 'Internal desiccant + EPS inner lining'],
    ],
    status: 'TARGET' as const,
  },
];

export const HardwarePage: React.FC = () => {
  const [bomItems, setBomItems] = useState<BOMItem[]>(initialBOM);
  const [devStatus, setDevStatus] = useState<DevStatusItem[]>(initialDevStatus);
  const [editingBom, setEditingBom] = useState<string | null>(null);
  const [editBomCost, setEditBomCost] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('sensor');

  const handleBomEdit = (id: string, currentCost: number | null) => {
    setEditingBom(id);
    setEditBomCost(currentCost !== null ? String(currentCost) : '');
  };

  const handleBomSave = (id: string) => {
    const val = parseFloat(editBomCost);
    setBomItems(prev => prev.map(item => {
      if (item.id === id) {
        const unitCost = isNaN(val) ? null : val;
        return { ...item, unitCost, totalCost: unitCost !== null ? unitCost * item.quantity : null };
      }
      return item;
    }));
    setEditingBom(null);
  };

  const totalCost = bomItems.reduce((sum, i) => sum + (i.totalCost || 0), 0);
  const allPriced = bomItems.every(i => i.totalCost !== null);

  const activeHW = hardwareSections.find(s => s.id === activeSection)!;
  const ActiveIcon = activeHW.icon;

  const completedCount = devStatus.filter(d => d.status === 'complete').length;
  const inProgressCount = devStatus.filter(d => d.status === 'in_progress').length;
  const progressPct = Math.round((completedCount + inProgressCount * 0.5) / devStatus.length * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">Prototype Build Status</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">Prototype Hardware</h1>
        <p className="text-xs text-t3 font-mono mt-1">
          Interactive hardware specification explorer, BOM, and development milestone tracker
        </p>
      </div>

      {/* Hardware Section Selector + Detail Panel */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <h2 className="text-lg font-bold text-t1 font-mono mb-5">System Hardware Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {hardwareSections.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  activeSection === s.id
                    ? 'border-cyan-500/70 bg-cyan-500/10/40'
                    : 'border-theme bg-deep hover:border-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${activeSection === s.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-t3/80'}`} />
                <div className="text-[11px] font-mono font-bold text-t1 leading-tight">{s.title.split(' ').slice(0, 3).join(' ')}</div>
                <div className="text-[10px] font-mono text-t3/80 mt-0.5">{s.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="p-5 rounded-xl bg-deep border border-theme">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <ActiveIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-lg font-bold text-t1 font-mono">{activeHW.title}</h3>
                <Badge type={activeHW.status} size="sm" />
              </div>
              <p className="text-xs text-t3 font-mono mb-1">{activeHW.sub}</p>
              <p className="text-sm text-t2 font-sans leading-relaxed mt-2">{activeHW.desc}</p>
            </div>
            <div className="md:w-72 shrink-0">
              <div className="text-[10px] font-mono uppercase tracking-wider text-t3/80 mb-2">Technical Specifications</div>
              <div className="space-y-0">
                {activeHW.specs.map(([key, val]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-theme/60 text-xs font-mono">
                    <span className="text-t3">{key}</span>
                    <span className="text-t2 font-medium text-right ml-2 max-w-[55%]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-t1 font-mono">Bill of Materials (BOM)</h2>
            <p className="text-xs text-t3 font-mono mt-0.5">Click the edit icon to update component costs as quotes are received</p>
          </div>
          <Badge type="TARGET" size="md" />
        </div>

        <div className="overflow-x-auto rounded-lg border border-theme">
          <table className="w-full text-xs font-mono">
            <thead className="bg-deep border-b border-theme">
              <tr>
                {['Component', 'Description', 'Qty', 'Unit Cost (₹)', 'Total (₹)', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] uppercase tracking-wider text-t3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {bomItems.map(item => (
                <tr key={item.id} className="hover:bg-card/20 transition-colors">
                  <td className="px-4 py-3 text-t1 font-semibold whitespace-nowrap">{item.component}</td>
                  <td className="px-4 py-3 text-t3 max-w-xs">{item.description}</td>
                  <td className="px-4 py-3 text-center text-t2">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">
                    {editingBom === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-t3">₹</span>
                        <input
                          type="number"
                          value={editBomCost}
                          onChange={e => setEditBomCost(e.target.value)}
                          className="w-20 bg-panel border border-cyan-500 rounded px-1.5 py-1 text-cyan-300 text-xs font-mono focus:outline-none"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className={item.unitCost !== null ? 'text-cyan-300 font-semibold' : 'text-t3/80'}>
                        {item.unitCost !== null ? `₹${item.unitCost.toLocaleString()}` : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={item.totalCost !== null ? 'text-cyan-300 font-bold' : 'text-t3/80'}>
                      {item.totalCost !== null ? `₹${item.totalCost.toLocaleString()}` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${
                      item.status === 'Procured' ? 'bg-emerald-500/10/40 border-emerald-700/40 text-emerald-300'
                      : item.status === 'Quoted' ? 'bg-cyan-500/10/40 border-cyan-700/40 text-cyan-300'
                      : 'bg-card border-theme-sub text-t3'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingBom === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleBomSave(item.id)} className="p-1 text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingBom(null)} className="p-1 text-t3 hover:text-t1"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <button onClick={() => handleBomEdit(item.id, item.unitCost)} className="p-1 text-t3/80 hover:text-cyan-600 dark:text-cyan-400 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-deep border-t border-theme-sub">
              <tr>
                <td colSpan={3} className="px-4 py-3 font-bold text-t2 uppercase tracking-wider">Total Prototype Cost</td>
                <td colSpan={2} className="px-4 py-3 text-center">
                  <span className={`text-base font-bold font-mono ${allPriced ? 'text-amber-300' : 'text-t3/80'}`}>
                    {allPriced ? `₹${totalCost.toLocaleString()}` : '₹ —'}
                  </span>
                  {!allPriced && <div className="text-[10px] text-t3/80 mt-0.5">Awaiting all component quotes</div>}
                </td>
                <td colSpan={2} className="px-4 py-3">
                  <Badge type="TARGET" size="sm" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-[10px] font-mono text-t3/80 mt-3">
          Target prototype cost range: ₹8,000–₹15,000. All costs are estimated figures for prototype. Final cost subject to actual supplier quotes, PCB fabrication, and assembly.
        </p>
      </div>

      {/* Development Progress */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-bold text-t1 font-mono">Development Milestone Tracker</h2>
            <p className="text-xs text-t3 font-mono mt-0.5">Overall progress toward functional prototype</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-sm">
            <div className="text-emerald-400">{completedCount} Complete</div>
            <div className="text-amber-400">{inProgressCount} In Progress</div>
            <div className="text-t3/80">{devStatus.filter(d => d.status === 'pending').length} Pending</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-t3 mb-1.5">
            <span>Overall Completion</span>
            <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-card">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-600 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {devStatus.map((item, idx) => (
            <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border ${
              item.status === 'complete' ? 'border-emerald-800/30 bg-emerald-500/10/10'
              : item.status === 'in_progress' ? 'border-amber-800/30 bg-amber-500/10/10'
              : 'border-theme bg-deep'
            }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-[10px] font-mono text-t3/80 shrink-0 w-5">{String(idx + 1).padStart(2, '0')}</span>
                {statusIcon[item.status]}
                <div>
                  <div className="text-xs font-mono font-semibold text-t2">{item.milestone}</div>
                  <div className="text-[11px] font-mono text-t3 mt-0.5">{item.notes}</div>
                </div>
              </div>
              <div className="shrink-0">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${statusStyle[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
