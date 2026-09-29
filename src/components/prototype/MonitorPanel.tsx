import React, { useMemo } from 'react';
import { useSensor, TimeWindow } from '../../context/SensorContext';
import { Badge } from '../common/Badge';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  Activity, 
  Thermometer, 
  TrendingUp, 
  Zap, 
  Clock, 
  Maximize2, 
  Pause, 
  Play, 
  RotateCcw,
  Gauge
} from 'lucide-react';

export const MonitorPanel: React.FC = () => {
  const { 
    readings, 
    currentReading, 
    status, 
    timeWindow, 
    setTimeWindow, 
    autoScale, 
    toggleAutoScale, 
    isPaused, 
    togglePause, 
    clearBuffer,
    dominantFrequency,
    signalRMS,
    noiseEstimate
  } = useSensor();

  const timeWindowOptions: { label: string; value: TimeWindow }[] = [
    { label: '5 s', value: '5s' },
    { label: '30 s', value: '30s' },
    { label: '1 min', value: '1m' },
    { label: '5 min', value: '5m' },
    { label: '15 min', value: '15m' },
  ];

  // Downsample or slice readings according to the time window for high performance
  const chartData = useMemo(() => {
    const count = readings.length;
    if (count <= 250) return readings;
    const step = Math.ceil(count / 250);
    const sampled = [];
    for (let i = 0; i < count; i += step) {
      sampled.push(readings[i]);
    }
    if (sampled[sampled.length - 1] !== readings[count - 1]) {
      sampled.push(readings[count - 1]);
    }
    return sampled;
  }, [readings]);

  // Compute autoscale min/max
  const { yMin, yMax } = useMemo(() => {
    if (!autoScale || chartData.length === 0) {
      return { yMin: -25, yMax: 25 };
    }
    const pressures = chartData.map(d => d.pressure);
    const minVal = Math.min(...pressures);
    const maxVal = Math.max(...pressures);
    const padding = Math.max(1.0, (maxVal - minVal) * 0.15);
    return {
      yMin: Math.floor(minVal - padding),
      yMax: Math.ceil(maxVal + padding)
    };
  }, [autoScale, chartData]);

  // Metric Cards
  const metricCards = [
    {
      title: 'PRESSURE VARIATION',
      value: `${currentReading.pressure >= 0 ? '+' : ''}${currentReading.pressure.toFixed(2)} Pa`,
      sub: 'Differential ΔP',
      color: 'text-cyan-600 dark:text-cyan-400',
      icon: Gauge,
    },
    {
      title: 'TEMPERATURE',
      value: `${currentReading.temperature.toFixed(1)} °C`,
      sub: 'Reference Chamber',
      color: 'text-amber-600 dark:text-amber-400',
      icon: Thermometer,
    },
    {
      title: 'DOMINANT FREQUENCY',
      value: `${dominantFrequency.toFixed(3)} Hz`,
      sub: 'Infrasonic Peak',
      color: 'text-teal-600 dark:text-teal-400',
      icon: TrendingUp,
    },
    {
      title: 'SIGNAL RMS',
      value: `${signalRMS.toFixed(2)} Pa`,
      sub: 'Band RMS Energy',
      color: 'text-t1',
      icon: Activity,
    },
    {
      title: 'NOISE ESTIMATE',
      value: `${noiseEstimate.toFixed(2)} Pa`,
      sub: '1/f + Electronic Noise',
      color: 'text-t2',
      icon: Zap,
    },
    {
      title: 'SAMPLE RATE',
      value: `${status.samplingRate} Hz`,
      sub: 'Hardware DMA Rate',
      color: 'text-cyan-600 dark:text-cyan-300',
      icon: Clock,
    },
  ];

  return (
    <section id="monitor" className="space-y-4">
      
      {/* 1. Live Numerical Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 font-mono">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title}
              className="p-3.5 sm:p-4 rounded-xl bg-card border border-theme flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-sm"
            >
              <div className="flex items-center justify-between text-[10px] text-t3 mb-1.5">
                <span className="uppercase tracking-wider font-semibold">{card.title}</span>
                <Icon className="w-3.5 h-3.5 text-cyan-500/80" />
              </div>
              <div className={`text-xl sm:text-2xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme-sub text-[10px]">
                <span className="text-t3">{card.sub}</span>
                <Badge type={status.source === 'simulation' ? 'SIMULATED' : 'MEASURED'} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Primary Signal Oscilloscope Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-panel border border-theme shadow-sm relative overflow-hidden font-mono">
        {/* Oscilloscope subtle grid overlay */}
        <div className="absolute inset-0 tech-grid opacity-25 pointer-events-none" />

        {/* Chart Header & Controls Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-theme">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-t1 tracking-wider uppercase">
                PRESSURE VARIATION
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                ΔP (Pa) vs Time (s)
              </span>
            </div>
            <p className="text-[11px] text-t3 mt-0.5">
              Continuous real-time differential pressure fluctuation across MEMS sensing diaphragm
            </p>
          </div>

          {/* Interactive Chart Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Time Window Selectors */}
            <div className="flex items-center gap-0.5 p-0.5 bg-deep rounded-lg border border-theme text-[11px]">
              {timeWindowOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeWindow(opt.value)}
                  className={`px-2 py-1 rounded transition-colors ${
                    timeWindow === opt.value
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'text-t3 hover:text-t1'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Auto Scale Button */}
            <button
              onClick={toggleAutoScale}
              className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                autoScale
                  ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-600 dark:text-cyan-300 font-bold'
                  : 'bg-card border-theme text-t3 hover:text-t1'
              }`}
              title="Automatically adjust Y-axis scale to waveform peaks"
            >
              <Maximize2 className="w-3 h-3" />
              <span>AUTO SCALE {autoScale ? 'ON' : 'OFF'}</span>
            </button>

            {/* Pause / Resume Button */}
            <button
              onClick={togglePause}
              className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1 transition-colors ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-600 dark:text-amber-300 font-bold'
                  : 'bg-card border-theme text-t2 hover:text-t1'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <Pause className="w-3 h-3 text-amber-500" />}
              <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>

            {/* Clear Buffer */}
            <button
              onClick={clearBuffer}
              title="Reset waveform buffer"
              className="p-1.5 rounded-lg bg-card hover:bg-deep border border-theme text-t3 hover:text-t1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Oscilloscope Chart Canvas */}
        <div className="relative h-64 sm:h-80 w-full bg-deep/60 dark:bg-[#050812] rounded-xl border border-theme overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="pressureWaveformGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis 
                dataKey="timeLabel"
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                interval="preserveStartEnd"
                tickLine={false}
              />
              <YAxis 
                domain={[yMin, yMax]}
                tick={{ fontSize: 9, fontFamily: 'JetBrains Mono', fill: 'var(--t3)' }}
                tickFormatter={(v) => `${v.toFixed(1)} Pa`}
                width={65}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-panel border border-cyan-500/50 rounded-lg p-2.5 text-xs shadow-xl text-t1 font-mono">
                        <div className="text-t3 mb-1">t = {data.timeLabel}</div>
                        <div className="text-cyan-600 dark:text-cyan-300 font-bold">ΔP: {data.pressure.toFixed(3)} Pa</div>
                        <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">Filtered: {data.filteredPressure?.toFixed(3)} Pa</div>
                        <div className="text-amber-600 dark:text-amber-400 text-[11px]">Temp: {data.temperature?.toFixed(1)} °C</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
              <Area 
                type="monotone"
                dataKey="pressure"
                name="Pressure ΔP"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#pressureWaveformGrad)"
                dot={false}
                isAnimationActive={false}
              />
              <Area 
                type="monotone"
                dataKey="filteredPressure"
                name="DSP Filtered"
                stroke="#10b981"
                strokeWidth={1.5}
                fill="none"
                strokeDasharray="4 2"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* CRT Scanline overlay effect */}
          <div className="absolute inset-0 crt-scanline pointer-events-none opacity-20" />
        </div>

        {/* Chart Telemetry Footer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-t3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-cyan-500 inline-block" />
              <span className="text-t2">Raw Differential Fluctuation (ΔP)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-emerald-500 inline-block border-dashed" />
              <span className="text-t2">0.01–20 Hz Filtered Signal</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-t3">
              Samples in buffer: {readings.length} | Fs = {status.samplingRate} Hz
            </span>
            <Badge type={status.source === 'simulation' ? 'SIMULATED' : 'LIVE HARDWARE'} size="sm" />
          </div>
        </div>
      </div>
    </section>
  );
};
