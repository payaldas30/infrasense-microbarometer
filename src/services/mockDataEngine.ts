import { FrequencyPoint, InfrasoundEvent } from '../types';

export interface SimulationParams {
  signalAmplitude: number; // in Pa (e.g., 0.05 to 0.5 Pa)
  primaryFrequency: number; // in Hz (e.g., 0.08 Hz)
  enableMultiTone: boolean; // 0.015, 0.04, 0.1, 0.5, 2 Hz
  noiseLevel: number; // in Pa RMS (e.g., 0.01 to 0.08 Pa)
  windTurbulence: number; // 0 to 1 scale
  windFilterEnabled: boolean; // if true, reduces wind turbulence by ~18 dB
  temperatureDrift: number; // °C/hour
  injectEvent: boolean;
  eventMagnitude: number; // Pa
}

export const defaultSimParams: SimulationParams = {
  signalAmplitude: 0.065,
  primaryFrequency: 0.08,
  enableMultiTone: true,
  noiseLevel: 0.014,
  windTurbulence: 0.25,
  windFilterEnabled: true,
  temperatureDrift: 0.15,
  injectEvent: false,
  eventMagnitude: 0.35,
};

// Box-Muller Gaussian random generator
export function gaussianRandom(mean = 0, stdev = 1): number {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

// Infrasound Physics-Based Signal Generator
export class InfrasoundSimulator {
  private t: number = 0; // seconds elapsed
  private baselinePressure: number = 0.0; // Pa
  private pinkNoiseState: number = 0;
  private temperature: number = 24.5; // °C
  private eventTimer: number = 0;
  private eventActive: boolean = false;

  constructor() {}

  public step(dt: number, params: SimulationParams): {
    rawPressure: number;
    filteredPressure: number;
    temperature: number;
    rmsEstimate: number;
    noiseEstimate: number;
    event?: InfrasoundEvent;
  } {
    this.t += dt;

    // 1. Slow Diurnal / Barometric Baseline Drift (0.0005 Hz)
    const diurnalDrift = 0.03 * Math.sin(2 * Math.PI * 0.0005 * this.t);

    // 2. 1/f Pink Noise generator (common in microbarometric atmosphere)
    const white = gaussianRandom(0, 1);
    this.pinkNoiseState = 0.95 * this.pinkNoiseState + 0.05 * white;
    const atmosphericFlicker = this.pinkNoiseState * (params.noiseLevel * 0.8);

    // 3. Multi-tone Infrasound Signal Synthesis (0.01 to 20 Hz)
    let infrasoundComponent = 0;
    if (params.enableMultiTone) {
      // Realistic infrasound spectrum: microbaroms (0.15-0.3 Hz), acoustic-gravity (0.015-0.04 Hz), mountain wave (0.08 Hz), local machinery/fan (2.0 Hz)
      infrasoundComponent += (params.signalAmplitude * 0.7) * Math.sin(2 * Math.PI * params.primaryFrequency * this.t);
      infrasoundComponent += (params.signalAmplitude * 0.4) * Math.sin(2 * Math.PI * 0.018 * this.t + 0.5);
      infrasoundComponent += (params.signalAmplitude * 0.3) * Math.sin(2 * Math.PI * 0.22 * this.t + 1.2);
      infrasoundComponent += (params.signalAmplitude * 0.15) * Math.sin(2 * Math.PI * 0.85 * this.t + 2.1);
      infrasoundComponent += (params.signalAmplitude * 0.08) * Math.sin(2 * Math.PI * 2.4 * this.t + 0.3);
    } else {
      infrasoundComponent = params.signalAmplitude * Math.sin(2 * Math.PI * params.primaryFrequency * this.t);
    }

    // 4. Wind Turbulence (dynamic pressure ~ 0.5 * rho * v^2)
    // Wind bursts occur with low frequency intermittency
    const windBursts = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 0.03 * this.t) + 0.3 * Math.cos(2 * Math.PI * 0.07 * this.t)), 2);
    let windNoise = windBursts * (params.windTurbulence * 0.12) * gaussianRandom(0, 1);
    
    // Wind filter suppression (porous hose reduces turbulence by ~18 dB => factor of ~8)
    if (params.windFilterEnabled) {
      windNoise *= 0.14; 
    }

    // 5. Electronic & Sensor ADC Noise (White Gaussian)
    const sensorWhiteNoise = gaussianRandom(0, params.noiseLevel * 0.5);

    // 6. Injected Transient Infrasonic Event (e.g. supersonic boom, bolide, distant explosion)
    let transientSignal = 0;
    let detectedEvent: InfrasoundEvent | undefined;

    if (params.injectEvent || this.eventActive) {
      if (!this.eventActive) {
        this.eventActive = true;
        this.eventTimer = 0;
      }
      this.eventTimer += dt;
      // N-wave or damped sinusoidal packet of duration ~ 8 seconds
      const eventFreq = 0.4; // 0.4 Hz wavelet
      const envelope = Math.exp(-Math.pow((this.eventTimer - 4) / 1.8, 2));
      transientSignal = params.eventMagnitude * envelope * Math.sin(2 * Math.PI * eventFreq * this.eventTimer);

      if (this.eventTimer > 10) {
        this.eventActive = false;
        this.eventTimer = 0;
      }
    }

    // 7. Combined Raw Differential Pressure (what raw sensor + ADC samples)
    const rawPressure = diurnalDrift + infrasoundComponent + atmosphericFlicker + windNoise + sensorWhiteNoise + transientSignal;

    // 8. Digital Bandpass Filtered Output (0.01 - 20 Hz rejection of diurnal tides & high-freq jitter)
    // In our simulation, the bandpass removes the DC/diurnal drift and high-freq white noise
    const filteredPressure = infrasoundComponent + transientSignal + (windNoise * 0.5) + (sensorWhiteNoise * 0.35);

    // 9. Temperature Evolution with Ambient Drift + thermal noise
    this.temperature += (params.temperatureDrift / 3600) * dt + gaussianRandom(0, 0.001);

    // 10. Metric Estimates
    const rmsEstimate = Math.sqrt(Math.pow(params.signalAmplitude * 0.707, 2) + Math.pow(params.noiseLevel, 2));
    const noiseEstimate = params.noiseLevel * (params.windFilterEnabled ? 0.8 : 1.9);

    // Event rule-based detection
    const instantaneousEnergy = Math.abs(rawPressure);
    if (instantaneousEnergy > 0.25 || this.eventActive) {
      detectedEvent = {
        id: `ev-${Math.floor(this.t)}`,
        timestamp: Date.now(),
        status: instantaneousEnergy > 0.35 ? 'POSSIBLE EVENT' : 'LOW-FREQUENCY DISTURBANCE',
        dominantFreq: this.eventActive ? 0.4 : params.primaryFrequency,
        peakAmplitude: Math.abs(rawPressure),
        durationSec: this.eventActive ? this.eventTimer : 2.5,
        confidence: this.eventActive ? 0.88 : 0.65,
      };
    }

    return {
      rawPressure: Number(rawPressure.toFixed(5)),
      filteredPressure: Number(filteredPressure.toFixed(5)),
      temperature: Number(this.temperature.toFixed(2)),
      rmsEstimate: Number(rmsEstimate.toFixed(5)),
      noiseEstimate: Number(noiseEstimate.toFixed(5)),
      event: detectedEvent,
    };
  }

  public reset(): void {
    this.t = 0;
    this.baselinePressure = 0;
    this.pinkNoiseState = 0;
    this.temperature = 24.5;
    this.eventActive = false;
    this.eventTimer = 0;
  }
}

// Compute Power Spectral Density (PSD) across 0.01 - 20 Hz
export function generatePSD(params: SimulationParams): FrequencyPoint[] {
  const points: FrequencyPoint[] = [];
  
  // Frequency bins log-spaced from 0.01 Hz to 20 Hz
  const minF = 0.01;
  const maxF = 20.0;
  const numBins = 75;

  for (let i = 0; i < numBins; i++) {
    // Logarithmic frequency progression
    const f = minF * Math.pow(maxF / minF, i / (numBins - 1));
    
    // Theoretical 1/f atmospheric noise floor curve (high power at 0.01 Hz, decaying toward 10 Hz)
    // PSD baseline in dB/Hz (re 1 Pa^2/Hz)
    // Atmospheric noise typically -30 dB at 0.01 Hz down to -65 dB at 5 Hz
    let noiseFloor = -45 - 12 * Math.log10(f + 0.01);
    
    // Adjust noise floor by user noise level
    const noiseCorrection = 20 * Math.log10(params.noiseLevel / 0.014);
    noiseFloor += noiseCorrection;

    // If wind filter disabled, severe bump around 0.05 - 1 Hz
    if (!params.windFilterEnabled) {
      if (f >= 0.03 && f <= 2.0) {
        noiseFloor += 18 * Math.exp(-Math.pow(Math.log10(f / 0.2), 2));
      }
    }

    // Infrasound signal peaks
    let signalPower = -90; // below noise floor
    
    // Primary frequency peak
    const df1 = Math.abs(f - params.primaryFrequency);
    if (df1 < params.primaryFrequency * 0.25) {
      const peakAmp = 20 * Math.log10(params.signalAmplitude / 0.001) - 40;
      const resonance = Math.exp(-Math.pow(df1 / (params.primaryFrequency * 0.08), 2));
      signalPower = Math.max(signalPower, peakAmp * resonance);
    }

    // Secondary multi-tone peaks if enabled
    if (params.enableMultiTone) {
      const secondaryPeaks = [
        { freq: 0.018, ampRatio: 0.5 },
        { freq: 0.22, ampRatio: 0.4 },
        { freq: 0.85, ampRatio: 0.25 },
        { freq: 2.4, ampRatio: 0.15 },
      ];

      for (const p of secondaryPeaks) {
        const df = Math.abs(f - p.freq);
        if (df < p.freq * 0.2) {
          const peakAmp = 20 * Math.log10((params.signalAmplitude * p.ampRatio) / 0.001) - 40;
          const resonance = Math.exp(-Math.pow(df / (p.freq * 0.08), 2));
          signalPower = Math.max(signalPower, peakAmp * resonance);
        }
      }
    }

    // Total power = 10*log10( 10^(noise/10) + 10^(signal/10) )
    const totalPowerLinear = Math.pow(10, noiseFloor / 10) + Math.pow(10, signalPower / 10);
    const totalPowerDb = 10 * Math.log10(totalPowerLinear);
    const approxAmplitude = Math.sqrt(totalPowerLinear);

    points.push({
      frequency: Number(f.toFixed(3)),
      power: Number(totalPowerDb.toFixed(2)),
      amplitude: Number(approxAmplitude.toFixed(5)),
    });
  }

  return points;
}
