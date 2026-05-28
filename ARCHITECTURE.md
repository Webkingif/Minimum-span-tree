# Minimum Spanning Tree Visualizer - Architecture Design

This document details the complete, production-grade architecture of the **Minimum Spanning Tree Visualizer**. By separating graph topology, algorithm state transitions, and UI presentation, the visualizer remains robust, deterministic, and highly extensible.

---

## 1. Architectural Philosophy: The Timeline Snapshot Pattern

Traditional algorithm visualizers execute code asynchronously, utilizing `await sleep(delay)` blocks embedded directly inside the graph algorithm. This approach has critical drawbacks:
- It tightly couples the execution speed with the algorithm's actual loop.
- It is incredibly hard to pause, rewind, fast-forward, or step forward/backward (no "scrubbing" controls).
- Changing speed or resetting mid-execution often leads to race conditions and inconsistent rendering states.

### The Solution: Offline Timeline Generation
Our design utilizes the **Timeline Snapshot Pattern**:
1. **Compilation**: When the user presses "Run", the selected Algorithm Engine (e.g., Prim, Kruskal) takes the current graph state as a static snapshot and runs it to completion *synchronously* in a few microseconds.
2. **Step Generation**: Instead of mutating the graph, the engine returns a **deterministic sequence of step objects** (`VisualizerStep[]`), which form a complete "timeline". Each step has visual descriptor states: which edge is a candidate, which edge is active, which nodes are visited, and the textual logic explanation of that atomic step.
3. **Time-Travel Playback**: The UI manages simple states for the playback (`currentStepIndex`, `status`, `speed`). To animate, it runs an animation ticker (using RequestAnimationFrame or `setInterval`) that increments `currentStepIndex` at the chosen speed.
4. **Declarative Rendering**: The Cytoscape canvas and details panels simply render the single step item corresponding to `timeline[currentStepIndex]`.

#### Tradeoffs:
- **Pros**: 100% deterministic, native "Rewind/Previous Step" capabilities, instantaneous speed changes, clean decoupling of algorithms from React and UI libraries.
- **Cons**: Requires more memory to hold step snapshots during visualization (though for graphs up to 100+ elements, this takes negligible memory — less than 1MB).

---

## 2. Directory Structure

This structure guarantees clean separation of concerns:
```text
/
├── types/
│   └── graph.ts               # Core TypeScript models (Nodes, Edges, Timeline steps)
├── lib/
│   ├── algorithms/
│   │   ├── types.ts           # Unified algorithm interfaces (DisjointSet, Generator)
│   │   ├── kruskal.ts         # Kruskal's algorithm step builder
│   │   └── prim.ts            # Prim's algorithm step builder
│   └── utils.ts               # CSS helpers & structural utilities
├── components/
│   ├── layout/
│   │   ├── header.tsx         # App Header with algorithm selecting & metrics overview
│   │   ├── sidebar.tsx        # Layout controls, playback controllers, and graph modes
│   │   └── footer.tsx         # Bottom details drawer (step-by-step console, complexity table)
│   ├── visualizer/
│   │   ├── canvas.tsx         # Interactivity layer with Cytoscape.js & Canvas elements
│   │   └── node-edge-editor.tsx # Weight adjustments and manual insertion overlays
├── hooks/
│   └── use-visualizer-timeline.ts # Hook for play, pause, tick timers, step control, and speed scrubbing
├── app/
│   ├── globals.css            # Styles, layout utilities, and typography setup
│   ├── layout.tsx             # Root page layout (Space Grotesk & Inter typeface support)
│   └── page.tsx               # Main assembly viewport page
└── ARCHITECTURE.md            # This documentation file
```

---

## 3. Core Data Flow & State Synchronization

```text
[User Edits Graph] ──► [Mutates Local GraphData State]
                                │
                        (User clicks "Run")
                                ▼
         [Algorithm Engine: Kruskal / Prim Generator]
                                │
                     (Computes Step Timeline)
                                ▼
                    [VisualizerStep[] State]
                                │
            [Ticks index: 0 ──► 1 ──► 2 ──► 3 ──► ...]
                                │
                                ▼
    ┌───────────────────────────┴──────────────────────────┐
    ▼                                                      ▼
[Cytoscape Graph Canvas Component]            [Step Console & Metric Widgets]
(Selects/Colors nodes & edges based on        (Renders markdown explanations &
 currentStep.nodeStates & edgeStates)          current accumulative weights)
```

---

## 4. TypeScript Interface Details

Our design models representations through robust static types to guarantee compiled stability (defined in `/types/graph.ts` and `/lib/algorithms/types.ts`):

1. **`GraphNode` & `GraphEdge`**: Define absolute coordinates and topology.
2. **`VisualizerStep`**:
   - `edgeStates` specifies which edges are selected for highlighting:
     - `'candidate'`: current line being processed (3.5px dashed border, warning amber `#f59e0b` tint, representing step evaluation).
     - `'accepted'`: edge belongs to MST (solid bold 5px green `#10b981` connection with high-contrast `#047857` weight label and `#ecfdf5` background padding, representing success state).
     - `'rejected'`: edge rejected to prevent cycles (thin 2.5px dotted red `#ef4444` line).
     - `'neutral'`: untouched network cabling (clean Slate-200 border, as requested in Clean Minimalism rules, styled with `#cbd5e1` 1.5px and 0.4 opacity).
   - `nodeStates` maps active node colors (`active` is gold, `visited` is emerald, `neutral` is white).

3. **Double-Tap Quick Interactions**:
   - **Canvas Double-Tap**: Instantly spawns a new node at the coordinates clicked, bypassing the active mode selection.
   - **Node Double-Tap**: Turns the active node vibrant yellow (`#fef08a`, border `#eab308`) to show select focus, and opens an elegant pop-up modal allowing the user to select a connection partner from a dynamic dropdown list, enter its weight, and insert the edge with one click.

---

## 5. Extensibility: Supporting Future Graph Algorithms

To scale this visualizer for core graph structures beyond MST (e.g. Dijkstra, Bellman-Ford, Tree Traversals, or Max Flow), the architecture relies on the highly customizable **`VisualizerStep` metadata context**:

For example, when implementing **Dijkstra** or **Bellman-Ford**:
- We only need to add dynamic text variables or a dictionary `nodeMetrics: Record<string, { distance: number; parent: string }>` to the `VisualizerStep` class description.
- The UI layer simply reads these values and displays labels below or inside the elements:
  ```typescript
  // Future SSSP representation in the step structure
  export interface ShortestPathStep extends VisualizerStep {
    nodeDistances: Record<string, number>; // Maps node.id to shortest distance so far (e.g., A -> 0, B -> 4, C -> Infinity)
  }
  ```
- The graph rendering canvas can dynamically display these labels based on whatever step type is run, keeping the presentation system completely reusable.

---

## 6. Playback Synchronization Design

### Decaying Interval Hook (`use-visualizer-timeline`)
Rather than relying on inline `setTimeout`, React component synchronization is steered by a stateful hook:
- A local `currentStepIndex` state tracks progress.
- To transition smoothly, we use standard react intervals tied to the `speed` coefficient, allowing developers to change the speed (e.g., `0.5x`, `1x`, `2x`) *live while playing*, immediately updating the interval duration without restarting execution.
- If `currentStepIndex` reaches `timeline.length - 1`, the status automatically flips to `'completed'`.

---

## 7. Applied Aesthetics: Clean Minimalism

To achieve a modern interactive computer science laboratory feel, the UI matches the clean aesthetics of top-tier platforms (Kael, Brilliant, Stripe developers portal):
- **Base Palette**: Off-white background canvas (`#f8fafc`) with Slate-900 typography, soft borders, and solid card structures.
- **Accents**:
  - Highlighting / Candidates: Warm amber colors (`#f59e0b` / `#fef3c7`) for processing edges.
  - Success: Brilliant emerald (`#10b981`) representing accepted components and completed connections.
  - Accents: Deep space indigo (`#4f46e5`) for interface controls, header nodes, and toggles.
- **Layout Rhythm**: Clear top navigability, comfortable spacing, and detailed feedback log cards for human-readable updates.
