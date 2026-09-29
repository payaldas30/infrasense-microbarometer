import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  SensorReading, 
  SensorStatus, 
  FrequencyPoint, 
  InfrasoundEvent, 
  FilterType, 
  CalibrationItem, 
  ValidationItem, 
  ComponentSpec 
} from '../types';
import { 
  InfrasoundSimulator, 
  SimulationParams, 
  defaultSimParams, 
  generateSpectrumData 
} from '../services/mockDataEngine';
import { 
  initialCalibrationItems, 
  initialValidationItems, 
  signalChainComponents 
} from '../config/projectConfig';

export type TimeWindow = '5s' | '30s' | '1m' | '5m' | '15m';

interface SensorContextType {
  readings: SensorReading[];
  currentReading: SensorReading;
  spectrumData: FrequencyPoint[];
  selectedBand: 'all' | '0.01-0.1' | '0.1-1' | '1-10' | '10-20';
  setSelectedBand: (band: 'all' | '0.01-0.1' | '0.1-1' | '1-10' | '10-20') => void;
  status: SensorStatus;
  timeWindow: TimeWindow;
  setTimeWindow: (w: TimeWindow) => void;
  autoScale: boolean;
  toggleAutoScale: () => void;
  isPaused: boolean;
  togglePause: () => void;
  clearBuffer: () => void;
  
  // Recording
  isRecording: boolean;
  recordingDurationSeconds: number;
  startRecording: () => void;
  stopRecording: () => void;
  exportCSV: () => void;
  exportJSON: () => void;

  // Signal processing controls
  simParams: SimulationParams;
  updateSimParams: (params: Partial<SimulationParams>) => void;
  filterType: FilterType;
  setFilterType: (f: FilterType) => void;
  lowerCutoff: number;
  setLowerCutoff: (v: number) => void;
  upperCutoff: number;
  setUpperCutoff: (v: number) => void;
  applyFilter: () => void;
  resetFilter: () => void;
  
  // Processing flags
  toggleDcRemoval: () => void;
  toggleTempCompensation: () => void;
  toggleNoiseReduction: () => void;
  toggleEnableFft: () => void;
  toggleEnablePsd: () => void;

  // Temp compensation toggle
  tempDisplayMode: 'RAW' | 'COMPENSATED';
  setTempDisplayMode: (m: 'RAW' | 'COMPENSATED') => void;

  // Events
  latestEvent?: InfrasoundEvent;
  injectTransientEvent: () => void;

  // Operating Mode
  toggleSource: () => void;
  setSource: (s: 'simulation' | 'hardware') => void;

  // Calibration & Validation
  calibrationItems: CalibrationItem[];
  isCalibrating: boolean;
  calibrationProgress: number;
  runCalibration: () => void;
  validationItems: ValidationItem[];
  toggleValidationItem: (id: string) => void;

  // Component spec modal
  selectedComponent: ComponentSpec | null;
  setSelectedComponent: (c: ComponentSpec | null) => void;

  // Computed metrics
  dominantFrequency: number;
  signalRMS: number;
  noiseEstimate: number;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simParams, setSimParams] = useState<SimulationParams>(defaultSimParams);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30s');
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedBand, setSelectedBand] = useState<'all' | '0.01-0.1' | '0.1-1' | '1-10' | '10-20'>('all');
  const [tempDisplayMode, setTempDisplayMode] = useState<'RAW' | 'COMPENSATED'>('COMPENSATED');

  // Filter settings
  const [filterType, setFilterType] = useState<FilterType>('BAND PASS');
  const [lowerCutoff, setLowerCutoff] = useState<number>(0.01);
  const [upperCutoff, setUpperCutoff] = useState<number>(20.0);

  // Status & Telemetry
  const [status, setStatus] = useState<SensorStatus>({
    connected: true,
    source: 'simulation',
    samplingRate: 50, // 50 Hz
    lastUpdate: Date.now(),
    adcStatus: 'READY',
    memsStatus: 'CONNECTED',
    tempSensorStatus: 'CONNECTED',
    stm32Status: 'CONNECTED',
    dataPacketRate: 50,
    droppedSamples: 0,
    uptimeSeconds: 0,
    signalSaturation: false,
  });

  // Recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState<number>(0);
  const recordedReadingsRef = useRef<SensorReading[]>([]);

  // Calibration state
  const [calibrationItems, setCalibrationItems] = useState<CalibrationItem[]>(initialCalibrationItems);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);

  // Validation items
  const [validationItems, setValidationItems] = useState<ValidationItem[]>(initialValidationItems);

  // Selected signal chain component for detail modal
  const [selectedComponent, setSelectedComponent] = useState<ComponentSpec | null>(null);

  // Data streams
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [currentReading, setCurrentReading] = useState<SensorReading>({
    timestamp: Date.now(),
    timeLabel: '0.00s',
    pressure: 12.43,
    temperature: 28.6,
    signalRms: 3.82,
    noiseLevel: 0.74,
    filteredPressure: 12.38,
    dominantFrequency: 0.043,
    unfilteredWindPressure: 16.85,
    thermalDriftPa: 0.12,
  });

  const [spectrumData, setSpectrumData] = useState<FrequencyPoint[]>(() =>
    generateSpectrumData(defaultSimParams, 'all')
  );

  const [latestEvent, setLatestEvent] = useState<InfrasoundEvent | undefined>(undefined);

  const simulatorRef = useRef<InfrasoundSimulator>(new InfrasoundSimulator());
  const timerRef = useRef<number | null>(null);
  const uptimeTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Update simulation parameters
  const updateSimParams = useCallback((params: Partial<SimulationParams>) => {
    setSimParams(prev => {
      const next = { ...prev, ...params };
      setSpectrumData(generateSpectrumData(next, selectedBand));
      return next;
    });
  }, [selectedBand]);

  // Toggle Source between Simulation and Live Hardware
  const toggleSource = useCallback(() => {
    setStatus(prev => {
      const next = prev.source === 'simulation' ? 'hardware' : 'simulation';
      return {
        ...prev,
        source: next,
        stm32Status: 'CONNECTED',
      };
    });
  }, []);

  const setSource = useCallback((source: 'simulation' | 'hardware') => {
    setStatus(prev => ({
      ...prev,
      source,
      stm32Status: 'CONNECTED',
    }));
  }, []);

  // Filter application
  const applyFilter = useCallback(() => {
    updateSimParams({
      filterType,
      lowerCutoff,
      upperCutoff,
    });
  }, [filterType, lowerCutoff, upperCutoff, updateSimParams]);

  const resetFilter = useCallback(() => {
    setFilterType('BAND PASS');
    setLowerCutoff(0.01);
    setUpperCutoff(20.0);
    updateSimParams({
      filterType: 'BAND PASS',
      lowerCutoff: 0.01,
      upperCutoff: 20.0,
      dcRemoval: true,
      tempCompensation: true,
      noiseReduction: true,
    });
  }, [updateSimParams]);

  const toggleDcRemoval = useCallback(() => {
    updateSimParams({ dcRemoval: !simParams.dcRemoval });
  }, [simParams.dcRemoval, updateSimParams]);

  const toggleTempCompensation = useCallback(() => {
    updateSimParams({ tempCompensation: !simParams.tempCompensation });
  }, [simParams.tempCompensation, updateSimParams]);

  const toggleNoiseReduction = useCallback(() => {
    updateSimParams({ noiseReduction: !simParams.noiseReduction });
  }, [simParams.noiseReduction, updateSimParams]);

  const toggleEnableFft = useCallback(() => {
    updateSimParams({ enableFft: !simParams.enableFft });
  }, [simParams.enableFft, updateSimParams]);

  const toggleEnablePsd = useCallback(() => {
    updateSimParams({ enablePsd: !simParams.enablePsd });
  }, [simParams.enablePsd, updateSimParams]);

  const toggleAutoScale = useCallback(() => setAutoScale(v => !v), []);
  const togglePause = useCallback(() => setIsPaused(v => !v), []);

  const clearBuffer = useCallback(() => {
    setReadings([]);
    simulatorRef.current.reset();
  }, []);

  // Inject a synthetic transient event
  const injectTransientEvent = useCallback(() => {
    updateSimParams({ injectEvent: true });
    setTimeout(() => {
      updateSimParams({ injectEvent: false });
    }, 12000);
  }, [updateSimParams]);

  // Recording controls
  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDurationSeconds(0);
    recordedReadingsRef.current = [];
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  // Calibration routine simulation
  const runCalibration = useCallback(() => {
    if (isCalibrating) return;
    setIsCalibrating(true);
    setCalibrationProgress(0);

    const interval = window.setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          setCalibrationItems(curr =>
            curr.map(item => ({
              ...item,
              status: item.status === 'NOT AVAILABLE' ? 'SIMULATED' : item.status,
            }))
          );
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  }, [isCalibrating]);

  // Validation item toggle
  const toggleValidationItem = useCallback((id: string) => {
    setValidationItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus: 'complete' | 'in_progress' | 'pending' =
            item.status === 'complete' ? 'in_progress' : item.status === 'in_progress' ? 'pending' : 'complete';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  }, []);

  // Export CSV
  const exportCSV = useCallback(() => {
    const dataToExport = recordedReadingsRef.current.length > 0 ? recordedReadingsRef.current : readings;
    if (dataToExport.length === 0) {
      alert("No sensor readings buffered to export.");
      return;
    }
    const headers = ["timestamp_ms", "time_sec", "pressure_pa", "filtered_pressure_pa", "temperature_c", "signal_rms_pa", "noise_level_pa", "dominant_frequency_hz"];
    const rows = dataToExport.map(r => [
      r.timestamp,
      r.timeLabel,
      r.pressure,
      r.filteredPressure ?? r.pressure,
      r.temperature,
      r.signalRms ?? 0,
      r.noiseLevel ?? 0,
      r.dominantFrequency ?? 0.043,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `INFRASENSE_recording_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [readings]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const dataToExport = recordedReadingsRef.current.length > 0 ? recordedReadingsRef.current : readings;
    if (dataToExport.length === 0) {
      alert("No sensor readings buffered to export.");
      return;
    }
    const payload = {
      instrument: "INFRASENSE — MEMS Infrasound Microbarometer",
      problemStatement: "SIH26144",
      organization: "NTRO",
      operatingMode: status.source,
      samplingRateHz: status.samplingRate,
      exportedAt: new Date().toISOString(),
      sampleCount: dataToExport.length,
      samples: dataToExport,
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const link = document.createElement("a");
    link.href = jsonStr;
    link.download = `INFRASENSE_recording_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [readings, status]);

  // Uptime & Recording Timers
  useEffect(() => {
    uptimeTimerRef.current = window.setInterval(() => {
      setStatus(prev => ({
        ...prev,
        uptimeSeconds: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));

      if (isRecording) {
        setRecordingDurationSeconds(s => s + 1);
      }
    }, 1000);

    return () => {
      if (uptimeTimerRef.current) clearInterval(uptimeTimerRef.current);
    };
  }, [isRecording]);

  // Main 50 Hz Sensor Sampling Loop (interval = 20ms for 50 Hz)
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const dt = 1 / status.samplingRate; // 0.02s

    // Max buffer size according to timeWindow
    const maxSamples = 
      timeWindow === '5s' ? 250 :
      timeWindow === '30s' ? 1500 :
      timeWindow === '1m' ? 3000 :
      timeWindow === '5m' ? 6000 : 10000;

    let localSampleCount = 0;

    timerRef.current = window.setInterval(() => {
      localSampleCount++;
      const step = simulatorRef.current.step(dt, simParams);
      const now = Date.now();
      const elapsedSec = ((now - startTimeRef.current) / 1000).toFixed(2);

      const reading: SensorReading = {
        timestamp: now,
        timeLabel: `${elapsedSec}s`,
        pressure: step.rawPressure,
        temperature: step.temperature,
        signalRms: step.rmsEstimate,
        noiseLevel: step.noiseEstimate,
        filteredPressure: step.filteredPressure,
        dominantFrequency: simParams.primaryFrequency,
        unfilteredWindPressure: step.unfilteredWindPressure,
        thermalDriftPa: step.thermalDriftPa,
      };

      setCurrentReading(reading);

      // Push into live rolling display buffer
      setReadings(prev => {
        const next = [...prev, reading];
        if (next.length > maxSamples) {
          // Decimate or slice to retain smooth performance
          return next.slice(next.length - maxSamples);
        }
        return next;
      });

      // If recording is active, append to recorded buffer
      if (isRecording) {
        recordedReadingsRef.current.push(reading);
      }

      // Event state
      if (step.event) {
        setLatestEvent(step.event);
      }

      // Update status packet timestamp
      if (localSampleCount % 25 === 0) {
        setStatus(prev => ({
          ...prev,
          lastUpdate: now,
          signalSaturation: Math.abs(step.rawPressure) > 240,
        }));
      }
    }, 20); // 20ms = 50 Hz

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isRecording, simParams, status.samplingRate, timeWindow]);

  // Periodically refresh spectrum data with selected band
  useEffect(() => {
    setSpectrumData(generateSpectrumData(simParams, selectedBand));
  }, [simParams, selectedBand]);

  // Derived metrics
  const dominantFrequency = currentReading.dominantFrequency || simParams.primaryFrequency;
  const signalRMS = currentReading.signalRms || 3.82;
  const noiseEstimate = currentReading.noiseLevel || 0.74;

  return (
    <SensorContext.Provider
      value={{
        readings,
        currentReading,
        spectrumData,
        selectedBand,
        setSelectedBand,
        status,
        timeWindow,
        setTimeWindow,
        autoScale,
        toggleAutoScale,
        isPaused,
        togglePause,
        clearBuffer,
        isRecording,
        recordingDurationSeconds,
        startRecording,
        stopRecording,
        exportCSV,
        exportJSON,
        simParams,
        updateSimParams,
        filterType,
        setFilterType,
        lowerCutoff,
        setLowerCutoff,
        upperCutoff,
        setUpperCutoff,
        applyFilter,
        resetFilter,
        toggleDcRemoval,
        toggleTempCompensation,
        toggleNoiseReduction,
        toggleEnableFft,
        toggleEnablePsd,
        tempDisplayMode,
        setTempDisplayMode,
        latestEvent,
        injectTransientEvent,
        toggleSource,
        setSource,
        calibrationItems,
        isCalibrating,
        calibrationProgress,
        runCalibration,
        validationItems,
        toggleValidationItem,
        selectedComponent,
        setSelectedComponent,
        dominantFrequency,
        signalRMS,
        noiseEstimate,
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
