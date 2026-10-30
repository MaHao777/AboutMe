# Reference Black Hole and Navigation Plan

**Goal:** Match the supplied black-hole reference, restore light wheel snapping, and make detail-page exit behavior explicit.

**Architecture:** Retain the model/controller APIs and all portfolio content. Rebuild only the black-hole visual; add gesture-quiet snapping in the pure orbit controller, and handle single-click detail dismissal at the scene boundary while preserving links and native reading actions.

**Tech stack:** Existing Three.js shaders, TypeScript, Astro, deterministic Node tests and browser interaction checks.

- [x] Match the warm-white upper lens arch, thin inner photon ring, horizontal foreground belt, dimmer lower arc and soft bloom. Tilt the disk slightly and vary its left/right brightness per the latest user instruction.
- [x] Add light nearest-anchor settling after wheel input becomes quiet; keep continuous response during input and permit immediate reversal/interruption. Update former no-snap tests to the new contract.
- [x] Single click on second-level prose/background returns to the first level. The upper-right close button returns directly to flight from either level. Preserve links, images, copying, selection and dragging/scrolling.
- [x] Run orbit/flight tests, type checking, build, real-browser click/scroll/keyboard/selection checks, and compare reference/actual black-hole screenshots including reduced-motion and narrow views.

Visual and controller edits are delegated to independent agents; the root agent handles navigation changes, integration and browser verification. All changes remain local.
