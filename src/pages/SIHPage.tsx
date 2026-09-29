import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { initialSihSlides } from '../config/projectConfig';
import { Award, ChevronDown, ChevronUp, Download } from 'lucide-react';

const SlideCard: React.FC<{
  slide: typeof initialSihSlides[0];
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ slide, isExpanded, onToggle }) => (
  <div
    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      isExpanded
        ? 'border-cyan-500/50 bg-panel shadow-lg shadow-cyan-900/20'
        : 'border-theme bg-card hover:border-slate-600'
    }`}
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 text-left gap-4"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center font-mono font-bold text-base shrink-0 ${
          isExpanded ? 'border-cyan-400 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10/60' : 'border-theme-sub text-t3 bg-card/60'
        }`}>
          {slide.number}
        </div>
        <div>
          <div className="text-sm font-bold text-t1 font-mono">{slide.title}</div>
          <div className="text-xs font-mono text-t3 mt-0.5">{slide.subtitle}</div>
        </div>
      </div>
      <div className="shrink-0 text-t3">
        {isExpanded ? <ChevronUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
      </div>
    </button>

    {isExpanded && (
      <div className="px-5 pb-6 space-y-5 border-t border-theme">
        {/* Summary */}
        <div className="pt-4">
          <p className="text-sm font-sans text-t2 leading-relaxed">{slide.summary}</p>
        </div>

        {/* Key Points */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Key Points</div>
          {slide.keyPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs font-sans text-t2 leading-relaxed">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5" />
              {point}
            </div>
          ))}
        </div>

        {/* Metrics */}
        {slide.metrics && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-t3 mb-2">Quick Reference</div>
            <div className="flex flex-wrap gap-2">
              {slide.metrics.map((m, i) => (
                <div key={i} className="px-3 py-1.5 rounded bg-deep border border-theme text-xs font-mono">
                  <span className="text-t3">{m.label}: </span>
                  <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export const SIHPage: React.FC = () => {
  const [expandedSlide, setExpandedSlide] = useState<string>('01');

  const toggleSlide = (num: string) => {
    setExpandedSlide(prev => prev === num ? '' : num);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-xl bg-card border border-theme">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Smart India Hackathon 2024</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">SIH26144 — Problem Statement</h1>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'Problem Statement ID', value: 'SIH26144' },
                { label: 'Organization / Ministry', value: 'NTRO (National Technical Research Organisation)' },
                { label: 'Category', value: 'Hardware' },
                { label: 'Theme', value: 'Smart Automation / Defense & Environmental Intelligence' },
              ].map(item => (
                <div key={item.label} className="text-xs font-mono">
                  <span className="text-t3 block">{item.label}</span>
                  <span className="text-t1 font-semibold mt-0.5 block">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            <button
              disabled
              className="px-4 py-2.5 rounded bg-card border border-theme-sub text-xs font-mono text-t3/80 flex items-center gap-2 cursor-not-allowed"
              title="Presentation not yet uploaded"
            >
              <Download className="w-4 h-4" />
              Download Presentation
              <span className="text-[10px] text-slate-600">(Awaiting upload)</span>
            </button>
            <div className="text-[10px] font-mono text-t3/80 text-center">
              Final PPT/PDF will be linked here
            </div>
          </div>
        </div>
      </div>

      {/* Problem Statement Box */}
      <div className="p-5 sm:p-6 rounded-xl bg-deep border border-cyan-900/50">
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider mb-3">NTRO Problem Statement (SIH26144)</div>
        <p className="text-sm font-sans text-t2 leading-relaxed">
          Design and develop a <strong className="text-cyan-600 dark:text-cyan-300">low-cost MEMS-based differential-pressure microbarometer</strong> capable of detecting and characterizing atmospheric infrasonic pressure fluctuations in the frequency range of <strong className="text-cyan-600 dark:text-cyan-300">0.01 Hz to 20 Hz</strong>. The solution must include a complete measurement chain — wind noise reduction, pneumatic signal conditioning, precision acquisition, and digital signal processing — within a target prototype cost of <strong className="text-amber-300">₹8,000 to ₹15,000</strong>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded bg-cyan-500/10/60 border border-cyan-800/40 text-cyan-300">Band: 0.01–20 Hz</span>
          <span className="px-2.5 py-1 rounded bg-card border border-theme-sub text-t2">Category: Hardware</span>
          <span className="px-2.5 py-1 rounded bg-amber-500/10/50 border border-amber-800/40 text-amber-300">Target Cost: ₹8k–₹15k</span>
          <span className="px-2.5 py-1 rounded bg-violet-500/10/50 border border-violet-800/40 text-violet-700 dark:text-violet-300">Domain: Instrumentation + Defense</span>
        </div>
      </div>

      {/* Six Slide Deck Summary */}
      <div>
        <div className="text-xs font-mono text-t3 uppercase tracking-wider mb-3">Presentation Structure — Six Slides</div>
        <div className="space-y-3">
          {initialSihSlides.map(slide => (
            <SlideCard
              key={slide.number}
              slide={slide}
              isExpanded={expandedSlide === slide.number}
              onToggle={() => toggleSlide(slide.number)}
            />
          ))}
        </div>
      </div>

      {/* Sections: Problem / Solution / etc. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          {
            title: 'Problem',
            color: 'border-rose-700/40',
            content: 'Infrasonic signals (0.01–20 Hz) carry critical intelligence about high-energy geophysical and anthropogenic events. Standard commercial microbarometers capable of resolving these frequencies cost ₹5–₹25 lakhs per unit, making distributed network deployment economically unfeasible. No indigenous, low-cost, deployable solution currently exists.',
          },
          {
            title: 'Proposed Solution',
            color: 'border-cyan-700/40',
            content: 'INFRASENSE: A four-stage instrumentation chain — spatial wind-noise suppression → pneumatic equalization chamber → MEMS differential pressure sensing → STM32 embedded DSP — targeting sub-0.02 Pa RMS noise floor in the 0.01–20 Hz band at ₹8,000–₹15,000 prototype cost.',
          },
          {
            title: 'Technical Approach',
            color: 'border-teal-700/40',
            content: 'Differential pressure topology rejects 100 kPa absolute ambient background. Acoustic RC high-pass filter (fc ≈ 0.005 Hz) prevents diurnal weather saturation. 4-arm porous hose array provides ~18 dB wind rejection. 24-bit ADC + zero-phase Butterworth filtering on STM32 Cortex-M4 with FPU for real-time Welch PSD estimation.',
          },
          {
            title: 'Feasibility',
            color: 'border-indigo-700/40',
            content: 'All components are commercially available COTS parts. Sensirion SDP8xx / TE MS4525 differential sensors are available under ₹800. STM32F401 BlackPill boards are available under ₹350. Total prototype BOM targets ₹8,000–₹15,000 with all acoustic and mechanical hardware included.',
          },
          {
            title: 'Impact & Benefits',
            color: 'border-emerald-700/40',
            content: 'Enables indigenous distributed microbarometer arrays for defense (NLOS blast detection, supersonic overflights), environmental intelligence (volcanic tremor, severe weather, avalanche), and geodynamic monitoring. Each INFRASENSE node costs < 5% of any commercial equivalent.',
          },
          {
            title: 'Research & References',
            color: 'border-amber-700/40',
            content: 'Grounded in peer-reviewed infrasound literature (IMS, CTBTO frameworks), MEMS transducer characterization papers, porous hose wind suppression physics (Hedlin et al. 2003), and DSP spectral estimation methodology (Welch PSD, multi-taper). See Research page for full bibliography.',
          },
        ].map(section => (
          <div key={section.title} className={`p-5 rounded-xl border ${section.color} bg-card`}>
            <h3 className="text-sm font-bold font-mono text-t1 mb-2">{section.title}</h3>
            <p className="text-xs font-sans text-t2 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
