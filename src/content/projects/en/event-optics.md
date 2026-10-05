---
title: Event Vision & Wavefront Data Platform
description: A physics-based desktop tool connecting atmospheric turbulence, optical spots, and event-camera responses.
date: 2026-07-01
role: Training-data software development · presentation and defense
category: Optical research
outcome: Eastern Region First Prize · Junzheng Fund selection
order: 1
highlights:
- title: End-to-end data generation
  description: Turbulent wavefront → Shack–Hartmann spots → event stream
- title: Desktop delivery
  description: Five-view previews, HDF5 recording, parameter sweeps, and playback
- title: Junzheng Fund selection
  description: 2026 · Soochow University · ultrafast wavefront sensing
technologies:
- Python
- PySide6
- HDF5
- Event cameras
- Wavefront reconstruction
cover: /images/event-optics-interface.png
coverWidth: 2879
coverHeight: 1654
coverAlt: The data-generation interface displaying the wavefront ground truth, Shack–Hartmann spots, and event spots
coverCaption: 'Software screenshot: the data-generation page displays the wavefront ground truth, Shack–Hartmann spots, and event spots. Reconstruction is disabled in this capture, leaving the two lower views empty. Click to view the original.'
featured: true
status: completed
published: true
locale: en
---

## Results

The team’s “Rapid Vision” project won **First Prize in the Eastern Region of the National Undergraduate Optoelectronic Design Competition**. I developed the training-data software and participated in the presentation and defense.

<h2 id="junzheng-fund">Junzheng Fund research project</h2>

The related project on neuromorphic vision for ultrafast wavefront sensing was **selected for the 2026 Junzheng Fund at Soochow University**.

## My contribution

Built a **desktop platform for generating, recording, and replaying data**, connecting atmospheric wavefronts, Shack–Hartmann spots, and event-camera responses.

- Simulated Zernike wavefronts, layered turbulence, spots, slopes, and events.
- Delivered **five-view previews, individual and batch recording, parameter sweeps, and playback**.
- Stored parameters, units, and synchronized data in HDF5 for reproducible experiments.

## Current status

Data generation and playback work, and live camera acquisition is connected. Live reconstruction remains incomplete. The competition award belongs to the team; my contribution focuses on the data software.
