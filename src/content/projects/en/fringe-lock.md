---
title: Closed-Loop Fringe Locking
description: Connecting line-scan acquisition, phase demodulation, and piezoelectric compensation for holographic gratings.
date: 2026-07-21
role: Camera integration, calibration, control software, and experimental debugging
category: Precision control
outcome: Calibration and cyclic control validated
order: 2
technologies:
- MATLAB
- C++
- Qt
- Sapera SDK
- PZT
- Closed-loop control
cover: /images/fringe-lock-experiment.jpg
coverWidth: 1706
coverHeight: 1280
coverAlt: A photograph of the fringe-locking experiment showing reference and current fringes, phase error, piezo position, and control commands
coverCaption: 'Experimental interface photographed on July 21, 2026: fringe comparison, phase error, PZT position, and control commands. This single run is not a complete assessment of locking accuracy or long-term stability. Click to view the original.'
featured: true
status: ongoing
published: true
highlights:
- title: Experimental feedback loop
  description: Calibration and cyclic control completed in July 2026
- title: Software integration
  description: Qt/C++ camera acquisition and piezoelectric control in progress
locale: en
---

## Results

**Completed system calibration and cyclic-control validation in July 2026**, connecting camera acquisition, phase demodulation, and piezoelectric compensation.

## Problem & method

Environmental disturbances move interference fringes during holographic grating fabrication. The system captures a reference fringe, demodulates at a fixed carrier frequency, and uses calibration to convert phase error into piezoelectric compensation.

## My contribution

- **Integrated a line-scan camera** and tested acquisition and calibration.
- Developed MATLAB control software and helped validate the feedback loop.
- Advanced a **Qt/C++ desktop application** with camera and serial piezoelectric drivers.

## Current status

The MATLAB experimental loop is validated. Qt/C++ migration and hardware testing continue; locking accuracy, response time, and long-term stability still require measurement.
