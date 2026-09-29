import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { SensorReading, SensorStatus, FrequencyPoint, InfrasoundEvent, ProjectConfig } from '../types';
import { InfrasoundSimulator, SimulationParams, defaultSimParams, generatePSD } from '../services/mockDataEngine';
import { initialProjectConfig } from '../config/projectConfig';

interface SensorContextType {
  readings: SensorReading[];
  currentReading: SensorReading;
  psdData: FrequencyPoint[];
  status: SensorStatus;
  simParams: SimulationParams;
  updateSimParams: (params: Partial<SimulationParams>) => void;
  isAcquiring: boolean;
  startAcquisition: () => void;
  stopAcquisition: () => void;
  isPaused: boolean;
  togglePause: () => void;
  clearBuffer: () => void;
  timeWindow: '1m' | '5m' | '15m' | '1h';
  setTimeWindow: (w: '1m' | '5m' | '15m' | '1h') => void;
  detectedEvents: InfrasoundEvent[];
  exportCSV: () => void;
  exportJSON: () => void;
  triggerTransientEvent: () => void;
  toggleDataSource: () => void;
  projectConfig: ProjectConfig;
  updateProjectConfig: (cfg: Partial<ProjectConfig>) => void;
  stats: {
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
    dominantFreq: number;
    rmsValue: number;
    noiseFloor: number;
  };
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>(initialProjectConfig);
  const [simParams, setSimParams] = useState<SimulationParams>(defaultSimParams);
  const [isAcquiring, setIsAcquiring] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeWindow, setTimeWindow] = useState<'1m' | '5m' | '15m' | '1h'>('1m');

  const [status, setStatus] = useState<SensorStatus>({
    connected: true,
    source: 'simulation',
    samplingRate: 10,
    lastUpdate: Date.now(),
    adcStatus: 'READY',
    memsStatus: 'CONNECTED',
    tempSensorStatus: 'CONNECTED',
    stm32Status: 'ONLINE',
    dataPacketRate: 10,
    signalSaturation: false,
  });

  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [detectedEvents, setDetectedEvents] = useState<InfrasoundEvent[]>([]);
  const [currentReading, setCurrentReading] = useState<SensorReading>({
    timestamp: Date.now(),
    timeLabel: '00:00:00',
    pressure: 0.024,
    temperature: 24.5,
    signalRms: 0.031,
    noiseLevel: 0.012,
    filteredPressure: 0.022,
  });

  const [psdData, setPsdData] = useState<FrequencyPoint[]>(() => generatePSD(defaultSimParams));

  const simulatorRef = useRef<InfrasoundSimulator>(new InfrasoundSimulator());
  const timerRef = useRef<number | null>(null);

  // Update simulation parameters
  const updateSimParams = useCallback((params: Partial<SimulationParams>) => {
    setSimParams(prev => {
      const next = { ...prev, ...params };
      setPsdData(generatePSD(next));
      return next;
    });
  }, []);

  const updateProjectConfig = useCallback((cfg: Partial<ProjectConfig>) => {
    setProjectConfig(prev => ({ ...prev, ...cfg }));
  }, []);

  // Toggle between Simulation Mode and Hardware Mode (Architecture ready for STM32 connection)
  const toggleDataSource = useCallback(() => {
    setStatus(prev => {
      const nextSource = prev.source === 'simulation' ? 'hardware' : 'simulation';
      return {
        ...prev,
        source: nextSource,
        stm32Status: nextSource === 'hardware' ? 'ONLINE' : 'ONLINE',
        adcStatus: nextSource === 'hardware' ? 'SAMPLING' : 'READY',
      };
    });
  }, []);

  // Trigger synthetic infrasound impulse
  const triggerTransientEvent = useCallback(() => {
    updateSimParams({ injectEvent: true });
    setTimeout(() => {
      updateSimParams({ injectEvent: false });
    }, 12000);
  }, [updateSimParams]);

  const clearBuffer = useCallback(() => {
    setReadings([]);
    simulatorRef.current.reset();
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const startAcquisition = useCallback(() => {
    setIsAcquiring(true);
    setIsPaused(false);
  }, []);

  const stopAcquisition = useCallback(() => {
    setIsAcquiring(false);
  }, []);

  // Main sampling loop (100ms interval = 10 Hz sampling rate)
  useEffect(() => {
    if (!isAcquiring || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const dt = 1 / status.samplingRate; // 0.1s

    timerRef.current = window.setInterval(() => {
      const sim = simulatorRef.current.step(dt, simParams);
      const now = Date.now();
      const date = new Date(now);
      const timeLabel = date.toTimeString().split(' ')[0] + '.' + Math.floor(date.getMilliseconds() / 100);

      const newReading: SensorReading = {
        timestamp: now,
        timeLabel,
        pressure: sim.rawPressure,
        temperature: sim.temperature,
        signalRms: sim.rmsEstimate,
        noiseLevel: sim.noiseEstimate,
        filteredPressure: sim.filteredPressure,
      };

      setCurrentReading(newReading);

      setReadings(prev => {
        // Buffer max limit depending on window
        const maxPoints = timeWindow === '1m' ? 120 : timeWindow === '5m' ? 300 : timeWindow === '15m' ? 600 : 1200;
        const next = [...prev, newReading];
        if (next.length > maxPoints) {
          return next.slice(next.length - maxPoints);
        }
        return next;
      });

      setStatus(prev => ({
        ...prev,
        lastUpdate: now,
        signalSaturation: Math.abs(sim.rawPressure) > 2.5,
      }));

      // If an event was detected
      if (sim.event) {
        setDetectedEvents(prev => {
          // Avoid duplicate event within 5s
          if (prev.length > 0 && now - prev[0].timestamp < 6000) {
            return prev;
          }
          return [sim.event!, ...prev.slice(0, 9)];
        });
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAcquiring, isPaused, simParams, status.samplingRate, timeWindow]);

  // Periodically refresh PSD when params are steady
  useEffect(() => {
    const id = setInterval(() => {
      setPsdData(generatePSD(simParams));
    }, 3000);
    return () => clearInterval(id);
  }, [simParams]);

  // Statistical calculations
  const stats = React.useMemo(() => {
    if (readings.length === 0) {
      return {
        avgTemp: 24.5,
        minTemp: 24.2,
        maxTemp: 24.8,
        dominantFreq: simParams.primaryFrequency,
        rmsValue: 0.031,
        noiseFloor: 0.012,
      };
    }
    const temps = readings.map(r => r.temperature);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const rmsValue = currentReading.signalRms || 0.031;
    const noiseFloor = currentReading.noiseLevel || 0.012;

    return {
      avgTemp: Number(avgTemp.toFixed(2)),
      minTemp: Number(minTemp.toFixed(2)),
      maxTemp: Number(maxTemp.toFixed(2)),
      dominantFreq: simParams.primaryFrequency,
      rmsValue: Number(rmsValue.toFixed(4)),
      noiseFloor: Number(noiseFloor.toFixed(4)),
    };
  }, [readings, currentReading, simParams.primaryFrequency]);

  // Export CSV
  const exportCSV = useCallback(() => {
    if (readings.length === 0) {
      alert("No sensor data buffered to export.");
      return;
    }
    const headers = ["timestamp", "iso_time", "pressure_pa", "filtered_pressure_pa", "temperature_c", "sampling_rate_hz", "signal_rms_pa", "noise_floor_pa"];
    const rows = readings.map(r => [
      r.timestamp,
      new Date(r.timestamp).toISOString(),
      r.pressure,
      r.filteredPressure ?? r.pressure,
      r.temperature,
      status.samplingRate,
      r.signalRms ?? 0,
      r.noiseLevel ?? 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `INFRASENSE_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [readings, status.samplingRate]);

  // Export JSON
  const exportJSON = useCallback(() => {
    if (readings.length === 0) {
      alert("No sensor data buffered to export.");
      return;
    }
    const payload = {
      project: "INFRASENSE",
      problemStatement: "SIH26144",
      dataSource: status.source,
      samplingRateHz: status.samplingRate,
      exportedAt: new Date().toISOString(),
      statistics: stats,
      readingsCount: readings.length,
      readings,
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `INFRASENSE_telemetry_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [readings, status, stats]);

  return (
    <SensorContext.Provider
      value={{
        readings,
        currentReading,
        psdData,
        status,
        simParams,
        updateSimParams,
        isAcquiring,
        startAcquisition,
        stopAcquisition,
        isPaused,
        togglePause,
        clearBuffer,
        timeWindow,
        setTimeWindow,
        detectedEvents,
        exportCSV,
        exportJSON,
        triggerTransientEvent,
        toggleDataSource,
        projectConfig,
        updateProjectConfig,
        stats,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = (): SensorContextType => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
};
