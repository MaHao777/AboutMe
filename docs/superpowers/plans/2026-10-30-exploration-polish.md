# Exploration Motion and Exit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Continue slow planet spin while exploring, support a deliberate left-scene click to return to flight, and soften hover-card edges into the background.

**Architecture:** Separate planet spin from the automatic satellite-orbit flag in PlanetSystem. Record the panel state and pointer origin before each click so the existing content return action and the new scene exit action cannot react to the gesture that opened them. Move label glass into a feather-masked background layer, fading text separately to preserve sharp text and backdrop sampling.

**Tech Stack:** Existing Astro/Three.js/TypeScript, DOM pointer events, CSS masked backdrop layers.

---

- [x] Keep primary planet spin running during overview/detail while respecting reduced motion; leave manual satellite orbit control intact.
- [x] Capture pointer-down exploration/detail and left-of-content state. Exit to flight only for a simple scene click that began in exploration, preserving content, links, selection, drag and satellite navigation.
- [x] Remove the label rectangle border/shadow and feather the glass layer into transparent edges without blurring the text.
- [x] Verify continued spin with stationary orbit, overview/detail scene exit, content click returning one level, no opening-click bounce and no drag exit; inspect the label edge and run type/build/controller checks.

Execution remains inline in the existing local checkout. No publishing or unrelated cleanup.

Validation: zero Astro errors/warnings/hints, successful static build and 37 passing controller/geometry/motto tests. Actual browser overview rotation increased .566960 to 1.109167, and detail rotation increased 1.130243 to 5.244677 while both orbit samples stayed -1.61119. Opening either level stayed open; a left-scene drag stayed in detail; a content click returned only to overview; left-scene clicks exited both overview and detail; satellite navigation stayed in exploration. No browser script/shader errors. Saved proof: `horizon-refinement/exploration-polish-final.jpg` and `exploration-polish-audit.json` in the task visualization folder.
