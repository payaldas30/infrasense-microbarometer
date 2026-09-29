# INFRASENSE — MEMS-Based Infrasound Microbarometer

> **Problem Statement:** SIH26144  
> **Organization:** NTRO (National Technical Research Organisation)  
> **Category:** Hardware / Smart Automation  
> **Target Bandwidth:** 0.01 – 20 Hz  
> **Target Prototype Cost:** ₹8,000 – ₹15,000  

---

## 📌 Project Overview

**INFRASENSE** is a modern scientific instrumentation and validation web platform for a low-cost MEMS differential-pressure based microbarometer. It is designed for the detection, spatial wind-noise rejection, and digital spectral characterization of atmospheric infrasonic fluctuations in the sub-audible **0.01–20 Hz** frequency band.

Developed for **Smart India Hackathon Problem Statement SIH26144** under **NTRO**.

*Note: INFRASENSE is a student research prototype developed for SIH26144. It is not an official NTRO product.*

---

## ⚡ Key Features

- **Scientific Instrumentation Dashboard (`/dashboard`)**:
  - Live scrolling pressure variation waveform ($\Delta P$ in Pa) sampled at 10 Hz.
  - Power Spectral Density (PSD) analysis across 0.01–20 Hz (linear & logarithmic scales).
  - Reference chamber temperature correlation & health telemetry.
  - Controls: Pause/Resume, Clear, Window selection (1m, 5m, 15m, 1h), CSV & JSON export.
  - Experimental rule-based Infrasonic Event Detector.
- **Physics-Grounded Signal Generator**:
  - Multi-tone infrasonic synthesis (0.018 Hz, 0.08 Hz, 0.22 Hz, 0.85 Hz, 2.4 Hz).
  - $1/f$ pink noise atmospheric flicker & dynamic wind turbulence bursts ($0.5 \cdot \rho \cdot v^2$).
  - Porous hose spatial averaging wind filter simulation ($\sim 18\text{ dB}$ attenuation).
  - Diurnal barometric baseline drift modeling.
- **End-to-End System Architecture (`/architecture`)**:
  - Clickable block diagram linking Atmosphere → Wind-Noise Suppression → Pneumatic Conditioning → MEMS Diaphragm → Signal Acquisition → STM32 DSP.
  - Slide-out component specification drawers with candidate COTS parts and datasheets.
  - Mathematical model of the acoustic high-pass capillary equalization leak ($f_c \approx 0.005\text{ Hz}$).
- **Interactive Signal Laboratory (`/signal-lab`)**:
  - 6 DSP workbenches: Time Domain, Digital Filtering (4th-order zero-phase Butterworth), FFT Amplitude Spectrum, Welch PSD, Temperature Compensation, and Noise Floor Analysis.
- **Prototype Validation Suite (`/validation`)**:
  - 6 rigorous engineering characterization tests: Sensitivity, Frequency Response (0.01–20 Hz), Noise Floor, Temperature Drift, Wind Suppression, and 24-Hour Stability.
  - Strict compliance labeling: `MEASURED`, `SIMULATED`, `TARGET`, and `NOT MEASURED`.
- **Hardware & Bill of Materials (`/hardware`)**:
  - Subsystem explorer & live-editable prototype BOM table with target cost tracking.
  - 10-stage development milestone progress tracker.
- **Research Foundation (`/research`)**:
  - Categorized academic literature across Infrasound, MEMS Sensors, Pneumatics, Wind Rejection, and Calibration.
  - Transparent "Why This Design?" engineering trade-off matrix.
- **SIH Presentation Companion (`/sih26144`)**:
  - Interactive 6-slide presentation deck mirroring official SIH judging criteria.
- **Dark & Light Themes**:
  - Restrained scientific dark aesthetic (deep navy/slate + technical cyan accent) and clean high-contrast light mode, toggleable across all screens.
- **Instrument Settings Drawer**:
  - Real-time adjustment of simulation physics parameters, hardware bandwidth, sampling rate, and telemetry sources.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS (Semantic CSS variable-driven theming)
- **Charts & Visualization:** Recharts + HTML5 Canvas
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment:** Vercel (SPA rewrites configured)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

```bash
# Clone the repository
git clone https://github.com/payaldas30/infrasense-microbarometer.git
cd infrasense-microbarometer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Framework preset will automatically be detected as **Vite**.
4. Click **Deploy**. SPA client routing is pre-configured via `vercel.json`.

---

## 📄 License

Student Research Prototype developed for Smart India Hackathon (SIH26144).
