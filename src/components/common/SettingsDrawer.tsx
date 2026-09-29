import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSensor } from '../../context/SensorContext';
import {
  X, Sun, Moon, Settings, Activity, Cpu, Users,
  RefreshCw, Check, Monitor, Sliders, Info
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'simulation' | 'instrument' | 'project';

const TabButton: React.FC<{
  id: SettingsTab; active: SettingsTab; label: string; icon: React.ReactNode;
  onClick: (t: SettingsTab) => void;
}> = ({ id, active, label, icon, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono text-left transition-colors ${
      active === id
        ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 font-semibold'
        : 'text-t2 hover:bg-card hover:text-t1'
    }`}
  >
    {icon}
    {label}
  </button>
);

const Field: React.FC<{
  label: string; name: string; value: string | number; type?: string;
  step?: number; min?: number; max?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, type = 'text', step, min, max, onChange }) => (
  <div>
    <label className="block text-[10px] font-mono text-t3 uppercase tracking-wider mb-1">{label}</label>
    <input
      type={type} name={name} value={value} step={step} min={min} max={max}
      onChange={onChange}
      className="w-full bg-input border border-theme rounded px-3 py-2 text-sm text-t1 font-mono
                 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
    />
  </div>
);

const RangeField: React.FC<{
  label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-mono text-t3 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono text-cyan-500 font-semibold">{value.toFixed(3)} {unit}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 accent-cyan-500"
    />
  </div>
);

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { projectConfig, updateProjectConfig, simParams, updateSimParams, status, toggleDataSource } = useSensor();
  const [tab, setTab] = useState<SettingsTab>('appearance');
  const [saved, setSaved] = useState(false);
  const [localConfig, setLocalConfig] = useState({ ...projectConfig });

  if (!isOpen) return null;

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numFields = ['frequencyMin', 'frequencyMax', 'samplingRate'];
    setLocalConfig(prev => ({
      ...prev,
      [name]: numFields.includes(name) ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = () => {
    updateProjectConfig(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-panel border-l border-theme shadow-2xl flex flex-col transition-colors duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cyan-500" />
            <div>
              <h2 className="text-sm font-mono font-bold text-t1 tracking-wide">Settings</h2>
              <p className="text-[10px] font-mono text-t3">INFRASENSE Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-t3 hover:text-t1 hover:bg-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body — sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Tab sidebar */}
          <div className="w-36 shrink-0 border-r border-theme p-2 space-y-1 bg-deep overflow-y-auto">
            <TabButton id="appearance" active={tab} label="Appearance" icon={<Monitor className="w-3.5 h-3.5" />} onClick={setTab} />
            <TabButton id="simulation" active={tab} label="Simulation" icon={<Activity className="w-3.5 h-3.5" />} onClick={setTab} />
            <TabButton id="instrument" active={tab} label="Instrument" icon={<Cpu className="w-3.5 h-3.5" />} onClick={setTab} />
            <TabButton id="project"    active={tab} label="Project"    icon={<Users className="w-3.5 h-3.5" />} onClick={setTab} />
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* ── APPEARANCE ── */}
            {tab === 'appearance' && (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider mb-3">
                    Display Theme
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['dark', 'light'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                          theme === t
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-theme bg-card hover:border-theme-sub'
                        }`}
                      >
                        {t === 'dark'
                          ? <Moon className={`w-7 h-7 ${theme === t ? 'text-cyan-600 dark:text-cyan-400' : 'text-t3'}`} />
                          : <Sun className={`w-7 h-7 ${theme === t ? 'text-amber-400' : 'text-t3'}`} />
                        }
                        <span className={`text-xs font-mono font-semibold capitalize ${theme === t ? 'text-t1' : 'text-t3'}`}>
                          {t} Mode
                        </span>
                        {theme === t && (
                          <span className="text-[10px] font-mono text-cyan-500 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider mb-3">
                    Data Source
                  </div>
                  <div className="p-4 rounded-xl border border-theme bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono text-t2 font-semibold">Current Mode</div>
                        <div className={`text-sm font-mono font-bold uppercase mt-0.5 ${
                          status.source === 'simulation' ? 'text-cyan-500' : 'text-emerald-500'
                        }`}>
                          {status.source === 'simulation' ? '● Simulation Engine' : '● Live Hardware'}
                        </div>
                      </div>
                      <button
                        onClick={toggleDataSource}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-mono hover:bg-cyan-500/20 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Switch
                      </button>
                    </div>
                    <p className="text-[11px] text-t3 font-mono leading-relaxed">
                      {status.source === 'simulation'
                        ? 'Currently using the physics-based simulation engine. Connect STM32 hardware via WebSocket to switch to live data.'
                        : 'Live hardware mode active. Ensure STM32 is connected via USB-VCP or MQTT gateway.'}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider mb-3">
                    About This App
                  </div>
                  <div className="p-4 rounded-xl border border-theme bg-card space-y-2 text-xs font-mono text-t3">
                    <div className="flex justify-between"><span>Project</span><span className="text-t1 font-semibold">INFRASENSE</span></div>
                    <div className="flex justify-between"><span>Problem Statement</span><span className="text-cyan-500 font-semibold">SIH26144</span></div>
                    <div className="flex justify-between"><span>Organization</span><span className="text-t2">NTRO</span></div>
                    <div className="flex justify-between"><span>Stack</span><span className="text-t2">React + TypeScript + Vite</span></div>
                    <div className="flex justify-between"><span>Version</span><span className="text-t2">1.0.0</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SIMULATION ── */}
            {tab === 'simulation' && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider">
                  Simulation Engine Parameters
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-[11px] font-mono text-cyan-500">
                  <Info className="w-3.5 h-3.5 inline mr-1" />
                  All values are for the physics-based simulation only. Not physical measurements.
                </div>
                <RangeField label="Signal Amplitude" value={simParams.signalAmplitude} min={0.01} max={0.5} step={0.01} unit="Pa" onChange={v => updateSimParams({ signalAmplitude: v })} />
                <RangeField label="Primary Frequency" value={simParams.primaryFrequency} min={0.01} max={5} step={0.01} unit="Hz" onChange={v => updateSimParams({ primaryFrequency: v })} />
                <RangeField label="Noise Level" value={simParams.noiseLevel} min={0.001} max={0.1} step={0.001} unit="Pa RMS" onChange={v => updateSimParams({ noiseLevel: v })} />
                <RangeField label="Wind Turbulence" value={simParams.windTurbulence} min={0} max={1} step={0.05} unit="(0–1)" onChange={v => updateSimParams({ windTurbulence: v })} />
                <RangeField label="Temp Drift Rate" value={simParams.temperatureDrift} min={-1} max={1} step={0.05} unit="°C/hr" onChange={v => updateSimParams({ temperatureDrift: v })} />
                <div className="space-y-2.5 pt-2">
                  {[
                    { key: 'windFilterEnabled', label: 'Wind Noise Filter Active' },
                    { key: 'enableMultiTone', label: 'Multi-Tone Infrasound Synthesis' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => updateSimParams({ [key]: !simParams[key as keyof typeof simParams] })}
                        className={`w-9 h-5 rounded-full border-2 relative transition-colors ${
                          simParams[key as keyof typeof simParams]
                            ? 'bg-cyan-500 border-cyan-500'
                            : 'bg-card border-theme'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                          simParams[key as keyof typeof simParams] ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="text-xs font-mono text-t2 group-hover:text-t1 transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── INSTRUMENT ── */}
            {tab === 'instrument' && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider">
                  Instrument Configuration
                </div>
                <Field label="Sensor Resolution (Target)" name="sensorResolution" value={localConfig.sensorResolution} onChange={handleConfigChange} />
                <Field label="Sensor Range" name="sensorRange" value={localConfig.sensorRange} onChange={handleConfigChange} />
                <Field label="Bandwidth Min (Hz)" name="frequencyMin" value={localConfig.frequencyMin} type="number" step={0.001} min={0.001} max={1} onChange={handleConfigChange} />
                <Field label="Bandwidth Max (Hz)" name="frequencyMax" value={localConfig.frequencyMax} type="number" step={1} min={1} max={100} onChange={handleConfigChange} />
                <Field label="Sampling Rate (Hz)" name="samplingRate" value={localConfig.samplingRate} type="number" step={1} min={1} max={100} onChange={handleConfigChange} />
                <Field label="Target Prototype Cost" name="targetPrototypeCostDisplay" value={localConfig.targetPrototypeCostDisplay} onChange={handleConfigChange} />
                <button
                  onClick={handleSave}
                  className={`w-full py-2 rounded font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    saved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-500'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  }`}
                >
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Apply Configuration'}
                </button>
              </div>
            )}

            {/* ── PROJECT ── */}
            {tab === 'project' && (
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider">
                  Project Metadata
                </div>
                <Field label="Project Name" name="projectName" value={localConfig.projectName} onChange={handleConfigChange} />
                <Field label="Subtitle" name="subtitle" value={localConfig.subtitle} onChange={handleConfigChange} />
                <Field label="Problem Statement ID" name="problemStatementId" value={localConfig.problemStatementId} onChange={handleConfigChange} />
                <Field label="Organization / Ministry" name="organization" value={localConfig.organization} onChange={handleConfigChange} />
                <button
                  onClick={handleSave}
                  className={`w-full py-2 rounded font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    saved
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-500'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-white'
                  }`}
                >
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Apply Changes'}
                </button>

                <div>
                  <div className="text-xs font-mono font-bold text-t1 uppercase tracking-wider mt-4 mb-3">Instrument Specifications</div>
                  <div className="space-y-2 text-xs font-mono">
                    {[
                      ['Frequency Band', `${localConfig.frequencyMin}–${localConfig.frequencyMax} Hz`],
                      ['Sampling Rate', `${localConfig.samplingRate} Hz (Fs)`],
                      ['Sensing Principle', 'MEMS Differential Pressure'],
                      ['ADC', '24-bit Delta-Sigma'],
                      ['MCU', 'STM32 ARM Cortex-M4 + FPU'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between p-2 bg-card rounded border border-theme">
                        <span className="text-t3">{k}</span>
                        <span className="text-t1 font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-theme bg-deep shrink-0">
          <p className="text-[10px] font-mono text-t3 text-center">
            INFRASENSE · SIH26144 · Student Research Prototype · Not an official NTRO product
          </p>
        </div>
      </div>
    </>
  );
};
