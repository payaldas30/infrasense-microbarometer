import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { X, ExternalLink, Cpu, Info } from 'lucide-react';

export const ComponentModal: React.FC = () => {
  const { selectedComponent, setSelectedComponent } = useSensor();

  if (!selectedComponent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b1220] border border-cyan-500/40 rounded-xl max-w-xl w-full p-5 text-slate-200 font-mono shadow-2xl my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {selectedComponent.name}
              </h3>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
                Category: {selectedComponent.category} Subsystem
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedComponent(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4 space-y-3 text-xs">
          
          <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              SENSING PRINCIPLE &amp; OPERATION
            </span>
            <p className="text-slate-200 font-sans leading-relaxed">
              {selectedComponent.sensingPrinciple}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Range / Threshold</span>
              <span className="text-cyan-300 font-bold">{selectedComponent.pressureRange}</span>
            </div>
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Interface Protocol</span>
              <span className="text-white font-bold">{selectedComponent.interfaceType}</span>
            </div>
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Equivalent Resolution</span>
              <span className="text-emerald-400 font-bold">{selectedComponent.resolution}</span>
            </div>
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Response Latency</span>
              <span className="text-white font-bold">{selectedComponent.responseTime}</span>
            </div>
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Supply Voltage</span>
              <span className="text-amber-300 font-bold">{selectedComponent.supplyVoltage}</span>
            </div>
            <div className="p-2.5 bg-[#060a14] rounded border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Thermal Behavior</span>
              <span className="text-white font-bold">{selectedComponent.temperatureCharacteristics}</span>
            </div>
          </div>

          <div className="p-3 bg-[#060a14] rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              SELECTED / CANDIDATE COMPONENT
            </span>
            <div className="text-cyan-300 font-bold">
              {selectedComponent.selectedComponent}
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-1">
              {selectedComponent.notes}
            </p>
          </div>

          {selectedComponent.datasheetUrl && selectedComponent.datasheetUrl !== '#' && (
            <a
              href={selectedComponent.datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 pt-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Component Datasheet Reference</span>
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setSelectedComponent(null)}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
