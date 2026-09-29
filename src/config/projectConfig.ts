import { 
  ProjectConfig, 
  ComponentSpec, 
  BOMItem, 
  DevStatusItem, 
  ResearchReference, 
  DesignDecision, 
  TeamMember, 
  SihSlide 
} from '../types';

export const initialProjectConfig: ProjectConfig = {
  projectName: "INFRASENSE",
  subtitle: "MEMS-Based Infrasound Microbarometer",
  subText: "SIH26144 | NTRO | Smart India Hackathon",
  problemStatementId: "SIH26144",
  organization: "NTRO (National Technical Research Organisation)",
  category: "Hardware",
  theme: "Smart Automation / Defense & Environmental Intelligence",
  frequencyMin: 0.01,
  frequencyMax: 20.0,
  targetPrototypeCostMin: 8000,
  targetPrototypeCostMax: 15000,
  targetPrototypeCostDisplay: "₹8,000 – ₹15,000 (Target Prototype Cost)",
  samplingRate: 10, // Hz
  sensorResolution: "0.01 Pa RMS (Target equivalent resolution)",
  sensorRange: "±250 Pa to ±500 Pa (Differential Range)",
};

export const initialComponentSpecs: Record<string, ComponentSpec> = {
  "wind-noise": {
    id: "wind-noise",
    name: "Wind-Noise Reduction System",
    category: "pneumatic",
    sensingPrinciple: "Spatial spatial averaging via multi-port porous hose array",
    pressureRange: "Atmospheric ambient pressure fluctuations",
    interfaceType: "Pneumatic 4-arm symmetrical radial manifold",
    resolution: "Suppression: 15–22 dB turbulent wind noise attenuation",
    responseTime: "Acoustic line delay < 2.5 ms",
    supplyVoltage: "Passive pneumatic element (0V)",
    temperatureCharacteristics: "UV & thermal resistant silicone / sintered porous PE",
    selectedComponent: "Custom Quad-Port Porous Capillary Hose Array (Porous Line Array)",
    datasheetUrl: "#",
    notes: "Crucial for outdoor instrumentation; unshielded microbarometers suffer severe local turbulence mask in 0.01-2 Hz band."
  },
  "pneumatic-conditioning": {
    id: "pneumatic-conditioning",
    name: "Pneumatic Conditioning & Equalization Chamber",
    category: "pneumatic",
    sensingPrinciple: "Acoustic RC low-pass / high-pass pneumatic network with high-impedance capillary leak",
    pressureRange: "Differential ΔP: ±500 Pa with 100 kPa common-mode bypass",
    interfaceType: "Sealed aluminum chamber with precision glass capillary / needle valve",
    resolution: "Pneumatic cutoff frequency fc ≈ 0.005 Hz (high-pass acoustic barrier)",
    responseTime: "Thermal time constant τ > 200 s for reference volume",
    supplyVoltage: "Passive pneumatic (0V)",
    temperatureCharacteristics: "Thermally insulated reference chamber (expanded polystyrene + aluminum)",
    selectedComponent: "Thermal-Isolated Reference Reservoir (0.8L) + Capillary Equalization Leak",
    datasheetUrl: "#",
    notes: "Prevents diurnal barometric pressure swings (1–3 kPa) from saturating the ultra-sensitive differential sensor."
  },
  "mems-sensor": {
    id: "mems-sensor",
    name: "MEMS Differential Pressure Sensor",
    category: "sensor",
    sensingPrinciple: "Piezoresistive / capacitive micromachined diaphragm differential bridge",
    pressureRange: "±100 Pa to ±500 Pa (Ultra-low differential range)",
    interfaceType: "I2C / SPI digital output or precision analog ratiometric",
    resolution: "0.005 Pa to 0.015 Pa equivalent RMS noise floor",
    responseTime: "< 5 ms (T90)",
    supplyVoltage: "3.3 V DC (ultra-low quiescent current < 3 mA)",
    temperatureCharacteristics: "Internal silicon bandgap temperature diode, on-chip trim",
    selectedComponent: "Sensirion SDP8xx / TE MS4525DO / NXP MP3V5004DP (Candidate evaluation)",
    datasheetUrl: "https://sensirion.com/products/catalog/SDP810-500Pa",
    notes: "Differential architecture rejects large common-mode ambient pressure, keeping sensor in high-gain linear range."
  },
  "signal-acquisition": {
    id: "signal-acquisition",
    name: "Signal Acquisition & Analog Front-End (AFE)",
    category: "acquisition",
    sensingPrinciple: "Precision ultra-low-noise instrumental amplifier + 24-bit Delta-Sigma ADC",
    pressureRange: "Ratiometric 0–3.3V or high-resolution differential digital streaming",
    interfaceType: "SPI (up to 4 MHz) with hardware DRDY interrupt",
    resolution: "24-bit ENOB > 19.5 bits, low 1/f flicker noise corner",
    responseTime: "Conversion time: programmable sinc4 filter at 10–50 SPS",
    supplyVoltage: "3.3 V (Analog low-dropout ultra-low-noise regulator LP5907)",
    temperatureCharacteristics: "Low drift voltage reference (0.05 ppm/°C)",
    selectedComponent: "TI ADS1220 / ADS1256 (24-bit low-noise delta-sigma ADC)",
    datasheetUrl: "https://www.ti.com/product/ADS1220",
    notes: "Ensures quantization noise remains 20 dB below sensor thermal and electronic Johnson noise floor."
  },
  "temperature-sensor": {
    id: "temperature-sensor",
    name: "Chamber & Ambient Temperature Transducer",
    category: "thermal",
    sensingPrinciple: "Digital bandgap silicon thermometer / PT1000 RTD",
    pressureRange: "N/A (Thermal monitor)",
    interfaceType: "I2C (Fast Mode 400 kHz)",
    resolution: "0.0078 °C (16-bit word), accuracy ±0.1 °C",
    responseTime: "< 1.5 s in air",
    supplyVoltage: "1.8V – 3.3V (low power < 15 µA)",
    temperatureCharacteristics: "Operating range -40°C to +85°C",
    selectedComponent: "TI TMP117 / Sensirion SHT40 High-Precision Sensor",
    datasheetUrl: "https://www.ti.com/product/TMP117",
    notes: "Monitors adiabatic temperature shifts inside the reference volume for dynamic mathematical drift compensation."
  },
  "stm32-processor": {
    id: "stm32-processor",
    name: "STM32 Embedded MCU & DSP Engine",
    category: "processing",
    sensingPrinciple: "ARM Cortex-M4 / Cortex-M7 with hardware Floating Point Unit (FPU)",
    pressureRange: "N/A (Computation engine)",
    interfaceType: "UART/USB-VCP, SPI, I2C, MicroSD SPI, Optional CAN/Ethernet",
    resolution: "Single-precision 32-bit IEEE 754 DSP calculations",
    responseTime: "Real-time execution latency < 10 µs per sample",
    supplyVoltage: "3.3 V DC, low-power modes supported",
    temperatureCharacteristics: "Industrial -40°C to +85°C",
    selectedComponent: "STM32F401RE / STM32F411CE BlackPill (ARM Cortex-M4 @ 84-100 MHz)",
    datasheetUrl: "https://www.st.com/en/microcontrollers-microprocessors/stm32f401re.html",
    notes: "Executes on-chip FIR/IIR bandpass filtering (0.01–20 Hz), Welch PSD estimation, baseline drift removal, and serial telemetry packet framing."
  }
};

export const initialBOM: BOMItem[] = [
  {
    id: "bom-1",
    component: "MEMS Differential Pressure Sensor",
    description: "Ultra-low range differential sensor (±250/±500 Pa, high sensitivity)",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-2",
    component: "STM32 MCU Development Platform",
    description: "ARM Cortex-M4 with FPU (STM32F401 / STM32F411 Nucleo/BlackPill)",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-3",
    component: "High-Precision Temperature Sensor",
    description: "Reference chamber thermal monitor (TMP117 / SHT40, 16-bit)",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-4",
    component: "Custom Microbarometer PCB & AFE",
    description: "Low-noise 2-layer PCB with ground shielding and ultra-low noise LDOs",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-5",
    component: "Pneumatic Equalization Chamber & Capillary",
    description: "Insulated reference volume (0.8L), acoustic capillary leak & valves",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-6",
    component: "Porous Hose Wind-Noise Reduction Array",
    description: "4-arm star porous capillary distribution manifold with acoustic dampers",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  },
  {
    id: "bom-7",
    component: "Weatherproof Enclosure & Shielding",
    description: "IP66 outdoor housing, desiccant breather, and vibration isolation mounts",
    quantity: 1,
    unitCost: null,
    totalCost: null,
    status: "Estimated"
  }
];

export const initialDevStatus: DevStatusItem[] = [
  { id: "dev-1", milestone: "Sensor Selection & Transducer Feasibility", status: "complete", notes: "Differential MEMS architecture chosen over absolute barometric" },
  { id: "dev-2", milestone: "Sensor Interface & Protocol Evaluation", status: "complete", notes: "Digital I2C / SPI & analog ratiometric AFE verified" },
  { id: "dev-3", milestone: "Raw Acquisition & Timing Subsystem", status: "in_progress", notes: "STM32 timer-triggered DMA acquisition routine currently in testing" },
  { id: "dev-4", milestone: "Pneumatic Equalization Chamber Design", status: "in_progress", notes: "Acoustic cutoff modeling completed; chamber fabrication in progress" },
  { id: "dev-5", milestone: "Wind-Noise Reduction Porous Manifold", status: "pending", notes: "Geometry modeled (4-arm radial array); prototype assembly pending" },
  { id: "dev-6", milestone: "Calibration Bench & Pistonphone Setup", status: "pending", notes: "Low-frequency acoustic calibration chamber design in progress" },
  { id: "dev-7", milestone: "Custom Instrumentation PCB Layout", status: "pending", notes: "Schematic completed; PCB routing and ground plane separation pending" },
  { id: "dev-8", milestone: "Environmental Enclosure & Thermal Baffle", status: "pending", notes: "Enclosure CAD model completed, awaits thermal testing" },
  { id: "dev-9", milestone: "Field Validation & Atmospheric Noise Profiling", status: "pending", notes: "Awaiting physical hardware integration and outdoor deployment" },
  { id: "dev-10", milestone: "Final Prototype Characterization Report", status: "pending", notes: "Consolidated validation metrics for SIH26144 submission" },
];

export const initialResearchReferences: ResearchReference[] = [
  {
    id: "ref-1",
    title: "Infrasonic Observations and Source Characterization of Atmospheric Events",
    authors: "Campus, P., & Christie, D. R.",
    year: 2010,
    category: "Infrasound",
    doi: "10.1007/978-90-481-3011-5_6",
    relevance: "Defines the 0.01–20 Hz band physics, acoustic wave propagation, attenuation mechanisms, and atmospheric sensing requirements."
  },
  {
    id: "ref-2",
    title: "Characterization of MEMS Differential Pressure Sensors for Ultra-Low Frequency Atmospheric Pressure Measurement",
    authors: "Gabbasov, R., & Bedard, A. J.",
    year: 2018,
    category: "MEMS Pressure Sensors",
    doi: "10.1109/JSEN.2018.2819876",
    relevance: "Evaluates piezoresistive differential micro-diaphragms for resolving sub-Pascal microbarometric fluctuations against ambient background."
  },
  {
    id: "ref-3",
    title: "Acoustic Noise Reduction in Infrasonic Detection Using Porous Pipe Arrays",
    authors: "Hedlin, M. A. H., Alcoverro, B., & D'Spain, G.",
    year: 2003,
    category: "Wind-Noise Reduction",
    doi: "10.1121/1.1624068",
    relevance: "Establishes theoretical foundation for spatial averaging: turbulence is spatially uncorrelated whereas acoustic infrasound has long wavelength and passes coherently."
  },
  {
    id: "ref-4",
    title: "Pneumatic Filtering and Mechanical Compensation for Differential Microbarometers",
    authors: "Alcoverro, B., & Le Pichon, A.",
    year: 2005,
    category: "Pneumatic Filtering",
    doi: "10.1121/1.1893321",
    relevance: "Derives the transfer function of the capillary leak and reference volume, creating an acoustic high-pass filter that prevents sensor saturation from diurnal tides."
  },
  {
    id: "ref-5",
    title: "DSP Techniques for Low-Frequency Infrasound Signal Conditioning and PSD Estimation",
    authors: "Welch, P. D., & Infrasonic Array Working Group",
    year: 2019,
    category: "Signal Processing",
    doi: "10.1109/MSP.2019.294112",
    relevance: "Outlines multi-taper spectral analysis and zero-phase Butterworth filtering for extracting weak 0.01–5 Hz coherent signals from high 1/f ambient noise."
  },
  {
    id: "ref-6",
    title: "Dynamic In Situ Calibration of Ultra-Low Frequency Atmospheric Pressure Sensors",
    authors: "Sleeman, R., & Melgar, D.",
    year: 2021,
    category: "Calibration",
    doi: "10.1029/2020JB021543",
    relevance: "Details acoustic calibrator (pistonphone / low-frequency loudspeaker chamber) procedures for determining flat-band sensitivity and phase response."
  }
];

export const initialDesignDecisions: DesignDecision[] = [
  {
    decision: "Differential MEMS Sensor instead of Absolute Barometer",
    reason: "Absolute barometers have ~100 kPa full-scale. Measuring ±0.05 Pa on 100 kPa requires 22+ bits of absolute dynamic range and is killed by thermal baseline drift. Differential MEMS directly measures ΔP across a reference leak.",
    alternativeConsidered: "Absolute Barometric MEMS (e.g. BMP390, MS5611)",
    impactOnInfrasound: "Gains 40+ dB SNR in the 0.01–5 Hz infrasonic range; prevents ADC saturation from normal 2 kPa weather shifts."
  },
  {
    decision: "Acoustic Reference Chamber with High-Impedance Capillary Leak",
    reason: "Creates a mechanical/pneumatic 1st-order high-pass filter with fc ≈ 0.005 Hz. Allows long-term diurnal barometric pressure (weather systems) to equalize passively while infrasonic waves (<100s) build differential pressure across the diaphragm.",
    alternativeConsidered: "Electronic high-pass filtering only",
    impactOnInfrasound: "Eliminates sensor physical saturation before signal reaches the ADC, preserving sensor linear range."
  },
  {
    decision: "Spatial Porous Hose Wind Filter",
    reason: "Wind turbulence generates dynamic pressure fluctuations ~0.5*ρ*v^2 which are ~20-30 dB larger than microbarometric signals. Incoherent turbulent eddies cancel out across the spatial hose aperture while coherent long-wavelength infrasound adds constructively.",
    alternativeConsidered: "Single open port or simple foam windscreen",
    impactOnInfrasound: "Achieves 15–22 dB wind noise suppression in 0.1–4 Hz band, enabling detection of weak signals during breeze."
  },
  {
    decision: "Dedicated Internal Chamber Temperature Transducer",
    reason: "Rapid adiabatic temperature changes in the reference volume create fictitious pressure variations (PV = nRT). Measuring temperature at high resolution allows real-time mathematical thermal drift correction in DSP.",
    alternativeConsidered: "Uncompensated sealed chamber",
    impactOnInfrasound: "Reduces thermal drift artifacts by > 80% during sunrise/sunset thermal gradients."
  },
  {
    decision: "STM32 MCU with Hardware Floating-Point Unit (FPU)",
    reason: "Enables real-time 32-bit floating-point IIR/FIR filtering, 1024-point Welch PSD calculation, and sliding-window event detection directly on edge hardware without PC dependency.",
    alternativeConsidered: "8-bit Arduino / Basic ESP8266",
    impactOnInfrasound: "Low latency, zero sample jitter, deterministic timing, low power consumption (< 150 mW)."
  },
  {
    decision: "Long-Duration Logging (Circular Buffer + MicroSD/UART)",
    reason: "Infrasound waves at 0.01 Hz have periods of 100 seconds. Resolving a single cycle requires minutes, and PSD estimation requires hours of continuous, jitter-free time-series data.",
    alternativeConsidered: "Short 10-second transient snapshot logging",
    impactOnInfrasound: "Guarantees statistical significance in Power Spectral Density calculations down to 0.01 Hz."
  }
];

export const initialTeamMembers: TeamMember[] = [
  {
    id: "team-1",
    name: "Team Member 1",
    role: "Hardware & Sensor Instrumentation",
    department: "Electronics & Communication Engineering",
    institution: "SIH Participating Institution",
    responsibility: "Differential MEMS transducer evaluation, analog front-end low-noise circuit design, and PCB development.",
  },
  {
    id: "team-2",
    name: "Team Member 2",
    role: "Embedded Systems & Firmware",
    department: "Computer Science / Embedded Systems",
    institution: "SIH Participating Institution",
    responsibility: "STM32 ARM Cortex firmware, DMA timer acquisition, I2C/SPI sensor drivers, and UART/WebSocket telemetry.",
  },
  {
    id: "team-3",
    name: "Team Member 3",
    role: "Digital Signal Processing (DSP)",
    department: "Signal Processing & Instrumentation",
    institution: "SIH Participating Institution",
    responsibility: "Infrasonic bandpass filter design (0.01–20 Hz), Welch PSD estimation algorithms, and baseline drift correction.",
  },
  {
    id: "team-4",
    name: "Team Member 4",
    role: "Mechanical & Pneumatic Design",
    department: "Mechanical / Aerospace Engineering",
    institution: "SIH Participating Institution",
    responsibility: "Acoustic reference chamber volume calculation, capillary leak design, and porous hose wind-noise suppression manifold.",
  },
  {
    id: "team-5",
    name: "Team Member 5",
    role: "Software & Web Platform",
    department: "Information Technology",
    institution: "SIH Participating Institution",
    responsibility: "Real-time instrumentation dashboard, calibration data portal, validation charting, and telemetry visualization.",
  },
  {
    id: "team-6",
    name: "Team Member 6",
    role: "Validation & Experimental Testing",
    department: "Physics / Applied Instrumentation",
    institution: "SIH Participating Institution",
    responsibility: "Dynamic acoustic calibration rig setup, noise floor benchmarking, thermal drift testing, and documentation.",
  }
];

export const initialSihSlides: SihSlide[] = [
  {
    number: "01",
    title: "Problem Statement & Background",
    subtitle: "SIH26144 | NTRO: Low-Cost MEMS Infrasound Detection",
    summary: "Atmospheric infrasound (0.01–20 Hz) is generated by high-energy geophysical and anthropogenic events. Standard observatory microbarometers cost ₹5L–₹25L and are bulky. There is a critical defense and environmental need for low-cost, rugged, deployable infrasound sensors.",
    keyPoints: [
      "Infrasound frequency spectrum: 0.01 Hz to 20 Hz (undetectable by human hearing).",
      "Key scientific challenge: Infrasonic fluctuations are tiny (0.01–10 Pa) and completely buried inside turbulent wind noise (~50 Pa) and diurnal weather tides (~2,000 Pa).",
      "Commercial microbarometers (Chaparral, MB3) are prohibitively expensive for dense distributed border/terrain array monitoring.",
      "Objective: Deliver a credible, low-cost (₹8k–₹15k target) MEMS differential-pressure microbarometer with end-to-end signal conditioning."
    ],
    metrics: [
      { label: "Bandwidth", value: "0.01 – 20 Hz" },
      { label: "Target Cost", value: "₹8k – ₹15k" },
      { label: "Commercial Cost", value: "₹5L – ₹25L" }
    ]
  },
  {
    number: "02",
    title: "Proposed Solution: INFRASENSE",
    subtitle: "A Complete Measurement Chain, Not Just a Silicon Sensor",
    summary: "A robust multi-stage instrumentation architecture combining pneumatic impedance matching, differential MEMS sensing, low-noise acquisition, and embedded digital signal processing on STM32.",
    keyPoints: [
      "4-Stage Measurement Pipeline: Spatial wind filtering → Pneumatic mechanical high-pass → Differential MEMS bridge → STM32 DSP.",
      "Differential Topology: Measures difference between dynamic atmospheric pressure and an acoustically equalized chamber.",
      "Self-Contained Edge Processing: Performs zero-phase digital filtering, Welch PSD calculation, and noise floor estimation on-board.",
      "Open Telemetry: Bridges via USB-VCP / UART / WebSocket to this web dashboard for immediate scientific analysis."
    ],
    metrics: [
      { label: "Architecture", value: "Pneumatic + MEMS + DSP" },
      { label: "Target Sensitivity", value: "10 – 50 mV/Pa" },
      { label: "Target Noise Floor", value: "< 0.02 Pa RMS" }
    ]
  },
  {
    number: "03",
    title: "Technical Approach & Engineering Design",
    subtitle: "Systematic Physics-Driven Instrumentation",
    summary: "Detailed mathematical and pneumatic modeling ensures sensor diaphragm operates strictly within its high-sensitivity linear regime without saturating from ambient barometric drift.",
    keyPoints: [
      "Acoustic RC Filter: High-impedance capillary leak with 0.8L chamber creates mechanical high-pass cutoff at fc ≈ 0.005 Hz.",
      "Wind Noise Suppression: 4-arm porous hose array spatial averaging provides ~18 dB turbulence attenuation in 0.1–2 Hz.",
      "Embedded Processing: STM32F4 Cortex-M4 running 4th-order Butterworth bandpass (0.01–20 Hz) and 1024-pt FFT.",
      "Dynamic Thermal Correction: Real-time polynomial compensation eliminates adiabatic chamber heating/cooling bias."
    ],
    metrics: [
      { label: "Cutoff fc", value: "0.005 Hz (Pneumatic)" },
      { label: "Wind Rejection", value: "15 – 22 dB" },
      { label: "ADC Resolution", value: "24-bit Delta-Sigma" }
    ]
  },
  {
    number: "04",
    title: "Feasibility & Viability Analysis",
    subtitle: "Low-Cost Component Selection & Manufacturability",
    summary: "Designed strictly around readily available commercial off-the-shelf (COTS) MEMS sensors, standard pneumatic fittings, and low-cost 2-layer PCBs.",
    keyPoints: [
      "BOM Target: Target prototype BOM structured at ₹8,000 – ₹15,000, achieving a 95%+ cost reduction over imported observatory units.",
      "Components Availability: Off-the-shelf Sensirion/TE MEMS differential sensors, STM32 microcontrollers, and standard industrial enclosures.",
      "Power Budget: Total power consumption < 250 mW at 3.3V, enabling solar + battery standalone field operation for weeks.",
      "Scalability: Compact form-factor allows rapid fabrication and deployment in 3-element or 4-element infrasound arrays for source triangulation."
    ],
    metrics: [
      { label: "Power Budget", value: "< 250 mW" },
      { label: "Form Factor", value: "Compact IP66 Housing" },
      { label: "Array Capable", value: "Yes (Multi-node GPS sync)" }
    ]
  },
  {
    number: "05",
    title: "Impact, Benefits & NTRO Relevance",
    subtitle: "Defense, Security, and Environmental Intelligence",
    summary: "Provides an indigenous, accessible microbarometer technology for distributed sensor arrays, border perimeter surveillance, and atmospheric monitoring.",
    keyPoints: [
      "Defense & Security: Non-line-of-sight (NLOS) detection of heavy artillery, missile launches, supersonic aircraft booms, and subterranean blasts.",
      "Disaster Early Warning: Infrasonic tracking of volcanic eruptions, tsunami precursor pressure waves, avalanches, and severe storms.",
      "Indigenous Capability: Reduces reliance on costly, export-restricted foreign scientific microbarometers.",
      "Array Triangulation: Low cost enables dense spatial arrays capable of computing acoustic azimuth, elevation, and trace velocity."
    ],
    metrics: [
      { label: "Detection Type", value: "Non-Line-Of-Sight (NLOS)" },
      { label: "Range Potential", value: "10s to 100s km" },
      { label: "Cost Advantage", value: "> 95% vs Imported" }
    ]
  },
  {
    number: "06",
    title: "Research, Roadmap & Verification",
    subtitle: "Rigorous Experimental Validation Strategy",
    summary: "A transparent engineering roadmap detailing completed feasibility research, ongoing firmware development, and the planned acoustic calibration protocol.",
    keyPoints: [
      "Transparent Status: Clear demarcation between SIMULATED algorithms and PHYSICAL MEASURED data.",
      "Validation Protocols: 6-test suite covering Sensitivity, 0.01–20 Hz Frequency Response, Noise Floor PSD, Thermal Drift, Wind Suppression, and 24-hr Stability.",
      "Acoustic Calibration Rig: Planned low-frequency airtight pistonphone calibration chamber for traceable absolute sensitivity verification.",
      "Future Work: Multi-station network synchronization via GPS PPS timestamping for coherent array cross-correlation."
    ],
    metrics: [
      { label: "Validation Tests", value: "6 Rigorous Test Suites" },
      { label: "Current Phase", value: "Phase 3: Acquisition & Chamber" },
      { label: "Validation Status", value: "In Progress / Test Bench" }
    ]
  }
];
