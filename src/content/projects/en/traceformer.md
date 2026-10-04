---
title: TraceFormer · Small-Target Detection
description: Detecting faint moving targets in event streams with a reproducible model, postprocessing, and evaluation pipeline.
date: 2026-09-29
role: Model design, training, postprocessing, controlled experiments, and independent evaluation
category: Machine learning research
outcome: Complete-system validation score · 0.9541
order: 3
technologies:
- Python
- PyTorch
- Transformer
- LightGBM
- Event cameras
cover: /images/project-traceformer-en.svg
coverAlt: Selecting moving-target events from a noisy event stream
coverCaption: Detection concept illustration; actual validation visualizations appear below.
github: https://github.com/MaHao777/TraceFormer
featured: true
status: ongoing
published: true
highlights:
- title: Complete system
  description: Neural detector, LightGBM postprocessing, and trajectory rules
- title: Independent evaluation
  description: 24 sequences, all-event scoring, and prediction-mapping audits
gallery:
- src: /images/traceformer-qualitative.png
  alt: Input, neural-detector, and complete-system predictions on three validation sequences
  caption: 'Actual validation excerpts: Input is the event stream, S the selected network, R the reference network, and complete
    the full system. Misses and false detections remain visible.'
- src: /images/traceformer-validation.png
  alt: Scores for public PACT weights, the TraceFormer detector, and the complete system across 24 sequences
  caption: Same 24-sequence validation set. Training and development budgets differ; this is not a matched-training comparison
    or an official test ranking.
locale: en
---

## Results

The frozen complete system achieved a **validation score of 0.954117 across 24 sequences**, compared with **0.915002 for the neural detector alone** in an independent evaluation on September 29, 2026.

These are local validation results. The validation set informed model and threshold selection; they **do not represent official hidden-test scores or competition rankings**.

## Problem & method

Small targets produce sparse events amid dense background activity. Occupied-block tokens and bidirectional spatiotemporal cone attention aggregate motion neighborhoods, then map predictions back to original events. The complete system adds LightGBM postprocessing, trajectory rules, and dense-scene rescue.

## My contribution

Developed the **model, training, inference, and postprocessing pipeline**, ran ablations and independent evaluations, and audited prediction counts, order, and event mappings.

## Validation comparison

| Configuration | Validation score |
| --- | ---: |
| Public PACT weights | 0.803205 |
| TraceFormer neural detector | 0.915002 |
| **TraceFormer complete system** | **0.954117** |

All use the same sequences, event mapping, and global scoring. Training and development budgets differ, so the comparison describes these particular weights and configurations. **0.954117 belongs to the frozen historical system**, not every later module.

## Deliverables

**Runnable code, saved configurations and weights, per-sequence comparisons, and difficult-scene diagnostics**. Neural-detector and complete-system metrics are reported separately.
