import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useSensor } from '../../context/SensorContext';
import {
  X,
  Sun,
  Moon,
  Sliders,
  Cpu,
  Monitor,
  Check,
  RefreshCw,
  Wrench,
  Radio,
  Wifi,
  Database,
  Info,
  RotateCcw
} from 'lucide-react';

interface InstrumentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'hardware' | 'transducer' | 'simulation' | 'project';

export const InstrumentSettingsModal: React.FC<InstrumentSettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { 
    status, 
    setSource, 
    simParams, 
    updateSimParams, 
    dominantFrequency 
  } = useSensor();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [savedAlert, setSavedAlert] = useState(false);

  // Local editable settings
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/infrasound');
  const [baudRate, setBaudRate] = useState('115200');
  const [sampleRate, setSampleRate] = useState(status.samplingRate);
  const [selectedSensorModel, setSelectedSensorModel] = useState('Sensirion SDP810-500Pa');
  const [diffRange, setDiffRange] = useState('±500 Pa');
  const [refVolume, setRefVolume] = useState('0.8 L');
  const [capillaryCutoff, setCapillaryCutoff] = useState('0.005 Hz');

  // Project Info
  const [projName, setProjName] = useState('INFRASENSE');
  const [psId, setPsId] = useState('SIH26144');
  const [org, setOrg] = useState('NTRO (National Technical Research Organisation)');

  if (!isOpen) return null;

  const handleSaveAll = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleResetSim = () => {
    updateSimParams({
      signalAmplitude: 3.82,
      primaryFrequency: 0.043,
      noiseLevel: 0.74,
      windDisturbance: 0.35,
      temperatureDrift: 0.25,
      enableMultiTone: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-panel border border-theme text-t1 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-mono flex flex-col max-h-[90vh] transition-colors duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme bg-card/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-t1 tracking-wider uppercase">
                Instrument &amp; System Configuration
              </h2>
              <p className="text-[10px] text-t3">
                INFRASENSE Prototype Hardware &amp; Display Settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-t3 hover:text-t1 hover:bg-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-theme bg-deep/50 px-3 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'appearance', label: 'Display & Theme', icon: Monitor },
            { id: 'hardware', label: 'Hardware Link', icon: Wifi },
            { id: 'transducer', label: 'Transducer', icon: Cpu },
            { id: 'simulation', label: 'Physics Engine', icon: Radio },
            { id: 'project', label: 'Project Info', icon: Wrench },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as SettingsTab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-panel shadow-sm'
                    : 'border-transparent text-t3 hover:text-t1 hover:bg-card/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-t2 uppercase tracking-wider block mb-2">
                  Select User Interface Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Dark Mode Card */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                      theme === 'dark'
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md'
                        : 'border-theme bg-card hover:border-theme-sub'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0e1726] border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <Moon className="w-4 h-4" />
                      </div>
                      {theme === 'dark' && (
                        <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-t1">Dark Theme</div>
                      <p className="text-[11px] text-t3 mt-0.5">
                        Deep navy oscilloscope aesthetic with cyan technical accents for low-light lab environments.
                      </p>
                    </div>
                  </button>

                  {/* Light Mode Card */}
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition-all ${
                      theme === 'light'
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md'
                        : 'border-theme bg-card hover:border-theme-sub'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-400 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Sun className="w-4 h-4" />
                      </div>
                      {theme === 'light' && (
                        <span className="text-[10px] text-cyan-600 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> ACTIVE
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-t1">Light Theme</div>
                      <p className="text-[11px] text-t3 mt-0.5">
                        Crisp clean scientific interface with high-contrast text and crisp border definitions.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Fast Visual Options */}
              <div className="p-3 bg-card rounded-xl border border-theme space-y-2 text-xs">
                <span className="text-[10px] font-bold text-t3 uppercase tracking-wider block">
                  Oscilloscope Visual Enhancements
                </span>
                <div className="flex items-center justify-between py-1 border-b border-theme-sub">
                  <span className="text-t2">CRT Scanline Grating</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-theme-sub">
                  <span className="text-t2">Precision Coordinate Grid</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">32px x 32px Active</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-t2">Target Frequency Passband</span>
                  <span className="text-t1 font-bold">0.01 – 20.0 Hz</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HARDWARE & TELEMETRY */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <div className="p-3 bg-card rounded-xl border border-theme space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-t3 uppercase tracking-wider block">
                      Operating Telemetry Source
                    </span>
                    <span className={`text-sm font-bold ${
                      status.source === 'simulation' ? 'text-cyan-600 dark:text-cyan-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {status.source === 'simulation' ? '● SIMULATION BENCH' : '● PHYSICAL STM32 HARDWARE'}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSource('simulation')}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        status.source === 'simulation'
                          ? 'bg-cyan-600 text-white border-cyan-500'
                          : 'bg-panel text-t3 border-theme hover:text-t1'
                      }`}
                    >
                      Simulation
                    </button>
                    <button
                      onClick={() => setSource('hardware')}
                      className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors ${
                        status.source === 'hardware'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-panel text-t3 border-theme hover:text-t1'
                      }`}
                    >
                      Hardware
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-t3 leading-relaxed">
                  When switched to Hardware mode, the frontend listens for real-time differential pressure packets streamed from the STM32 via USB-VCP or local WebSocket server.
                </p>
              </div>

              {/* Hardware Connection Parameters */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                    WebSocket Telemetry URL
                  </label>
                  <input
                    type="text"
                    value={wsUrl}
                    onChange={(e) => setWsUrl(e.target.value)}
                    className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    placeholder="ws://localhost:8080/infrasound"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                      UART Baud Rate
                    </label>
                    <select
                      value={baudRate}
                      onChange={(e) => setBaudRate(e.target.value)}
                      className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="115200">115,200 baud</option>
                      <option value="230400">230,400 baud</option>
                      <option value="460800">460,800 baud</option>
                      <option value="921600">921,600 baud</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                      DMA Sampling Frequency
                    </label>
                    <select
                      value={sampleRate}
                      onChange={(e) => setSampleRate(Number(e.target.value))}
                      className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="10">10 Hz (Low Power)</option>
                      <option value="20">20 Hz (Standard)</option>
                      <option value="50">50 Hz (Default Infrasound)</option>
                      <option value="100">100 Hz (High Resolution)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRANSDUCER & PNEUMATICS */}
          {activeTab === 'transducer' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                  Selected MEMS Sensor Transducer
                </label>
                <select
                  value={selectedSensorModel}
                  onChange={(e) => setSelectedSensorModel(e.target.value)}
                  className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Sensirion SDP810-500Pa">Sensirion SDP810-500Pa (Differential Digital I2C)</option>
                  <option value="TE Connectivity MS4525DO">TE Connectivity MS4525DO (Pressure Diaphragm)</option>
                  <option value="NXP MP3V5004DP">NXP MP3V5004DP (Differential Piezoresistive)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                    Differential Pressure Range
                  </label>
                  <input
                    type="text"
                    value={diffRange}
                    onChange={(e) => setDiffRange(e.target.value)}
                    className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                    Acoustic Reference Chamber
                  </label>
                  <input
                    type="text"
                    value={refVolume}
                    onChange={(e) => setRefVolume(e.target.value)}
                    className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                  Pneumatic Cutoff Frequency (fc = 1 / 2πRC)
                </label>
                <input
                  type="text"
                  value={capillaryCutoff}
                  onChange={(e) => setCapillaryCutoff(e.target.value)}
                  className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-t3 mt-1 block">
                  Acoustic high-pass barrier rejects 101 kPa ambient weather tides while transmitting infrasound.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: SIMULATION PHYSICS ENGINE */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-theme">
                <span className="text-[11px] font-bold text-t2 uppercase">
                  Physics Waveform Generator Parameters
                </span>
                <button
                  onClick={handleResetSim}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Defaults
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div className="p-3 bg-card rounded-lg border border-theme space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-t2">Signal Peak Amplitude</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{simParams.signalAmplitude.toFixed(2)} Pa</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.25"
                    value={simParams.signalAmplitude}
                    onChange={(e) => updateSimParams({ signalAmplitude: parseFloat(e.target.value) })}
                    className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-card rounded-lg border border-theme space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-t2">Carrier Infrasonic Frequency</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{simParams.primaryFrequency.toFixed(3)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="2.0"
                    step="0.005"
                    value={simParams.primaryFrequency}
                    onChange={(e) => updateSimParams({ primaryFrequency: parseFloat(e.target.value) })}
                    className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-card rounded-lg border border-theme space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-t2">Sensor &amp; Electronic Noise Level</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{simParams.noiseLevel.toFixed(2)} Pa RMS</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.05"
                    value={simParams.noiseLevel}
                    onChange={(e) => updateSimParams({ noiseLevel: parseFloat(e.target.value) })}
                    className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-card rounded-lg border border-theme space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-t2">Wind Turbulence Strength</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">{(simParams.windDisturbance * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={simParams.windDisturbance}
                    onChange={(e) => updateSimParams({ windDisturbance: parseFloat(e.target.value) })}
                    className="w-full h-1.5 accent-cyan-500 bg-deep rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECT INFO */}
          {activeTab === 'project' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                  Project Prototype Name
                </label>
                <input
                  type="text"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                  Problem Statement ID
                </label>
                <input
                  type="text"
                  value={psId}
                  onChange={(e) => setPsId(e.target.value)}
                  className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-t2 uppercase block mb-1">
                  Organization / Ministry
                </label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-t1 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 bg-card rounded-lg border border-theme text-[11px] text-t3 leading-relaxed">
                Developed for Smart India Hackathon under NTRO. Interface operates strictly as scientific instrumentation monitoring portal.
              </div>
            </div>
          )}
        </div>

        {/* Footer with Apply / Save Action */}
        <div className="px-5 py-3 border-t border-theme bg-card/60 flex items-center justify-between">
          <div>
            {savedAlert && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-4 h-4" /> Parameters Applied Successfully!
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-deep hover:bg-card border border-theme text-t2 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-md shadow-cyan-950"
            >
              Apply Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
