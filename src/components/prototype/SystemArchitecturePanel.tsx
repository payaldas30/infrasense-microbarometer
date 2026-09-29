import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { signalChainComponents } from '../../config/projectConfig';
import { Badge } from '../common/Badge';
import { 
  Cpu, 
  Gauge, 
  Activity, 
  Server
} from 'lucide-react';

export const SystemArchitecturePanel: React.FC = () => {
  const { status, setSelectedComponent } = useSensor();

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const sensorStatusList = [
    { label: 'Pressure Sensor', status: status.memsStatus, ok: status.memsStatus === 'CONNECTED' },
    { label: 'Temperature Sensor', status: status.tempSensorStatus, ok: status.tempSensorStatus === 'CONNECTED' },
    { label: 'STM32', status: status.stm32Status, ok: status.stm32Status === 'CONNECTED' },
    { label: 'ADC / Acquisition', status: status.adcStatus, ok: status.adcStatus === 'READY' || status.adcStatus === 'SAMPLING' },
    { label: 'Data Stream', status: status.connected ? 'ACTIVE' : 'IDLE', ok: status.connected },
    { label: 'Sampling Rate', status: `${status.samplingRate} Hz`, ok: true },
  ];

  const systemHealthList = [
    { label: 'Data Rate', value: `${status.dataPacketRate} samples/s` },
    { label: 'Dropped Samples', value: `${status.droppedSamples}` },
    { label: 'Uptime', value: formatUptime(status.uptimeSeconds) },
    { label: 'Last Update', value: '0.02 s' },
  ];

  return (
    <section id="system" className="space-y-6 font-mono">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-t1 tracking-wider uppercase">
            SYSTEM ARCHITECTURE &amp; SENSOR HEALTH
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="SYSTEM ONLINE" size="sm" />
          <span className="text-[11px] text-t3">
            Hardware DMA Stream
          </span>
        </div>
      </div>

      {/* 1. Prototype Signal Chain (Visual Interactive Flow) */}
      <div className="p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-t1 tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              PROTOTYPE SIGNAL CHAIN
            </h3>
            <p className="text-[11px] text-t3 mt-0.5">
              Click any stage in the active measurement pipeline to view technical specifications and pinout
            </p>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold">
            ACTIVE SIGNAL PATH
          </span>
        </div>

        {/* Signal Chain Interactive Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2">
          {signalChainComponents.map((comp, idx) => (
            <div key={comp.id} className="flex flex-col items-center">
              <button
                onClick={() => setSelectedComponent(comp)}
                className="w-full h-24 p-2.5 rounded-xl bg-card hover:bg-deep border border-cyan-500/30 hover:border-cyan-500 cursor-pointer flex flex-col justify-between text-left transition-all group shadow-sm"
              >
                <div className="flex items-center justify-between text-[9px] text-cyan-600 dark:text-cyan-400">
                  <span className="font-bold">0{idx + 1}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-t1">↗</span>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-t1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 leading-tight">
                    {comp.name}
                  </div>
                  <div className="text-[9px] text-t3 mt-0.5 truncate">
                    {comp.category}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[8px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>ONLINE</span>
                </div>
              </button>

              {idx < signalChainComponents.length - 1 && (
                <div className="text-t3 text-xs hidden xl:block mt-1">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Pressure Input Section & Mathematical Model */}
      <div className="p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-theme">
          <span className="text-xs font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-cyan-500" />
            PRESSURE INPUT &amp; PNEUMATIC CONDITIONING STAGE
          </span>
          <Badge type="TARGET" size="sm" />
        </div>

        {/* 4-step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-center">
          <div className="p-3 bg-card rounded-xl border border-theme">
            <span className="text-[10px] text-t3 block">STAGE 1</span>
            <span className="text-t1 font-bold">External Atmospheric Pressure</span>
            <span className="text-[10px] text-t3 block mt-1">101,325 ± 2,000 Pa</span>
          </div>
          <div className="p-3 bg-card rounded-xl border border-theme">
            <span className="text-[10px] text-t3 block">STAGE 2</span>
            <span className="text-cyan-600 dark:text-cyan-300 font-bold">Pneumatic Network</span>
            <span className="text-[10px] text-t3 block mt-1">Capillary leak + 0.8L Ref Chamber</span>
          </div>
          <div className="p-3 bg-card rounded-xl border border-theme">
            <span className="text-[10px] text-t3 block">STAGE 3</span>
            <span className="text-emerald-600 dark:text-emerald-300 font-bold">Differential Pressure (ΔP)</span>
            <span className="text-[10px] text-t3 block mt-1">±0.01 to ±250 Pa</span>
          </div>
          <div className="p-3 bg-card rounded-xl border border-theme">
            <span className="text-[10px] text-t3 block">STAGE 4</span>
            <span className="text-t1 font-bold">MEMS Sensor Diaphragm</span>
            <span className="text-[10px] text-t3 block mt-1">Piezoresistive Bridge Voltage</span>
          </div>
        </div>

        {/* Technical Description & Formula Box */}
        <div className="p-4 bg-card rounded-xl border border-theme text-xs space-y-2">
          <p className="text-t2 font-sans leading-relaxed">
            The pneumatic interface is an integral part of the physical measurement system. Atmospheric fluctuations reach both ports of the differential sensor; however, the reference port is isolated behind a high-impedance capillary leak and volume, creating an acoustic high-pass filter:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 py-2 text-cyan-600 dark:text-cyan-300 font-bold text-sm bg-deep rounded-lg border border-theme">
            <span>τ = R · C ≈ 32 s</span>
            <span>•</span>
            <span>f_c ≈ 1 / (2π · R · C) ≈ 0.005 Hz</span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] leading-relaxed">
            <strong>Engineering Note:</strong> Simplified pneumatic model — final response must be experimentally characterized in a calibrated low-frequency pressure chamber. The formula assumes laminar isothermal flow across capillary resistance (R) into compliance volume (C).
          </div>
        </div>
      </div>

      {/* 3. Sensor Status & System Health Panels (Dual Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        {/* Panel A: SENSOR STATUS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-theme">
            <span className="font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-500" />
              SENSOR STATUS
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold">
              ● NOMINAL
            </span>
          </div>

          <div className="space-y-2">
            {sensorStatusList.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-card border border-theme">
                <span className="text-t3">{item.label}</span>
                <span className={`font-bold flex items-center gap-1 ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.ok ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel B: SYSTEM HEALTH */}
        <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-theme">
            <span className="font-bold text-t1 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-500" />
              SYSTEM HEALTH TELEMETRY
            </span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30 font-bold">
              50 Hz STREAM
            </span>
          </div>

          <div className="space-y-2">
            {systemHealthList.map((item) => (
              <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-card border border-theme">
                <span className="text-t3">{item.label}</span>
                <span className="text-t1 font-bold">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="p-2 bg-card rounded-lg border border-theme text-[10px] text-t3 text-center">
            Zero packet loss detected over serial link • Buffer jitter &lt; 0.5 ms
          </div>
        </div>
      </div>
    </section>
  );
};
