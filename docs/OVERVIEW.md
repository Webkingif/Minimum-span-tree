# Minimum Spanning Tree Visualizer - System Documentation

Welcome to the comprehensive documentation system for the **Minimum Spanning Tree (MST) Visualizer**. This system is an educational interactive software application designed to help computer science students, educators, and software engineers understand, edit, play, and debug graph theory algorithms—specifically **Kruskal's Algorithm** and **Prim's Algorithm**.

This documentation serves as a production-grade blueprint. Whether you are a senior architect studying the orchestration pattern or a beginner who has never written React, Next.js, or Cytoscape.js, this guide will walk you through the codebase, line-by-line, explaining the "what", "why", "how", and structural data flows.

---

## 1. High-Level Architecture Summary

The applications uses **Snapshot-Driven Playback Architecture**. Rather than attempting to run a live asynchronous process that directly manipulates the Canvas at arbitrary intervals, the entire algorithm execution is computed **instantly** and **deterministically** whenever the graph topology or target algorithm changes.

```
+-------------------------------------------------------------+
|                                                             |
|                   useGraphState (State Engine)               |
|            Tracks: [Nodes List] & [Edges List]              |
|                                                             |
+------------------------------+------------------------------+
                               |
                               | (Topology Change)
                               v
+-------------------------------------------------------------+
|                                                             |
|                   Instant Step Compiler                      |
|          Runs chosen Algorithm (Kruskal or Prim)            |
|       Outputs a Sequence of VisualizerStep snapshots        |
|                                                             |
+------------------------------+------------------------------+
                               |
                               | (VisualizerStep[] Timeline)
                               v
+-------------------------------------------------------------+
|                                                             |
|                    useVisualizerTimeline                    |
|          Tracks: currentStepIndex, speed, playback          |
|                                                             |
+------------------+-----------------------+------------------+
                   |                       |
                   | (Current Step)        | (State Indices)
                   v                       v
+------------------+-------+       +-------+------------------+
|                          |       |                          |
|    Cytoscape.js Canvas   |       |    Pseudocode Trace,     |
|   Applies highlighted    |       |    Decision Feed, &      |
|    classes dynamically   |       |   Statistics Dashboards  |
|                          |       |                          |
+--------------------------+       +--------------------------+
```

### Why Snapshot-Driven?
1. **Zero Race Conditions**: If a user drags a node or pauses halfway through, there are no active native JavaScript timeouts or background intervals conflicting with the canvas state.
2. **Reverse Stepping (Time Travel)**: Because the entire sequence of steps is pre-compiled, we can move backwards to previous steps (using the decrement operator) as easily as we can move forwards.
3. **Scrubbable Timeline**: Users can drag the timeline scrubber to any arbitrary step immediately. This is achieved by setting the array index state in React, which triggers a complete visual style update.

---

## 2. Directory Tree Mapping

For a clean, maintainable, and standard Next.js App Router workspace, the codebase is structured as follows:

```
├── app/
│   ├── globals.css         # Minimal styling imports for Tailwind CSS
│   ├── layout.tsx          # Master layout configuration injecting fonts
│   └── page.tsx            # Main assembly viewport coordinating state and views
│
├── components/
│   ├── layout/
│   │   ├── header.tsx      # Top-tier branding, algorithm toggle, and live graph counters
│   │   ├── sidebar.tsx     # Left-side playback, speeds, presets, and tip rails
│   │   └── footer.tsx      # Step explanation terminal and interactive scrubber bar
│   │
│   └── visualizer/
│       ├── canvas.tsx      # Cytoscape.js wrapper managing node positioning and styles
│       ├── stats-panel.tsx # Numerical statistics of cycles, heaps, and asymptotic metrics
│       ├── pseudocode.tsx  # Dynamic pseudocode highlighting synchronizing with frames
│       └── completion-modal.tsx # Celebratory bento-grid overlay showing final metrics
│
├── hooks/
│   ├── use-graph-state.ts  # Isolated state manager for saving nodes, edges, edit-history
│   ├── use-mobile.ts       # Utility helper for responsive viewport queries
│   └── use-visualizer-timeline.s # Timing loop playback state-machine (Play, Pause, Reset, Tick)
│
├── lib/
│   ├── algorithms/
│   │   ├── types.ts        # Typing contracts for custom algorithm generators (Strategy Pattern)
│   │   ├── kruskal.ts      # Kruskal's step engine using Union-Find Disjoint Sets
│   │   └── prim.ts         # Prim's step engine using customized Binary Min-Heaps
│   │
│   └── utils.ts            # Highly standard cn class merger for tailwind
│
└── types/
    └── graph.ts            # High-fidelity shared contract models for nodes, highlights, indices
```

---

## 3. Technology Stack & Core Concepts

### Next.js 15+ & React 19
Next.js provides the build system, local routing, and packaging. In this system, all runtime interfaces use **Next.js Client Components** via the `'use client'` directive. This is essential because graph visualizers use client-side window boundaries, interactive mouse events, state hooks, and custom rendering engines that cannot run server-side.

*Terminology Checklist for Beginners:*
* **hydrate**: To take static HTML (rendered on a server) and attach live JavaScript event handlers (like click listeners) on the user's web browser.
* **re-render**: React's core loop of updating the web page content by executing the active component code again whenever its associated visual variables (**state**) change.

### Cytoscape.js
Unlike typical static SVG libraries, **Cytoscape.js** is a high-performance graph visualization library written in JavaScript. It is perfect for MST visualization because:
- It supports customized stylesheets (changing color, width, borders dynamically).
- It includes native node dragging, panning, and zooming controls.
- It operates on a high-fidelity rendering pipeline, making updates extremely swift without lag.

### Framer Motion
Animations are driven by **Framer Motion** (imported from `motion/react`). Framer Motion makes declarative animations trivial in React. Rather than writing long CSS transition scripts, we wrap layout boxes in `<motion.div>` tags and define target states (such as `animate={{ scale: 1 }}`). The library automatically handles interpolating physics curves.

---

## 4. How to Recreate This Project From Scratch

To build this exact project, perform the following step-by-step setup in your terminal:

### Step 1: Initialize Next.js Workspace
Run the following build command:
```bash
npx create-next-app@latest mst-visualizer --typescript --tailwind --app --src-dir=false --eslint
cd msd-visualizer
```

### Step 2: Install Core Visualization and Animation libraries
Execute npm installer:
```bash
npm install cytoscape motion lucide-react clsx tailwind-merge
npm install -D @types/cytoscape
```

### Step 3: Set Up Folder Directory Layout
Run the directory creator:
```bash
mkdir -p types hooks lib/algorithms components/layout components/visualizer
```

### Step 4: Populate Data Files
Populate each file in sequence as laid out in the remaining documentation files. Let's explore each module in detail:
- For Core Types and Hook managers, review `/docs/HOOKS_AND_TYPES.md`.
- For Mathematical Algorithms and Min-Heaps, review `/docs/ALGORITHMS.md`.
- For Visual React Components and Cytoscape styling overlays, review `/docs/COMPONENTS.md`.
