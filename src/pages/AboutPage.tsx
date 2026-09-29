import React from 'react';
import { Badge } from '../components/common/Badge';
import { initialTeamMembers } from '../config/projectConfig';
import { User, Target, CheckCircle2 } from 'lucide-react';

const roleColors: Record<string, string> = {
  'Hardware & Sensor Instrumentation': 'border-cyan-700/40 text-cyan-600 dark:text-cyan-400',
  'Embedded Systems & Firmware': 'border-blue-700/40 text-blue-700 dark:text-blue-400',
  'Digital Signal Processing (DSP)': 'border-indigo-700/40 text-indigo-600 dark:text-indigo-400',
  'Mechanical & Pneumatic Design': 'border-teal-700/40 text-teal-600 dark:text-teal-400',
  'Software & Web Platform': 'border-violet-700/40 text-violet-700 dark:text-violet-400',
  'Validation & Experimental Testing': 'border-amber-700/40 text-amber-400',
};

const projectGoals = [
  { id: 1, goal: 'Develop a functional, reproducible MEMS microbarometer prototype', done: false },
  { id: 2, goal: 'Achieve flat amplitude response across the 0.01–20 Hz infrasonic band', done: false },
  { id: 3, goal: 'Quantify instrument noise floor (PSD below 0.02 Pa RMS)', done: false },
  { id: 4, goal: 'Characterize absolute pressure sensitivity (mV/Pa, linearity, zero offset)', done: false },
  { id: 5, goal: 'Study, model, and compensate temperature-induced signal drift', done: false },
  { id: 6, goal: 'Validate wind-induced noise reduction via porous hose spatial array', done: false },
  { id: 7, goal: 'Establish a traceable, repeatable low-frequency calibration methodology', done: false },
  { id: 8, goal: 'Demonstrate real-time STM32 embedded DSP: filtering, FFT, PSD estimation', done: false },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">Student Research Prototype</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">About the Project</h1>
      </div>

      {/* Project Description */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme space-y-4">
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">INFRASENSE — Project Overview</div>
        <p className="text-sm font-sans text-t2 leading-relaxed">
          <strong className="text-t1 font-semibold">INFRASENSE</strong> is a student-developed engineering prototype focused on low-frequency atmospheric pressure measurement and infrasonic signal characterization using a MEMS differential pressure sensing architecture.
        </p>
        <p className="text-sm font-sans text-t2 leading-relaxed">
          The project was developed in response to Problem Statement <strong className="font-mono text-cyan-300">SIH26144</strong> issued by <strong className="font-mono text-cyan-300">NTRO (National Technical Research Organisation)</strong> under the Smart India Hackathon. The core engineering challenge is isolating infrasonic atmospheric pressure fluctuations (0.01–20 Hz, amplitude: 0.01–2.0 Pa) from a measurement background dominated by ambient atmospheric pressure (~101 kPa) and wind turbulence (5–50 Pa dynamic pressure), using a complete hardware-software signal-processing chain.
        </p>
        <p className="text-sm font-sans text-t2 leading-relaxed">
          INFRASENSE is <strong className="text-t1">not</strong> an official NTRO product. It is the working prototype name for this SIH submission project. All experimental results presented in this portal are clearly labeled as SIMULATED, TARGET, or MEASURED to maintain engineering transparency.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { label: 'Prototype Name: INFRASENSE', color: 'text-cyan-300 border-cyan-800/50 bg-cyan-500/10/40' },
            { label: 'Not an official NTRO product', color: 'text-amber-300 border-amber-800/40 bg-amber-500/10/30' },
            { label: 'Student Research Prototype', color: 'text-t2 border-theme-sub bg-card/50' },
          ].map(b => (
            <span key={b.label} className={`px-2.5 py-1 rounded border text-xs font-mono ${b.color}`}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Project Goals */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-bold text-t1 font-mono">Project Goals & Validation Targets</h2>
        </div>
        <div className="space-y-2.5">
          {projectGoals.map((g) => (
            <div key={g.id} className={`flex items-start gap-3 p-3 rounded-lg border ${g.done ? 'border-emerald-800/40 bg-emerald-500/10/15' : 'border-theme bg-deep'}`}>
              {g.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                : <div className="w-4 h-4 rounded border border-slate-600 mt-0.5 shrink-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-600" /></div>
              }
              <span className={`text-xs font-sans leading-relaxed ${g.done ? 'text-emerald-200' : 'text-t2'}`}>
                {g.goal}
              </span>
              <div className="ml-auto shrink-0">
                <Badge type={g.done ? 'MEASURED' : 'TARGET'} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Frequency Band', value: '0.01–20 Hz', sub: 'Infrasonic measurement range' },
          { label: 'Sensor Topology', value: 'Differential MEMS', sub: 'vs. 100 kPa absolute sensors' },
          { label: 'Target Noise Floor', value: '< 0.02 Pa RMS', sub: 'Band-integrated target' },
          { label: 'Prototype Target', value: '₹8k–₹15k', sub: 'Vs. ₹5L–₹25L commercial' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-card border border-theme">
            <div className="text-[10px] font-mono text-t3 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-base font-bold font-mono text-t1">{s.value}</div>
            <div className="text-[11px] font-mono text-t3/80 mt-1">{s.sub}</div>
            <Badge type="TARGET" size="sm" className="mt-2" />
          </div>
        ))}
      </div>

      {/* Team Section */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-bold text-t1 font-mono">Project Team</h2>
        </div>
        <p className="text-xs text-t3 font-mono mb-5">
          Team member details will be updated when confirmed for publication. Placeholder names shown for structural purposes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialTeamMembers.map(member => {
            const roleStyle = roleColors[member.role] || 'border-theme-sub text-t2';
            return (
              <div key={member.id} className="p-5 rounded-xl bg-deep border border-theme hover:border-theme-sub transition-colors space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-panel border border-theme-sub flex items-center justify-center text-t3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-t1 font-mono">{member.name}</div>
                    <div className="text-[10px] font-mono text-t3/80">{member.department}</div>
                  </div>
                </div>
                <div className={`text-[11px] font-mono px-2.5 py-1 rounded border inline-block ${roleStyle}`}>
                  {member.role}
                </div>
                <p className="text-xs font-sans text-t3 leading-relaxed">{member.responsibility}</p>
                <div className="text-[10px] font-mono text-slate-600">{member.institution}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 p-3 bg-card border border-theme rounded text-[11px] font-mono text-t3">
          Team roles are distributed to cover the full stack: hardware sensing, embedded firmware, digital signal processing, pneumatic/mechanical engineering, software dashboard, and experimental validation.
        </div>
      </div>

      {/* Open-Source & Reproducibility Note */}
      <div className="p-5 rounded-xl bg-deep border border-theme space-y-2">
        <h3 className="text-sm font-bold font-mono text-t1">Reproducibility & Open Engineering</h3>
        <p className="text-xs font-sans text-t2 leading-relaxed">
          The INFRASENSE project is designed to be reproducible by other institutions. All design decisions are published with their engineering rationale (see Research page). Future plans include releasing schematic files, STM32 firmware source, and calibration procedures under an open license once the prototype is validated.
        </p>
        <p className="text-xs font-sans text-t3 leading-relaxed">
          The web dashboard is built in React + TypeScript and is architecturally ready for live STM32 hardware integration via WebSocket or MQTT. The simulation engine uses physics-grounded signal synthesis so that the UI behavior mirrors expected real-sensor performance during development.
        </p>
      </div>
    </div>
  );
};
