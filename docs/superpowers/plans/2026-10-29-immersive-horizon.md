# Immersive Horizon Implementation Plan

**Goal:** Remove flight-corridor lines, soften hover, add bilingual particle typography and create a cinematic black-hole crossing with inward optical flow.

**Architecture:** Keep the established content and satellite controls. Isolate text particles and the transit overlay in reusable Three.js classes; expose a deterministic transit timeline from the flight controller so camera, spacecraft, shader and covered reset share one progress value. Keep reduced-motion rendering and explicit disposal.

**Tech stack:** Existing Astro / TypeScript / Three.js, Canvas2D glyph sampling, procedural GPU effects and native Node/browser verification.

- [x] Delete corridor geometry and weaken model surface highlighting in favor of a soft silhouette glow.
- [x] Add particle clouds for exact strings `无限进步` and `never stop`, switch every 120 seconds with scattering and reassembly, and verify the timeline across cycles.
- [x] Add inward-flowing soft light and blur around the current tilted reference-style black hole.
- [x] Implement a synchronized four-second dive/tunnel/emergence, covered reset, acceleration/FOV/roll cues, spacecraft continuity and reduced-motion fallback.
- [x] Verify controller/timing tests, type checking and build; inspect actual GPU frames, text reassembly in both languages, hover, transit stages, second voyage, reading and reduced-motion views.

Root owns scene integration, camera/flight, hover and QA. Independent agents own particle motto, black-hole flow and transit rendering. Work stays in the current local project.
