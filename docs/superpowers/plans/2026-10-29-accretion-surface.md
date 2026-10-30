# Accretion Surface and Display Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the supplied video with a tilted, visibly broad accretion surface and continuous flowing light; give both particle mottos distinctive display typography.

**Architecture:** Keep the current local checkout, route, content and flight behavior. Replace the thin analytic belt with a real Three.js annulus in `BlackHole.ts`, retain the lensed shadow/arches, and share advected plasma functions between the physical disk and lensed emission. Load bundled display fonts before resampling `ParticleMotto.ts`, preserving the two-minute transition and reduced motion.

**Tech Stack:** Astro, TypeScript, Three.js RingGeometry/ShaderMaterial, Canvas2D, locally served OFL fonts.

---

- [x] Add unmodified Smiley Sans and Orbitron font assets with their licenses under `public/fonts/`; load them locally with FontFace and resample glyph positions after loading without changing the current language/timeline.
- [x] Replace the narrow foreground belt with `new RingGeometry(EVENT_HORIZON_RADIUS * 1.12, ACCRETION_OUTER_RADIUS, 256, 48)`; tilt it in depth and roll it slightly, letting the horizon depth buffer hide the far half.
- [x] Remove `swallowedLight`, `pullSmear` and `rimSmear`; animate plasma in periodic polar coordinates at radius-dependent speeds, keeping fine radial ribbons and smooth gradients inside the disk and lensed arches.
- [x] Inspect the local preview at the opening and close approach, in Chinese and English, for surface depth, continuous motion, readability, depth ordering and shader/font errors. Verify reduced motion and the existing language timing tests.
- [x] Run `npm run check`, `npm run build`, and the existing cosmos controller/motto tests; save a representative browser screenshot and update this checklist.

Execution stays inline in the already modified local project. No publishing or unrelated cleanup is part of this change.

Verification: Astro check reports 0 errors/warnings/hints; the static build succeeds; all 29 existing flight/orbit/motto tests pass. Both local font responses are HTTP 200 and byte-identical to their source assets. Browser inspection confirms Chinese Smiley Sans and the assembled uppercase Orbitron phrase after the two-minute switch, the near-side annulus, far-side horizon occlusion, and a completed voyage with `loops=1`. Reduced motion was checked through the existing deterministic timeline tests and the material clock freeze path; it was not emulated at OS level. Screenshots are saved in the task's `horizon-refinement` visualization folder. The preview server on port 4323 serves `dist`, so updated builds were explicitly reloaded for QA.
