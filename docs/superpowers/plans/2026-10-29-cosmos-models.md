# COSMOS Model Art Direction Implementation Plan

**Goal:** Refine every visible spacecraft, planet, moon and black hole into a coherent procedural 3D portfolio, with a monumental final black hole.

**Architecture:** Keep the flight and content controllers. Give planets distinct shader surfaces and themed satellites while keeping their picking spheres and geometric safety bounds; build the ship from smooth bevelled components. Combine a large 3D event horizon and animated accretion disk with camera-facing photon/lensing glow, then tune scene lighting and verify the full flight.

**Tech stack:** Existing Astro / Three.js / TypeScript; generated geometry and shaders, without new dependencies or downloaded models.

- [x] Refine the five planetary materials and all seventeen themed satellites (`Planet.ts`, `Satellite.ts`, optional material helper); preserve ring/atmosphere and satellite bounds.
- [x] Replace spacecraft primitive silhouette with a bevelled titanium/ceramic probe and recessed plasma engines (`Spaceship.ts`).
- [x] Build the large event horizon, layered accretion disk, photon ring and lensed light (`BlackHole.ts`); tune rendering/light and resource cleanup (`UniverseScene.ts`).
- [x] Verify orbit geometry and flight tests, type checking, build, actual shader compilation, all five explored systems, close approach and black-hole reset, mobile/reduced-motion views and resource cleanup.
- [x] Inspect screenshots and update `docs/COSMOS.md` with the final design and verified scope.

The root agent owns the black hole, rendering and integration; two independent agents own planetary models and spacecraft respectively. Edits stay in the current local project; existing uncommitted content changes remain intact.
