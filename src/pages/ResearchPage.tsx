import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { initialResearchReferences, initialDesignDecisions } from '../config/projectConfig';
import { ResearchReference } from '../types';
import { ExternalLink, BookOpen, Filter } from 'lucide-react';

const categories = ['All', 'Infrasound', 'MEMS Pressure Sensors', 'Pneumatic Filtering', 'Wind-Noise Reduction', 'Signal Processing', 'Calibration'] as const;
type Category = typeof categories[number];

const categoryColors: Record<string, string> = {
  'Infrasound': 'bg-cyan-500/10/50 border-cyan-700/40 text-cyan-300',
  'MEMS Pressure Sensors': 'bg-blue-500/10/50 border-blue-700/40 text-blue-700 dark:text-blue-300',
  'Pneumatic Filtering': 'bg-teal-500/10/50 border-teal-700/40 text-teal-700 dark:text-teal-300',
  'Wind-Noise Reduction': 'bg-green-500/10/50 border-green-700/40 text-green-700 dark:text-green-300',
  'Signal Processing': 'bg-indigo-500/10/50 border-indigo-700/40 text-indigo-700 dark:text-indigo-300',
  'Calibration': 'bg-amber-500/10/50 border-amber-700/40 text-amber-300',
};

const RefCard: React.FC<{ ref: ResearchReference }> = ({ ref: r }) => (
  <div className="p-4 sm:p-5 rounded-xl bg-card border border-theme hover:border-slate-600 transition-colors space-y-2">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${categoryColors[r.category] ?? 'bg-card border-theme-sub text-t2'}`}>
          {r.category}
        </span>
      </div>
      <span className="text-[10px] font-mono text-t3/80 shrink-0">{r.year}</span>
    </div>
    <h3 className="text-sm font-bold text-t1 leading-tight">{r.title}</h3>
    <p className="text-xs font-mono text-t3">{r.authors}</p>
    <p className="text-xs font-sans text-t2 leading-relaxed">{r.relevance}</p>
    {(r.doi || r.link) && (
      <a
        href={r.doi ? `https://doi.org/${r.doi}` : r.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        {r.doi ? `DOI: ${r.doi}` : 'View Reference'}
      </a>
    )}
  </div>
);

export const ResearchPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [activeTab, setActiveTab] = useState<'references' | 'design'>('references');

  const filtered = activeCategory === 'All'
    ? initialResearchReferences
    : initialResearchReferences.filter(r => r.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1">Literature & Engineering Rationale</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-t1 font-mono tracking-wide">Research & Technical Foundation</h1>
        <p className="text-xs text-t3 font-mono mt-1">
          Curated references and transparent engineering design rationale underlying every architectural decision in INFRASENSE.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-theme">
        <button
          onClick={() => setActiveTab('references')}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-mono rounded-t border-b-2 transition-all ${
            activeTab === 'references'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10/30'
              : 'border-transparent text-t3 hover:text-t1'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Research References
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-mono rounded-t border-b-2 transition-all ${
            activeTab === 'design'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10/30'
              : 'border-transparent text-t3 hover:text-t1'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Why This Design?
        </button>
      </div>

      {activeTab === 'references' && (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                  activeCategory === cat
                    ? 'bg-cyan-600/30 border-cyan-500/60 text-cyan-300'
                    : 'bg-panel border-theme text-t3 hover:text-t1 hover:border-slate-600'
                }`}
              >
                {cat} {cat === 'All' && `(${initialResearchReferences.length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(r => <RefCard key={r.id} ref={r} />)}
          </div>

          <div className="p-4 bg-card border border-theme rounded-lg text-xs font-mono text-t3">
            <div className="text-t2 font-semibold mb-1">Research Disclaimer</div>
            References listed above are curated from published scientific literature. DOI links open external sources. INFRASENSE is a student engineering prototype — not an academic publication. The engineering design is informed by these principles but may deviate from specific implementation details.
          </div>
        </>
      )}

      {activeTab === 'design' && (
        <div className="space-y-6">
          <div className="max-w-2xl">
            <p className="text-sm text-t2 font-sans leading-relaxed">
              Every architectural decision in INFRASENSE was driven by explicit physics reasoning. The table below makes this reasoning transparent and traceable — each decision is linked to the measurable infrasound detection benefit it provides.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-theme">
            <table className="w-full text-xs font-mono">
              <thead className="bg-deep border-b border-theme">
                <tr>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Design Decision</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-t3">Scientific / Engineering Reason</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-t3 hidden lg:table-cell">Alternative Considered</th>
                  <th className="text-left px-5 py-3 text-[10px] uppercase tracking-wider text-t3 hidden xl:table-cell">Impact on Infrasound</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {initialDesignDecisions.map((d, i) => (
                  <tr key={i} className="hover:bg-card/20 transition-colors align-top">
                    <td className="px-5 py-4 font-semibold text-cyan-300 whitespace-nowrap">{d.decision}</td>
                    <td className="px-5 py-4 text-t2 leading-relaxed font-sans max-w-sm">{d.reason}</td>
                    <td className="px-5 py-4 text-t3 leading-relaxed font-sans hidden lg:table-cell max-w-xs">{d.alternativeConsidered}</td>
                    <td className="px-5 py-4 text-emerald-300 leading-relaxed font-sans hidden xl:table-cell max-w-xs">{d.impactOnInfrasound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Insight Callout */}
          <div className="p-5 rounded-xl bg-deep border border-cyan-900/40 space-y-3">
            <h3 className="text-sm font-bold font-mono text-cyan-300">Core Engineering Philosophy</h3>
            <p className="text-xs font-sans text-t2 leading-relaxed">
              The central insight of INFRASENSE is that you cannot simply buy a pressure sensor and expect to detect infrasound. You must architect the <strong className="text-t1">entire measurement chain</strong> — from atmosphere → wind → pneumatics → transducer → electronics → digital algorithm — as a unified system where every component's noise contribution is below the target signal floor. A single noisy link breaks the entire chain.
            </p>
            <p className="text-xs font-sans text-t3 leading-relaxed">
              This is why INFRASENSE dedicates more engineering attention to the pneumatic equalization network, spatial wind filter, and temperature compensation than to the pressure sensor IC itself. The sensor chip is relatively straightforward to select. The ancillary acoustic and thermal management system is the actual hard engineering problem.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
