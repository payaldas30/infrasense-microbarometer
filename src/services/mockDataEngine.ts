import { FrequencyPoint, InfrasoundEvent, FilterType } from '../types';

export interface SimulationParams {
  signalAmplitude: number; // in Pa (e.g. 3.5 Pa or 0.05 to 15 Pa)
  primaryFrequency: number; // in Hz (e.g. 0.043 Hz)
  noiseLevel: number; // in Pa RMS (e.g. 0.74 Pa)
  windDisturbance: number; // 0 to 1 scale
  temperatureDrift: number; // °C/hour
  enableMultiTone: boolean;
  filterType: FilterType;
  lowerCutoff: number; // Hz (e.g. 0.01)
  upperCutoff: number; // Hz (e.g. 20.0)
  dcRemoval: boolean;
  tempCompensation: boolean;
  noiseReduction: boolean;
  enableFft: boolean;
  enablePsd: boolean;
  injectEvent: boolean;
  eventMagnitude: number;
}

export const defaultSimParams: SimulationParams = {
  signalAmplitude: 3.82,
  primaryFrequency: 0.043,
  noiseLevel: 0.74,
  windDisturbance: 0.35,
  temperatureDrift: 0.25,
  enableMultiTone: true,
  filterType: 'BAND PASS',
  lowerCutoff: 0.01,
  upperCutoff: 20.0,
  dcRemoval: true,
  tempCompensation: true,
  noiseReduction: true,
  enableFft: true,
  enablePsd: true,
  injectEvent: false,
  eventMagnitude: 6.5,
};

// Box-Muller Gaussian random generator
export function gaussianRandom(mean = 0, stdev = 1): number {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export class InfrasoundSimulator {
  private t: number = 0; // seconds elapsed
  private pinkNoiseState: number = 0;
  private temperature: number = 28.6; // °C
  private eventTimer: number = 0;
  private eventActive: boolean = false;
  private prevFilterOut: number = 0;

  constructor() {}

  public step(dt: number, params: SimulationParams): {
    rawPressure: number;
    filteredPressure: number;
    unfilteredWindPressure: number;
    thermalDriftPa: number;
    temperature: number;
    rmsEstimate: number;
    noiseEstimate: number;
    event?: InfrasoundEvent;
  } {
    this.t += dt;

    // 1. Slow atmospheric diurnal drift (~0.0003 Hz)
    const atmosphericDrift = 1.8 * Math.sin(2 * Math.PI * 0.0003 * this.t);

    // 2. Multi-tone Infrasound Components:
    // 0.015 Hz, 0.04 Hz, 0.1 Hz + higher frequency harmonics (0.5 Hz, 2 Hz)
    let infrasonicSignal = 0;
    if (params.enableMultiTone) {
      // Primary carrier at primaryFrequency (e.g. 0.043 Hz)
      infrasonicSignal += params.signalAmplitude * Math.sin(2 * Math.PI * params.primaryFrequency * this.t);
      // 0.015 Hz sub-wave
      infrasonicSignal += (params.signalAmplitude * 0.45) * Math.sin(2 * Math.PI * 0.015 * this.t + 0.8);
      // 0.1 Hz microbarom wave
      infrasonicSignal += (params.signalAmplitude * 0.35) * Math.sin(2 * Math.PI * 0.1 * this.t + 1.9);
      // 0.45 Hz local atmospheric fluctuation
      infrasonicSignal += (params.signalAmplitude * 0.18) * Math.sin(2 * Math.PI * 0.45 * this.t + 2.5);
      // 2.2 Hz acoustic ripple
      infrasonicSignal += (params.signalAmplitude * 0.08) * Math.sin(2 * Math.PI * 2.2 * this.t + 0.4);
    } else {
      infrasonicSignal = params.signalAmplitude * Math.sin(2 * Math.PI * params.primaryFrequency * this.t);
    }

    // 3. 1/f Pink Noise (Atmospheric flicker)
    const white = gaussianRandom(0, 1);
    this.pinkNoiseState = 0.96 * this.pinkNoiseState + 0.04 * white;
    const flickerNoise = this.pinkNoiseState * (params.noiseLevel * 0.7);

    // 4. Wind Dynamic Disturbance (0.5 * rho * v^2)
    const windBursts = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 0.025 * this.t) + 0.4 * Math.cos(2 * Math.PI * 0.06 * this.t)), 2);
    const rawWindTurbulence = windBursts * (params.windDisturbance * 4.2) * gaussianRandom(0, 1);
    
    // Sensed wind with Porous Hose Array attenuation (~18 dB suppression => factor ~0.14)
    const filteredWindTurbulence = rawWindTurbulence * 0.14;

    // 5. Electronic / ADC Gaussian Noise
    const electronicNoise = gaussianRandom(0, params.noiseLevel * 0.4);

    // 6. Temperature evolution and thermal pressure drift
    // PV = nRT causes pressure drift if temperature changes rapidly inside reference chamber
    this.temperature += (params.temperatureDrift / 3600) * dt + gaussianRandom(0, 0.0008);
    const thermalDriftPa = (this.temperature - 28.6) * 0.85;

    // 7. Transient Event Injection
    let eventSignal = 0;
    let detectedEvent: InfrasoundEvent | undefined;

    if (params.injectEvent || this.eventActive) {
      if (!this.eventActive) {
        this.eventActive = true;
        this.eventTimer = 0;
      }
      this.eventTimer += dt;
      // Infrasonic wavelet (e.g. 0.043 Hz damped envelope)
      const envelope = Math.exp(-Math.pow((this.eventTimer - 6) / 2.8, 2));
      eventSignal = params.eventMagnitude * envelope * Math.sin(2 * Math.PI * 0.043 * this.eventTimer);

      if (this.eventTimer > 14) {
        this.eventActive = false;
        this.eventTimer = 0;
      }
    }

    // Raw Pressure sensed across MEMS diaphragm (unprocessed)
    const rawPressure = atmosphericDrift + infrasonicSignal + flickerNoise + filteredWindTurbulence + electronicNoise + thermalDriftPa + eventSignal;
    
    // Unfiltered pressure without wind array (for comparison chart)
    const unfilteredWindPressure = atmosphericDrift + infrasonicSignal + flickerNoise + rawWindTurbulence + electronicNoise + thermalDriftPa + eventSignal;

    // Digital Signal Processing Stage:
    let dspOutput = rawPressure;

    // A. DC / Diurnal Drift Removal
    if (params.dcRemoval) {
      dspOutput -= atmosphericDrift;
    }

    // B. Temperature Compensation
    if (params.tempCompensation) {
      dspOutput -= thermalDriftPa;
    }

    // C. Noise Reduction
    if (params.noiseReduction) {
      dspOutput -= (electronicNoise * 0.6 + flickerNoise * 0.4);
    }

    // D. Digital Filter Simulation (OFF, LOW PASS, BAND PASS, HIGH PASS)
    if (params.filterType === 'BAND PASS') {
      // Passes between lowerCutoff (0.01) and upperCutoff (20.0 Hz)
      dspOutput = infrasonicSignal + eventSignal + (filteredWindTurbulence * 0.6) + (electronicNoise * 0.2);
    } else if (params.filterType === 'LOW PASS') {
      dspOutput = atmosphericDrift + infrasonicSignal * 0.9 + eventSignal;
    } else if (params.filterType === 'HIGH PASS') {
      dspOutput = infrasonicSignal + eventSignal + (electronicNoise * 0.9);
    }

    // Smooth filter transition
    this.prevFilterOut = 0.85 * this.prevFilterOut + 0.15 * dspOutput;

    // RMS & Noise estimate calculations
    const rmsEstimate = Math.sqrt(Math.pow(params.signalAmplitude * 0.707, 2) + Math.pow(params.noiseLevel, 2));
    const noiseEstimate = params.noiseLevel * 0.98;

    // Infrasonic Event Detector (Thresholding on instantaneous energy)
    const energy = Math.abs(dspOutput);
    if (energy > 5.0 || this.eventActive) {
      detectedEvent = {
        id: `ev-${Math.floor(this.t)}`,
        timestamp: Date.now(),
        status: energy > 6.0 ? 'SIGNAL DETECTED' : 'LOW-FREQUENCY DISTURBANCE',
        dominantFreq: this.eventActive ? 0.043 : params.primaryFrequency,
        peakAmplitude: Number(energy.toFixed(3)),
        bandEnergy: Number((energy * energy * 0.8).toFixed(3)),
        durationSec: Number(this.eventTimer.toFixed(1)) || 3.2,
        confidence: this.eventActive ? 0.92 : 0.74,
      };
    }

    return {
      rawPressure: Number(rawPressure.toFixed(3)),
      filteredPressure: Number(this.prevFilterOut.toFixed(3)),
      unfilteredWindPressure: Number(unfilteredWindPressure.toFixed(3)),
      thermalDriftPa: Number(thermalDriftPa.toFixed(3)),
      temperature: Number(this.temperature.toFixed(2)),
      rmsEstimate: Number(rmsEstimate.toFixed(2)),
      noiseEstimate: Number(noiseEstimate.toFixed(2)),
      event: detectedEvent,
    };
  }

  public reset(): void {
    this.t = 0;
    this.pinkNoiseState = 0;
    this.temperature = 28.6;
    this.eventActive = false;
    this.eventTimer = 0;
    this.prevFilterOut = 0;
  }
}

// Generate Frequency Points for Spectrum & PSD across 0.01 - 20 Hz
export function generateSpectrumData(params: SimulationParams, selectedBand: string = 'all'): FrequencyPoint[] {
  const points: FrequencyPoint[] = [];
  const minF = 0.01;
  const maxF = 20.0;
  const numPoints = 80;

  for (let i = 0; i < numPoints; i++) {
    // Logarithmic frequency progression
    const f = minF * Math.pow(maxF / minF, i / (numPoints - 1));

    // Determine frequency band
    let band: '0.01-0.1' | '0.1-1' | '1-10' | '10-20' = '0.01-0.1';
    if (f >= 0.1 && f < 1.0) band = '0.1-1';
    else if (f >= 1.0 && f < 10.0) band = '1-10';
    else if (f >= 10.0) band = '10-20';

    // 1/f atmospheric noise floor curve in dB/Hz
    let noiseFloor = -40 - 14 * Math.log10(f + 0.01);
    const noiseAdj = 20 * Math.log10(params.noiseLevel / 0.74);
    noiseFloor += noiseAdj;

    // Primary peak around primaryFrequency (0.043 Hz)
    let signalPower = -85;
    const df1 = Math.abs(f - params.primaryFrequency);
    const isDominant = df1 < params.primaryFrequency * 0.12;

    if (df1 < params.primaryFrequency * 0.3) {
      const peakVal = 20 * Math.log10(params.signalAmplitude / 0.05) - 28;
      const res = Math.exp(-Math.pow(df1 / (params.primaryFrequency * 0.07), 2));
      signalPower = Math.max(signalPower, peakVal * res);
    }

    // Multi-tone secondary peaks
    if (params.enableMultiTone) {
      const secondaryTones = [
        { freq: 0.015, ampRatio: 0.45 },
        { freq: 0.1, ampRatio: 0.35 },
        { freq: 0.45, ampRatio: 0.18 },
        { freq: 2.2, ampRatio: 0.08 },
      ];
      for (const t of secondaryTones) {
        const df = Math.abs(f - t.freq);
        if (df < t.freq * 0.2) {
          const peak = 20 * Math.log10((params.signalAmplitude * t.ampRatio) / 0.05) - 30;
          const res = Math.exp(-Math.pow(df / (t.freq * 0.08), 2));
          signalPower = Math.max(signalPower, peak * res);
        }
      }
    }

    // Total power
    const linearP = Math.pow(10, noiseFloor / 10) + Math.pow(10, signalPower / 10);
    const powerDb = 10 * Math.log10(linearP);
    const amp = Math.sqrt(linearP);

    points.push({
      frequency: Number(f.toFixed(3)),
      power: Number(powerDb.toFixed(2)),
      amplitude: Number(amp.toFixed(4)),
      band,
      isDominant,
    });
  }

  return points;
}
