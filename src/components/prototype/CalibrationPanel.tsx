import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { Badge, BadgeType } from '../common/Badge';
import { CheckCircle2, Clock, Circle, Play, AlertCircle, CheckSquare, Wrench } from 'lucide-react';

export const CalibrationPanel: React.FC = () => {
  const { 
    calibrationItems, 
    isCalibrating, 
    calibrationProgress, 
    runCalibration, 
    validationItems, 
    toggleValidationItem 
  } = useSensor();

  const getStatusBadge = (status: string): BadgeType => {
    if (status === 'MEASURED') return 'MEASURED';
    if (status === 'TARGET') return 'TARGET';
    if (status === 'SIMULATED') return 'SIMULATED';
    return 'NOT MEASURED';
  };

  return (
    <section id="calibration" className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-wider">
            CALIBRATION &amp; PROTOTYPE VALIDATION
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="TARGET" size="sm" />
          <span className="text-[11px] font-mono text-slate-400">
            Acoustic Pistonphone Rig
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        
        {/* Left Column: Calibration Parameters & Run Routine */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                CALIBRATION PARAMETERS
              </span>
              <span className="text-[10px] text-slate-400">
                Traceable physical transducer calibration bench
              </span>
            </div>

            {/* Run Calibration Button */}
            <button
              onClick={runCalibration}
              disabled={isCalibrating}
              className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                isCalibrating
                  ? 'bg-amber-950 border border-amber-600 text-amber-300 animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 border border-cyan-400 text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isCalibrating ? `CALIBRATING (${calibrationProgress}%)` : 'RUN CALIBRATION'}</span>
            </button>
          </div>

          {/* Calibration Progress Bar */}
          {isCalibrating && (
            <div className="space-y-1 p-2.5 bg-[#060a14] rounded border border-amber-700/50">
              <div className="flex justify-between text-[10px] text-amber-300">
                <span>Executing zero-offset trim &amp; transfer slope verification...</span>
                <span>{calibrationProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${calibrationProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Calibration Items Table */}
          <div className="space-y-2">
            {calibrationItems.map((item) => (
              <div 
                key={item.id}
                className="p-2.5 rounded-lg bg-[#060a14] border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="text-white font-semibold">{item.parameter}</div>
                  <div className="text-[10px] text-slate-500">{item.notes}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-cyan-300 font-bold mb-1">
                    {item.value} {item.unit}
                  </div>
                  <Badge type={getStatusBadge(item.status)} size="sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-[#060a14] rounded border border-slate-800/80 text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              All calibration entries marked <strong className="text-amber-300">TARGET</strong> or <strong className="text-cyan-300">SIMULATED</strong> represent bench modeling specifications. Permanent <strong className="text-emerald-300">MEASURED</strong> status is locked only upon verification against reference pistonphone data.
            </span>
          </div>
        </div>

        {/* Right Column: Prototype Validation Checklist */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-xl bg-[#091020] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                PROTOTYPE VALIDATION CHECKLIST
              </span>
              <span className="text-[10px] text-slate-400">
                Click any milestone to cycle test status: Complete (✓), In Progress (◐), Pending (○)
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              Interactive
            </span>
          </div>

          {/* Validation Checklist Items */}
          <div className="space-y-2">
            {validationItems.map((val) => {
              const isDone = val.status === 'complete';
              const isInProg = val.status === 'in_progress';

              return (
                <button
                  key={val.id}
                  onClick={() => toggleValidationItem(val.id)}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between gap-3 transition-colors ${
                    isDone 
                      ? 'bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/40' 
                      : isInProg
                      ? 'bg-amber-950/20 border-amber-800/40 hover:bg-amber-950/40'
                      : 'bg-[#060a14] border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isInProg ? (
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <div>
                      <div className={`text-xs font-semibold ${isDone ? 'text-emerald-200' : 'text-white'}`}>
                        {val.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        {val.note}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border shrink-0 ${
                    isDone 
                      ? 'text-emerald-400 border-emerald-700/50 bg-emerald-950/50' 
                      : isInProg
                      ? 'text-amber-400 border-amber-700/50 bg-amber-950/50'
                      : 'text-slate-500 border-slate-700 bg-slate-900'
                  }`}>
                    {val.status.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
            <span>Engineering validation protocol aligned with SIH26144 testing requirements.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
