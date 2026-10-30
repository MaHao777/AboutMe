# Accretion Depth and Smooth Junction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enlarge and slow the black-hole disk, add a thick inner body and thin outer edge, introduce alternating radial light peaks, and remove the disconnected arch endpoints.

**Architecture:** Keep the current local checkout and flight behavior. Factor the radial profile, thickness function and cubic lens shoulder coefficients into a small pure module. Use the thickness to build a closed annular shell, sample the light profile into a local GPU lookup, and replace the upper/lower Y cutoffs with tangent-continuous curves rolled with the disk.

**Tech Stack:** TypeScript, Three.js BufferGeometry/DataTexture/ShaderMaterial, native Node tests, Astro local static preview.

---

- [x] Add focused regression checks for the alternating light samples, inner/outer thickness and both tangents of the lens shoulder.
- [x] Increase the outer radius from 93 to 112, reduce angular flow from .62 to .16, and render a closed shell with a progressively thicker inner region.
- [x] Sample `0,1,0,4,1,5,2,7,2,9` with smooth interpolation and use the result for surface emission; keep small flowing details subordinate to the radial contrast.
- [x] Join each circular arch to the rolled plane with a cubic shoulder matched in position and tangent, with no Y-based end cutoff.
- [x] Build and check types, run relevant tests, inspect the marked left junction and the right junction at close range, and save a final screenshot.

Root cause evidence: the previous shader independently masked the upper and lower circular arches with Y smoothsteps while the physical disk was rolled .13 radians. The masks reached zero before the projected surfaces met, making flat detached caps at the left shoulder. The supplied screenshot reproduces this visual failure.

Execution remains inline and local; no deployment or unrelated cleanup.

Validation: all 32 accretion/flight/orbit/motto tests pass, Astro type checking has zero errors/warnings/hints, and the static build succeeds. A real browser close approach verifies both shoulder transitions, the broader disk and alternating radial light bands with no script or shader errors. Existing font and language timing behavior remains unchanged. The preview on port 4323 serves the rebuilt static output.
