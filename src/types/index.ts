export interface SensorReading {
  timestamp: number;
  timeLabel: string;
  pressure: number; // in Pascals (differential pressure fluctuation)
  temperature: number; // in Celsius
  signalRms?: number;
  noiseLevel?: number;
  filteredPressure?: number;
}

export interface SensorStatus {
  connected: boolean;
  source: 'simulation' | 'hardware';
  samplingRate: number; // in Hz, e.g., 10 or 20 Hz
  lastUpdate: number;
  adcStatus: 'READY' | 'SAMPLING' | 'ERROR' | 'OFFLINE';
  memsStatus: 'CONNECTED' | 'DISCONNECTED' | 'SATURATED';
  tempSensorStatus: 'CONNECTED' | 'FAULT';
  stm32Status: 'ONLINE' | 'STANDBY' | 'BOOTING';
  dataPacketRate: number; // packets/sec
  signalSaturation: boolean;
}

export interface FrequencyPoint {
  frequency: number; // in Hz
  power: number; // in dB/Hz or Pa^2/Hz
  amplitude: number; // in Pa
}

export type EventStatus = 'NORMAL' | 'LOW-FREQUENCY DISTURBANCE' | 'POSSIBLE EVENT';

export interface InfrasoundEvent {
  id: string;
  timestamp: number;
  status: EventStatus;
  dominantFreq: number;
  peakAmplitude: number;
  durationSec: number;
  confidence: number;
}

export interface ComponentSpec {
  id: string;
  name: string;
  category: 'sensor' | 'pneumatic' | 'acquisition' | 'processing' | 'thermal';
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

export interface BOMItem {
  id: string;
  component: string;
  description: string;
  quantity: number;
  unitCost: number | null; // null if unpriced/awaiting final quote
  totalCost: number | null;
  status: 'Estimated' | 'Quoted' | 'Procured';
}

export type DevStatusState = 'complete' | 'in_progress' | 'pending';

export interface DevStatusItem {
  id: string;
  milestone: string;
  status: DevStatusState;
  notes: string;
}

export interface ResearchReference {
  id: string;
  title: string;
  authors: string;
  year: number;
  category: 'Infrasound' | 'MEMS Pressure Sensors' | 'Pneumatic Filtering' | 'Wind-Noise Reduction' | 'Signal Processing' | 'Calibration';
  doi?: string;
  link?: string;
  relevance: string;
}

export interface DesignDecision {
  decision: string;
  reason: string;
  alternativeConsidered: string;
  impactOnInfrasound: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  institution: string;
  responsibility: string;
  avatarPlaceholder?: string;
}

export interface SihSlide {
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  keyPoints: string[];
  metrics?: { label: string; value: string }[];
}

export interface ProjectConfig {
  projectName: string;
  subtitle: string;
  subText: string;
  problemStatementId: string;
  organization: string;
  category: string;
  theme: string;
  frequencyMin: number;
  frequencyMax: number;
  targetPrototypeCostMin: number;
  targetPrototypeCostMax: number;
  targetPrototypeCostDisplay: string;
  samplingRate: number;
  sensorResolution: string;
  sensorRange: string;
}
