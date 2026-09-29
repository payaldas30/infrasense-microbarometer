import React from 'react';
import { useSensor } from '../../context/SensorContext';
import { Badge, BadgeType } from '../common/Badge';
import { CheckCircle2, Clock, Circle, Play, AlertCircle, Wrench } from 'lucide-react';

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
    <section id="calibration" className="space-y-6 font-mono">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-theme">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold text-t1 tracking-wider uppercase">
            CALIBRATION &amp; PROTOTYPE VALIDATION
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="TARGET" size="sm" />
          <span className="text-[11px] text-t3">
            Acoustic Pistonphone Rig
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Calibration Parameters & Run Routine */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-theme">
            <div>
              <span className="text-xs font-bold text-t1 uppercase tracking-wider block">
                CALIBRATION PARAMETERS
              </span>
              <span className="text-[10px] text-t3">
                Traceable physical transducer calibration bench
              </span>
            </div>

            {/* Run Calibration Button */}
            <button
              onClick={runCalibration}
              disabled={isCalibrating}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                isCalibrating
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-700 dark:text-amber-300 animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 border border-cyan-500 text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isCalibrating ? `CALIBRATING (${calibrationProgress}%)` : 'RUN CALIBRATION'}</span>
            </button>
          </div>

          {/* Calibration Progress Bar */}
          {isCalibrating && (
            <div className="space-y-1 p-2.5 bg-card rounded-lg border border-amber-500/40">
              <div className="flex justify-between text-[10px] text-amber-600 dark:text-amber-300 font-semibold">
                <span>Executing zero-offset trim &amp; transfer slope verification...</span>
                <span>{calibrationProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-deep rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
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
                className="p-2.5 rounded-xl bg-card border border-theme flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="text-t1 font-semibold">{item.parameter}</div>
                  <div className="text-[10px] text-t3">{item.notes}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-cyan-600 dark:text-cyan-300 font-bold mb-1">
                    {item.value} {item.unit}
                  </div>
                  <Badge type={getStatusBadge(item.status)} size="sm" />
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-card rounded-lg border border-theme text-[10px] text-t3 leading-relaxed flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
            <span>
              All calibration entries marked <strong className="text-amber-600 dark:text-amber-400">TARGET</strong> or <strong className="text-cyan-600 dark:text-cyan-400">SIMULATED</strong> represent bench modeling specifications. Permanent <strong className="text-emerald-600 dark:text-emerald-400">MEASURED</strong> status is locked only upon verification against reference pistonphone data.
            </span>
          </div>
        </div>

        {/* Right Column: Prototype Validation Checklist */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-theme">
            <div>
              <span className="text-xs font-bold text-t1 uppercase tracking-wider block">
                PROTOTYPE VALIDATION CHECKLIST
              </span>
              <span className="text-[10px] text-t3">
                Click any milestone to cycle test status: Complete (✓), In Progress (◐), Pending (○)
              </span>
            </div>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30 font-bold">
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
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15' 
                      : isInProg
                      ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/15'
                      : 'bg-card border-theme hover:bg-deep'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : isInProg ? (
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-t3 shrink-0" />
                    )}
                    <div>
                      <div className={`text-xs font-semibold ${isDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-t1'}`}>
                        {val.title}
                      </div>
                      <div className="text-[10px] text-t3 font-sans">
                        {val.note}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    isDone 
                      ? 'text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10' 
                      : isInProg
                      ? 'text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10'
                      : 'text-t3 border-theme bg-deep'
                  }`}>
                    {val.status.replace('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-t3 pt-1">
            <span>Engineering validation protocol aligned with SIH26144 testing requirements.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
