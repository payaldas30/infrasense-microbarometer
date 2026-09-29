import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { X, ExternalLink, Cpu } from 'lucide-react';

export const ComponentModal: React.FC = () => {
  const { selectedComponent, setSelectedComponent } = useSensor();

  if (!selectedComponent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-panel border border-theme rounded-2xl max-w-xl w-full p-5 text-t1 font-mono shadow-2xl my-8 transition-colors duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-theme">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-t1 leading-tight">
                {selectedComponent.name}
              </h3>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-semibold">
                Category: {selectedComponent.category} Subsystem
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedComponent(null)}
            className="p-1.5 text-t3 hover:text-t1 rounded-lg hover:bg-deep transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4 space-y-3 text-xs">
          
          <div className="p-3 bg-card rounded-xl border border-theme space-y-1.5">
            <span className="text-[10px] text-t3 uppercase tracking-wider block font-bold">
              SENSING PRINCIPLE &amp; OPERATION
            </span>
            <p className="text-t2 font-sans leading-relaxed">
              {selectedComponent.sensingPrinciple}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Range / Threshold</span>
              <span className="text-cyan-600 dark:text-cyan-300 font-bold">{selectedComponent.pressureRange}</span>
            </div>
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Interface Protocol</span>
              <span className="text-t1 font-bold">{selectedComponent.interfaceType}</span>
            </div>
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Equivalent Resolution</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedComponent.resolution}</span>
            </div>
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Response Latency</span>
              <span className="text-t1 font-bold">{selectedComponent.responseTime}</span>
            </div>
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Supply Voltage</span>
              <span className="text-amber-600 dark:text-amber-300 font-bold">{selectedComponent.supplyVoltage}</span>
            </div>
            <div className="p-2.5 bg-card rounded-xl border border-theme">
              <span className="text-t3 block text-[10px]">Thermal Behavior</span>
              <span className="text-t1 font-bold">{selectedComponent.temperatureCharacteristics}</span>
            </div>
          </div>

          <div className="p-3 bg-card rounded-xl border border-theme space-y-1">
            <span className="text-[10px] text-t3 uppercase tracking-wider block font-bold">
              SELECTED / CANDIDATE COMPONENT
            </span>
            <div className="text-cyan-600 dark:text-cyan-300 font-bold">
              {selectedComponent.selectedComponent}
            </div>
            <p className="text-[11px] text-t3 font-sans mt-1">
              {selectedComponent.notes}
            </p>
          </div>

          {selectedComponent.datasheetUrl && selectedComponent.datasheetUrl !== '#' && (
            <a
              href={selectedComponent.datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline pt-1 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Component Datasheet Reference</span>
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-theme flex justify-end">
          <button
            onClick={() => setSelectedComponent(null)}
            className="px-4 py-2 rounded-lg bg-deep hover:bg-card border border-theme text-xs font-bold text-t1 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
