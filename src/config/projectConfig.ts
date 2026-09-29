import { 
  ProjectConfig, 
  ComponentSpec, 
  CalibrationItem, 
  ValidationItem 
} from '../types';

export const initialProjectConfig: ProjectConfig = {
  projectName: "INFRASENSE",
  subtitle: "MEMS Infrasound Microbarometer",
  subText: "SIH26144 | NTRO | Prototype Instrument Interface",
  problemStatementId: "SIH26144",
  organization: "NTRO (National Technical Research Organisation)",
  frequencyMin: 0.01,
  frequencyMax: 20.0,
  targetPrototypeCostDisplay: "₹8,000 – ₹15,000 (Target Prototype Cost)",
  samplingRate: 50, // 50 Hz default
  sensorResolution: "0.01 Pa RMS (Target equivalent)",
  sensorRange: "±250 Pa to ±500 Pa (Differential)",
};

export const signalChainComponents: ComponentSpec[] = [
  {
    id: "atmosphere",
    name: "Atmosphere",
    category: "atmosphere",
    sensingPrinciple: "Ambient pressure + acoustic infrasonic waves + turbulent eddies",
    pressureRange: "101,325 ± 2,500 Pa ambient",
    interfaceType: "Acoustic open boundary layer",
    resolution: "Continuous atmospheric field",
    responseTime: "Speed of sound c ≈ 343 m/s",
    supplyVoltage: "N/A",
    temperatureCharacteristics: "-20°C to +50°C outdoor ambient",
    selectedComponent: "Outdoor Acoustic Pressure Field",
    notes: "Ambient pressure contains minute infrasonic fluctuations (0.01–20 Hz, 0.01–15 Pa) buried under ambient tides (1–3 kPa) and wind turbulence."
  },
  {
    id: "wind-noise",
    name: "Wind-Noise Reduction",
    category: "pneumatic",
    sensingPrinciple: "Spatial averaging via symmetrical multi-port porous hose array",
    pressureRange: "Suppresses turbulent pressure ~0.5·ρ·v² (10–50 Pa)",
    interfaceType: "4-arm radial manifold with sintered porous capillary lines",
    resolution: "15–22 dB turbulence suppression",
    responseTime: "< 2.5 ms acoustic transit time",
    supplyVoltage: "0 V (Passive pneumatic element)",
    temperatureCharacteristics: "UV-resistant, weatherproof PE / silicone",
    selectedComponent: "Quad-Arm Porous Hose Array (Hedlin Array)",
    notes: "Incoherent local wind eddies cancel out across the spatial array while coherent long-wavelength infrasonic wavefronts sum constructively."
  },
  {
    id: "pneumatic-conditioning",
    name: "Pneumatic Conditioning",
    category: "pneumatic",
    sensingPrinciple: "Acoustic RC high-pass filter with precision capillary leak and sealed reference volume",
    pressureRange: "±500 Pa differential across diaphragm with 100 kPa common-mode bypass",
    interfaceType: "0.8L thermally insulated aluminum reservoir + precision capillary needle",
    resolution: "Acoustic cutoff frequency fc ≈ 0.005 Hz (τ = RC ≈ 32 s)",
    responseTime: "Time constant τ > 30 s for reference volume",
    supplyVoltage: "0 V (Passive pneumatic network)",
    temperatureCharacteristics: "Insulated reference chamber (EPS + aluminum housing)",
    selectedComponent: "Acoustic RC Chamber (0.8L) + Capillary Leak",
    notes: "Prevents diurnal barometric weather shifts (1–3 kPa over hours) from driving the sensitive differential MEMS diaphragm into physical saturation."
  },
  {
    id: "mems-sensor",
    name: "MEMS Differential Pressure Sensor",
    category: "sensor",
    sensingPrinciple: "Piezoresistive / capacitive silicon micromachined differential diaphragm bridge",
    pressureRange: "±100 Pa to ±500 Pa differential",
    interfaceType: "Digital I2C / SPI or precision ratiometric analog",
    resolution: "0.005 Pa to 0.015 Pa equivalent RMS noise floor",
    responseTime: "< 5 ms (T90 response)",
    supplyVoltage: "3.3 V DC (ultra-low quiescent current < 3 mA)",
    temperatureCharacteristics: "Internal bandgap temperature sensor on silicon die",
    selectedComponent: "Sensirion SDP8xx / TE MS4525DO / NXP MP3V5004",
    datasheetUrl: "https://sensirion.com/products/catalog/SDP810-500Pa",
    notes: "Measures differential pressure ΔP between the external dynamic port and the equalized reference chamber."
  },
  {
    id: "signal-acquisition",
    name: "Signal Acquisition & AFE",
    category: "acquisition",
    sensingPrinciple: "Precision ultra-low noise instrumental amplifier + 24-bit Delta-Sigma ADC",
    pressureRange: "Differential ratiometric 0–3.3 V or SPI digital stream",
    interfaceType: "SPI @ 4 MHz with hardware DRDY interrupt pin",
    resolution: "24-bit resolution, ENOB > 19.5 bits, low 1/f corner",
    responseTime: "Conversion latency programmable (10–100 SPS)",
    supplyVoltage: "3.3 V from ultra-low noise LDO (LP5907, noise < 10 µV RMS)",
    temperatureCharacteristics: "0.05 ppm/°C ultra-low drift voltage reference",
    selectedComponent: "TI ADS1220 / ADS1256 (24-bit Low-Noise ADC)",
    datasheetUrl: "https://www.ti.com/product/ADS1220",
    notes: "Keeps electronic quantization noise far below the MEMS transducer thermal noise floor."
  },
  {
    id: "stm32",
    name: "STM32 Embedded MCU",
    category: "mcu",
    sensingPrinciple: "ARM 32-bit Cortex-M4 with hardware Floating Point Unit (FPU)",
    pressureRange: "N/A (Firmware controller)",
    interfaceType: "Timer-triggered DMA over SPI/I2C, USB-VCP, UART",
    resolution: "Single-precision 32-bit IEEE 754 floating-point calculations",
    responseTime: "Deterministic sample jitter < 1 µs",
    supplyVoltage: "3.3 V DC @ 84–100 MHz clock",
    temperatureCharacteristics: "Industrial -40°C to +85°C",
    selectedComponent: "STM32F401RE / STM32F411CE BlackPill (Cortex-M4)",
    datasheetUrl: "https://www.st.com/en/microcontrollers-microprocessors/stm32f401re.html",
    notes: "Controls precise 50 Hz timer acquisition, buffers circular sample frames, and streams telemetry packets."
  },
  {
    id: "digital-dsp",
    name: "Digital Signal Processing (DSP)",
    category: "dsp",
    sensingPrinciple: "Zero-phase 4th-order Butterworth bandpass (0.01–20 Hz) + Welch PSD + DC removal",
    pressureRange: "Calculated in firmware / Web engine",
    interfaceType: "Internal pipeline buffers",
    resolution: "Floating-point precision, no phase distortion",
    responseTime: "Real-time per-sample filter execution (< 15 µs)",
    supplyVoltage: "Embedded in STM32 / Host UI",
    temperatureCharacteristics: "Real-time thermal polynomial drift compensation",
    selectedComponent: "ARM CMSIS-DSP Library (FIR/IIR & RFFT)",
    notes: "Filters diurnal baseline wander and high-frequency acoustic noise while extracting dominant infrasonic frequency peaks."
  },
  {
    id: "usb-serial",
    name: "USB / Serial Telemetry",
    category: "serial",
    sensingPrinciple: "USB Virtual COM Port (VCP) or UART at 115200 baud streaming formatted packets",
    pressureRange: "Telemetry link",
    interfaceType: "USB 2.0 Full Speed / WebSocket bridge",
    resolution: "16/32-bit binary or JSON formatted packets",
    responseTime: "< 2 ms packet latency",
    supplyVoltage: "5 V USB VBUS with onboard 3.3V regulation",
    temperatureCharacteristics: "Standard USB interface",
    selectedComponent: "USB-VCP / Local Node.js WebSocket Bridge",
    notes: "Provides the physical communication link between STM32 hardware and the browser application."
  },
  {
    id: "infrasense-ui",
    name: "INFRASENSE UI",
    category: "ui",
    sensingPrinciple: "Single-page real-time prototype monitoring instrument interface",
    pressureRange: "Full differential display: ±0.01 to ±500 Pa",
    interfaceType: "Web interface (React + TypeScript + Canvas/Recharts)",
    resolution: "Continuous 50 Hz display update with autoscale & PSD tracking",
    responseTime: "Frame rate: 30–60 FPS",
    supplyVoltage: "Web Client",
    temperatureCharacteristics: "Responsive Dark / Light instrument theme",
    selectedComponent: "INFRASENSE Web Instrument Interface",
    notes: "Digital oscilloscope, spectrum analyzer, and environmental sensor dashboard for prototype operation."
  }
];

export const initialCalibrationItems: CalibrationItem[] = [
  {
    id: "cal-offset",
    parameter: "Sensor Offset (Zero ΔP)",
    value: "+0.12",
    unit: "mV",
    status: "TARGET",
    notes: "Zero-differential pressure electrical offset of the bridge before zero-trim."
  },
  {
    id: "cal-sensitivity",
    parameter: "Sensor Sensitivity",
    value: "8.50",
    unit: "mV/Pa",
    status: "TARGET",
    notes: "Transduction transfer slope (ΔV/ΔP) calibrated via low-frequency acoustic reference."
  },
  {
    id: "cal-temp-coeff",
    parameter: "Temperature Coefficient",
    value: "0.082",
    unit: "Pa/°C",
    status: "AWAITING MEASUREMENT" as any,
    notes: "Linear temperature drift factor used for real-time polynomial compensation."
  },
  {
    id: "cal-freq-resp",
    parameter: "Frequency Response Band",
    value: "0.01 – 20.0",
    unit: "Hz (±1.5 dB)",
    status: "TARGET",
    notes: "Flat passband region determined by pneumatic RC cutoff and digital FIR filter."
  },
  {
    id: "cal-noise-floor",
    parameter: "Sensor Noise Floor",
    value: "< 0.020",
    unit: "Pa RMS",
    status: "SIMULATED",
    notes: "Quiescent baseline noise integrated across the 0.01–20 Hz band."
  }
];

export const initialValidationItems: ValidationItem[] = [
  {
    id: "val-1",
    title: "Sensor communication",
    status: "complete",
    category: "Interface",
    note: "I2C/SPI bus readouts verified with continuous streaming."
  },
  {
    id: "val-2",
    title: "Temperature measurement",
    status: "complete",
    category: "Transducer",
    note: "High-resolution 16-bit thermal transducer operational (±0.1°C accuracy)."
  },
  {
    id: "val-3",
    title: "Sensitivity characterization",
    status: "pending",
    category: "Acoustics",
    note: "Awaiting pistonphone / low-frequency acoustic calibration chamber tests."
  },
  {
    id: "val-4",
    title: "Noise floor measurement",
    status: "in_progress",
    category: "Spectral",
    note: "Quiescent chamber testing in progress; target < 0.02 Pa RMS."
  },
  {
    id: "val-5",
    title: "Frequency response (0.01–20 Hz)",
    status: "pending",
    category: "Bandwidth",
    note: "Awaiting swept sinusoidal acoustic response verification."
  },
  {
    id: "val-6",
    title: "Temperature compensation",
    status: "in_progress",
    category: "Algorithms",
    note: "Thermal drift polynomial coefficients under test across 10°C–40°C chamber range."
  },
  {
    id: "val-7",
    title: "Wind-noise reduction",
    status: "pending",
    category: "Pneumatics",
    note: "Outdoor comparative tests with 4-arm porous array vs. bare port pending."
  },
  {
    id: "val-8",
    title: "Long-term stability (24-Hour)",
    status: "pending",
    category: "Reliability",
    note: "24-hour continuous baseline recording run scheduled after enclosure sealing."
  }
];
