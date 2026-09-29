import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { Badge } from './Badge';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface ReportModalProps { isOpen: boolean; onClose: () => void; }

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { readings, stats, status, simParams, projectConfig } = useSensor();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-panel text-t1 border border-theme rounded-xl max-w-3xl w-full p-6 shadow-2xl my-8 transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-500" />
            <h2 className="text-base font-mono font-bold text-t1 tracking-wide">Scientific Measurement Report</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-1.5 text-t3 hover:text-t1 rounded hover:bg-card">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5 text-sm">
          {/* Report header */}
          <div className="border-b-2 border-theme pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-t1 font-mono">{projectConfig.projectName}</h1>
              <p className="text-cyan-500 text-xs font-mono">{projectConfig.subtitle}</p>
              <p className="text-t3 text-xs mt-1">{projectConfig.subText}</p>
            </div>
            <div className="text-right">
              <Badge type={status.source === 'simulation' ? 'SIMULATED' : 'MEASURED'} size="md" />
              <div className="text-[11px] font-mono text-t3 mt-2">
                Report: INF-REP-{Date.now().toString().slice(-6)}<br />
                {new Date().toUTCString()}
              </div>
            </div>
          </div>

          {/* Instrument params */}
          <div className="bg-card p-4 rounded-lg border border-theme">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold mb-3">1. Instrumentation Setup</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              {[
                ['Transducer', 'MEMS Differential'],
                ['Range', projectConfig.sensorRange],
                ['Sampling Fs', `${status.samplingRate} Hz`],
                ['Bandwidth', `${projectConfig.frequencyMin}–${projectConfig.frequencyMax} Hz`],
                ['Pneumatic fc', '0.005 Hz'],
                ['Wind Array', simParams.windFilterEnabled ? 'Active (−18 dB)' : 'Bypassed'],
                ['ADC', '24-bit Delta-Sigma'],
                ['MCU', 'STM32 Cortex-M4'],
              ].map(([k, v]) => (
                <div key={k}>
                  <span className="text-t3 block">{k}</span>
                  <span className="text-t1 font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card p-4 rounded-lg border border-theme">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-semibold mb-3">2. Statistical Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
              {[
                ['Signal RMS', `${stats.rmsValue} Pa`, 'text-cyan-500'],
                ['Noise Floor', `${stats.noiseFloor} Pa RMS`, 'text-t2'],
                ['Dominant Freq', `${stats.dominantFreq} Hz`, 'text-cyan-500'],
                ['Mean Temp', `${stats.avgTemp} °C`, 'text-t1'],
                ['Temp Range', `${stats.minTemp}–${stats.maxTemp} °C`, 'text-t1'],
                ['Samples', `${readings.length}`, 'text-t1'],
              ].map(([label, val, color]) => (
                <div key={label} className="p-3 bg-base rounded border border-theme">
                  <span className="text-t3 block">{label}</span>
                  <span className={`text-base font-bold ${color}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclosures */}
          <div className="border border-theme p-4 rounded-lg space-y-2 text-xs text-t2">
            <h4 className="font-mono text-cyan-500 font-semibold uppercase">3. Verification Disclosures</h4>
            {[
              `Data recorded under: ${status.source === 'simulation' ? 'SYNTHETIC BENCH SIMULATION' : 'PHYSICAL HARDWARE STREAM'}.`,
              'Wind attenuation, noise floor, and sensitivity values are currently simulation-derived targets.',
              'Report prepared for SIH26144 evaluation. All algorithms adhere to zero-phase Butterworth filtering and Welch PSD estimation.',
            ].map((txt, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{txt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
