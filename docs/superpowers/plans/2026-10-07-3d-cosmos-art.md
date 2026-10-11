# 3D Cosmos artwork implementation plan

**Goal:** Replace the flat home and collection artwork with restrained 3D planets and satellites that follow stationary orbits.

**Architecture:** `ArtStudy.astro` provides a static SVG fallback and a host for a Three.js scene. A shared client module builds an icy ringed planet and a rocky world with terrain, craters, and polar ice. Both use the same sphere diameter and canvas dimensions. Depth testing handles near and far orbit segments; only the planets and satellites move. Rendering pauses when hidden and honors reduced motion.

**Tech Stack:** Astro, TypeScript, Three.js, CSS.

## 1. Scene and asset

- Add Three.js and its TypeScript definitions.
- Replace each illustration with a compact static fallback and a canvas host.
- Build a textured sphere, fixed tilted orbit, and smaller orbiting sphere for each color variant.
- Use opaque meshes and depth-tested orbit geometry so front and back overlap follows the camera view.

## 2. Motion and lifecycle

- Animate the satellite along the fixed orbit and turn the main sphere slowly.
- Resize with the artwork host, pause offscreen and in hidden tabs, and render one still frame when reduced motion is requested.
- Dispose renderer, textures, and geometry on page transitions.

## 3. Verification

- Run lint, Astro check, build, and diff checks.
- Inspect light, dark, desktop, mobile, and both collection pages.
- Confirm the orbit remains fixed while the satellite moves in separate frames.
