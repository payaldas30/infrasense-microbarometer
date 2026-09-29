export interface SensorReading {
  timestamp: number;
  timeLabel: string;
  pressure: number; // in Pascals (differential pressure fluctuation ΔP)
  temperature: number; // in Celsius
  signalRms?: number;
  noiseLevel?: number;
  filteredPressure?: number;
  dominantFrequency?: number;
  unfilteredWindPressure?: number;
  thermalDriftPa?: number;
}

export interface SensorStatus {
  connected: boolean;
  source: 'simulation' | 'hardware';
  samplingRate: number; // in Hz, default 50 Hz
  lastUpdate: number;
  adcStatus: 'READY' | 'SAMPLING' | 'ERROR' | 'OFFLINE';
  memsStatus: 'CONNECTED' | 'DISCONNECTED' | 'SATURATED';
  tempSensorStatus: 'CONNECTED' | 'FAULT';
  stm32Status: 'CONNECTED' | 'DISCONNECTED' | 'STANDBY';
  dataPacketRate: number; // samples/s
  droppedSamples: number;
  uptimeSeconds: number;
  signalSaturation: boolean;
}

export interface FrequencyPoint {
  frequency: number; // in Hz
  power: number; // in dB/Hz
  amplitude: number; // in Pa
  band: '0.01-0.1' | '0.1-1' | '1-10' | '10-20';
  isDominant?: boolean;
}

export type EventStatus = 'NO SIGNIFICANT ACTIVITY' | 'SIGNAL DETECTED' | 'LOW-FREQUENCY DISTURBANCE';

export interface InfrasoundEvent {
  id: string;
  timestamp: number;
  status: EventStatus;
  dominantFreq: number;
  peakAmplitude: number;
  bandEnergy: number; // in Pa²
  durationSec: number;
  confidence: number;
}

export interface ComponentSpec {
  id: string;
  name: string;
  category: 'atmosphere' | 'pneumatic' | 'sensor' | 'acquisition' | 'mcu' | 'dsp' | 'serial' | 'ui';
  sensingPrinciple: string;
  pressureRange: string;
  interfaceType: string;
  resolution: string;
  responseTime: string;
  supplyVoltage: string;
  temperatureCharacteristics: string;
  selectedComponent: string;
  datasheetUrl?: string;
  notes: string;
}

export type FilterType = 'OFF' | 'LOW PASS' | 'BAND PASS' | 'HIGH PASS';

export interface CalibrationItem {
  id: string;
  parameter: string;
  value: string;
  unit: string;
  status: 'MEASURED' | 'TARGET' | 'SIMULATED' | 'NOT AVAILABLE';
  notes: string;
}

export interface ValidationItem {
  id: string;
  title: string;
  status: 'complete' | 'in_progress' | 'pending';
  category: string;
  note: string;
}

export interface ProjectConfig {
  projectName: string;
  subtitle: string;
  subText: string;
  problemStatementId: string;
  organization: string;
  frequencyMin: number;
  frequencyMax: number;
  targetPrototypeCostDisplay: string;
  samplingRate: number;
  sensorResolution: string;
  sensorRange: string;
}
