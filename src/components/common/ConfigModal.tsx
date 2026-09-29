import React, { useState } from 'react';
import { useSensor } from '../../context/SensorContext';
import { X, Settings, Check, RefreshCw } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose }) => {
  const { projectConfig, updateProjectConfig, status, toggleDataSource } = useSensor();

  const [formData, setFormData] = useState({
    projectName: projectConfig.projectName,
    subtitle: projectConfig.subtitle,
    problemStatementId: projectConfig.problemStatementId,
    organization: projectConfig.organization,
    frequencyMin: projectConfig.frequencyMin,
    frequencyMax: projectConfig.frequencyMax,
    targetPrototypeCostDisplay: projectConfig.targetPrototypeCostDisplay,
    samplingRate: projectConfig.samplingRate,
    sensorResolution: projectConfig.sensorResolution,
    sensorRange: projectConfig.sensorRange,
  });

  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'frequencyMin' || name === 'frequencyMax' || name === 'samplingRate') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectConfig(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-panel border border-theme-sub rounded-lg max-w-2xl w-full p-6 text-t2 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-mono font-semibold tracking-wide text-t1">System & Instrument Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-t3 hover:text-t1 rounded hover:bg-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div className="p-3 bg-cyan-500/10/30 border border-cyan-800/40 rounded flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400">HARDWARE TELEMETRY SOURCE</div>
              <div className="text-sm font-semibold text-t1">
                Current Mode: <span className="font-mono text-cyan-300 uppercase">{status.source === 'simulation' ? 'Simulation Engine' : 'Live Physical Hardware'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleDataSource}
              className="px-3 py-1.5 text-xs font-mono bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 rounded flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Toggle to {status.source === 'simulation' ? 'Hardware' : 'Simulation'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Project Name</label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Problem Statement ID</label>
              <input
                type="text"
                name="problemStatementId"
                value={formData.problemStatementId}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Organization / Ministry</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Target Prototype Cost</label>
              <input
                type="text"
                name="targetPrototypeCostDisplay"
                value={formData.targetPrototypeCostDisplay}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Sampling Rate (Hz)</label>
              <input
                type="number"
                name="samplingRate"
                value={formData.samplingRate}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Sensor Equivalent Resolution</label>
              <input
                type="text"
                name="sensorResolution"
                value={formData.sensorResolution}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Bandwidth Min (Hz)</label>
              <input
                type="number"
                step="0.001"
                name="frequencyMin"
                value={formData.frequencyMin}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-t3 mb-1">Bandwidth Max (Hz)</label>
              <input
                type="number"
                step="1"
                name="frequencyMax"
                value={formData.frequencyMax}
                onChange={handleChange}
                className="w-full bg-panel border border-theme-sub rounded px-3 py-2 text-sm text-t1 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-theme">
            {savedAlert && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Check className="w-4 h-4" /> Parameters saved successfully!
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded bg-card hover:bg-card text-t2 font-mono"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded bg-cyan-600 hover:bg-cyan-500 text-t1 font-mono font-medium shadow-lg shadow-cyan-950"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
