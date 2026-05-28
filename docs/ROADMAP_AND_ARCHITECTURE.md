# System Architecture, Learning Roadmap, & 7-Day Rebuild Guide

This document presents the detailed architectural blueprint, student learning pathways, and an day-by-day action guide for building the **Minimum Spanning Tree Visualizer** from scratch.

---

## 1. System Architecture Diagram (Text Representation)

The system represents a **Deterministic Snapshot-Driven Playback Architecture**. States flow top-down, and mutations (e.g. user drags, additions, deletions, algorithm selection) instantly trigger a re-computation of the step-by-step trace timeline.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER ACTIONS (VIEWPORTS)                        │
│  - Click Canvas: Create Node/Edge (addNode, addEdge)                  │
│  - Drag Node: Reposition (updateNodePosition)                          │
│  - Enter Input: Change Edge Weight (updateEdgeWeight)                  │
│  - Dropdown/Tab: Switch Algorithms (setAlgorithm)                       │
│  - Playback Toolbar: Play, Pause, Speed Slider, Drag Scrubber          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    v (Dispatches Mutations)
┌────────────────────────────────────────────────────────────────────────┐
│                      CORE GRAPH & STATE MANAGEMENT                     │
│  - GraphState (useGraphState): { nodes: GraphNode[], edges: GraphEdge[] }│
│  - Active Algorithm State: 'kruskal' | 'prim'                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    v (Sends Topology to Engine)
┌────────────────────────────────────────────────────────────────────────┐
│                      ALGORITHM DESIGN COMPILER                         │
│  - Instantiates Compiler Class (KruskalAlgorithm / PrimAlgorithm)      │
│  - Runs full MST computation and outputs complete trace instantly      │
│  - Trace Format: VisualizerStep[] (Array of snapshot frames)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    v (Injects Trace Pipeline)
┌────────────────────────────────────────────────────────────────────────┐
│                        PLAYBACK LIFECYCLE CONTROLLER                   │
│  - tracks Timeline index: state currentStepIndex (0 <= i < Steps)      │
│  - timing Loop: React useEffect hook driving a clean window.setInterval│
│  - Delay Offset: computed using (1000 / activePlaybackSpeed)           │
└───────────────────────────┬───────┴───────────────────────┬────────────┘
                            │                               │
       (Active Snapshot)    │                               │ (Sync Index)
                            v                               v
┌───────────────────────────────────────┐       ┌────────────────────────┐
│        CYTOSCAPE.JS RENDERER          │       │ EDUCATIONAL OVERLAYS   │
│  - Clears previous styles            │       │ - Stats: Total Weight  │
│  - Iterates over active nodeStates    │       │   Evaluations, Disjoint│
│  - Iterates over active edgeStates    │       │   Sets, heap capacities│
│  - Adds style classes:                │       │ - Pseudocode: Highlight│
│    * .node-active, .node-visited     │       │   active line offset   │
│    * .edge-candidate, .edge-accepted │       │ - Explanations: Show   │
│      .edge-rejected                  │       │   step details         │
└───────────────────────────────────────┘       └────────────────────────┘
```

---

## 2. Beginner's Learning Roadmap

This project is a great learning asset because it combines computer science theory (data structures, greediness, disjoint sets, binary heaps) with frontend engineering (responsive layout, timing loops, modular hierarchy, dynamic canvas libraries).

### Stage 1: Basics of Discrete Math & Graph Traversal
* **Topic**: What are Vertices ($V$) and Edge Weights ($E$)? What makes a tree a "Spanning Tree", and why does a "Minimum Spanning Tree" matter for utility grids, networks, and fiber laying?
* **Action Item**: Draw a graph with 5 vertices and 7 weights by hand. Manually compute the Minimum Spanning Tree using both Kruskal's (greedy sort) and Prim's (greedy explore) styles.

### Stage 2: Component Architecture & State Isolation
* **Topic**: How to structure full-stack React applications? Why should visual rendering (Cytoscape), mathematical steps compilation (Kruskal/Prim classes), and playback tickers be kept in separate compartments?
* **Action Item**: Study how changing state variables causes react components to re-run. Learn how the `useMemo` hook caches heavy calculations like path compiling to prevent lagging on mouse drags.

### Stage 3: Canvas Graph Rendering
* **Topic**: Canvas vs. SVG vs. DOM. Why do deep web graphing applications prefer canvas managers like Cytoscape.js or D3 force maps?
* **Action Item**: Learn how to configure a Cytoscape stylesheet. Learn how to separate elements (the actual graph nodes and edges lists) from their visual representations (classes, colors, and line dashes).

### Stage 4: Custom Timers & Playback Engines
* **Topic**: How intervals model clocks and schedules. How can we pause, fast-forward, speed-up, or scrub a timeline without crashing?
* **Action Item**: Study the `useVisualizerTimeline` hook. Learn how `useRef` stores the current interval timer ID safely so it can be cleared on user changes.

---

## 3. How to Rebuild This in 7 Days (Detailed Day-by-Day Guide)

Follow this highly specific guide to rebuild the entire application from scratch in one week.

### Day 1: Development Environment Setup & TypeScript Interfaces
* **Learning Objective**: Create a standard compiler structure and typing contracts.
* **Tasks**:
  1. Boot a fresh Next.js project with Tailwind CSS, TypeScript, and ESLint enabled.
  2. Install UI libraries: `lucide-react`, `motion` (Framer), `cytoscape`, and `@types/cytoscape`.
  3. Create `/types/graph.ts` to define raw contracts for: `GraphNode`, `GraphEdge`, `GraphData`, `VisualizerStep`, and highlight styles (`EdgeHighlightType`, `NodeHighlightType`).
  4. Build the core layout in `/app/layout.tsx` and map clean display fonts (using Google Fonts package `next/font/google` with variables `--font-sans` and `--font-mono`).

### Day 2: Interactive Sandbox Canvas UI
* **Learning Objective**: Mount a clean, responsive drawing workspace using Cytoscape.js.
* **Tasks**:
  1. Create `/components/visualizer/canvas.tsx` as a Client Component. Protect it against SSR crashes using dynamic client-side mounting inside a running component `useEffect` block.
  2. Implement a cytoscape stylesheet that distinguishes normal, active, visited, candidate, and rejected elements.
  3. Load node dragging coordinates inside cytoscape and setup event listeners: tapping the canvas drops a new node; clicking two nodes sequentially connects them with an edge; and tapping an edge pops a floating form input to edit its numeric weight.

### Day 3: Custom Hook for Graph Mutations
* **Learning Objective**: Manage the list of nodes, edges, connections, and coordinates.
* **Tasks**:
  1. Create `/hooks/use-graph-state.ts`.
  2. Write mutation functions: `addNode(x, y)` (using alphabetical increments like `A`, `B`, `C`), `updateNodePosition(id, x, y)`, `addEdge(...)` (guarding against loops and duplicates), and `deleteNode(...)` (ensuring cascading deletion of associated edges to avoid dangling arrows).
  3. Declare a set of predefined preset graphs (e.g. `default`, `simpleCycle`, `sparse`) so users can test algorithms instantly.

### Day 4: Kruskal's Core Compiler (Disjoint Set Union)
* **Learning Objective**: Program a Disjoint Set Union (DSU) forest with Path Compression and Union by Rank.
* **Tasks**:
  1. Create `/lib/algorithms/types.ts` to declare the algorithm interface strategy.
  2. Inside `/lib/algorithms/kruskal.ts`, write the highly specialized `UnionFind` class.
  3. Implement the `generateSteps(graph)` function: sort edges ascendingly, build a step timeline, and push separate snapshots for edge checks (highlighting the candidate yellow), acceptances (highlighting green and merging sets), and rejections (highlighting red and alerting cycles).

### Day 5: Prim's Core Compiler (Binary Min-Heap Queue)
* **Learning Objective**: Build an efficient binary tree heap to retrieve the lightest cut-frontier edges.
* **Tasks**:
  1. In `/lib/algorithms/prim.ts`, write a clean generic `MinHeap` class with standard heap algorithms: `upHeap` (bubble-up) and `downHeap` (sink-down) triggered by extraction actions.
  2. Implement adjacent vertex mapping to look up neighboring edges in $O(1)$ time.
  3. Write `generateSteps(graph, startNodeId)`: traverse neighbors of visited components, push candidate edges to the heap, and record accepted paths and rejected cyclic loops step-by-step.

### Day 6: Timeline Animation Playback Engine
* **Learning Objective**: Synchronize timer tick increments with state indices.
* **Tasks**:
  1. Create `/hooks/use-visualizer-timeline.ts` to drive ticker cycles.
  2. Implement standard timing controls: `play()`, `pause()`, and `reset()`.
  3. Design a `useEffect` timing hook that schedules a setInterval loop. The loop runs increment triggers linked to the playback speed multiplier. If the index exceeds steps capacity, it stops safely and signals completion.

### Day 7: Interactive Overlays, Pseudocode Trace, & Celebrations
* **Learning Objective**: Create a highly polished educational interface.
* **Tasks**:
  1. Create `/components/visualizer/pseudocode.tsx` with lines highlighting mapping arrays. Synchronize current line highlights with active playback steps.
  2. Write `/components/visualizer/stats-panel.tsx` to display real-time MST weights, evaluation counts, DSU merge stats, heap lengths, and asymptotic Big-O equations.
  3. Create the footer view comprising description boxes and an interactive slider timeline scrubber.
  4. Write `/components/visualizer/completion-modal.tsx` which triggers a congratulations modal upon completion, displaying the optimized MST cost, vertices traversed, and edge counts.
  5. Assemble all components inside `/app/page.tsx` with clean spacings and responsive borders. run `npm run build` and `npm run lint` to confirm a green, compile-safe production build.
