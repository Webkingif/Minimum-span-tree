# Visual Component Systems & Canvas Integrations

This document covers all user interfaces and layout compartments of the MST Visualizer. It explains style changes, interactive toolbars, state management, and the integrations of Cytoscape.js and Framer Motion.

---

## 1. /components/layout/header.tsx

### A. File Overview & How It Fits
The Header resides at the top of the interface. It handles algorithm selections (Kruskal vs. Prim) and displays live graph elements (nodes count, edges count, and dynamic MST weight).

### B. Core Code Explanation
- **Algorithm Toggles**: We render a clean capsule control. Selecting a button checks if the target algorithm changed. If it did, it resets active animations first, then updates the algorithm state:
  ```typescript
  onChangeAlgorithm('kruskal');
  onResetAnimation();
  ```
- **Dynamic MST Cost Highlights**: If an animation is active, we showcase the current cost of the tree in green. We add an animated drop-shadow glow using Tailwind CSS when active:
  ```typescript
  isAnimationActive ? "text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "text-slate-600"
  ```

---

## 2. /components/layout/sidebar.tsx

### A. File Overview
The Sidebar manages user actions and configurations. It handles playing/pausing steps, skips, speed adjustments, preset selection, and canvas clears.

### B. Key Controls Breakdown
- **Action Grid**: Toggles between a solid purple "Play" button (with a standard play icon) and a "Pause" button (with a pause icon).
- **Stepping buttons**: Simple back (`ChevronLeft`) and forward (`ChevronRight`) icons that trigger increment/decrement callbacks. They are disabled depending on whether we've reached the bounds of our compiled timeline.
- **Speed Slider**: Standard `<input type="range" min="0.5" max="3.0">` mapped to the playback hook.
- **Workspace Presets**: Allows users to load pre-calculated graphs quickly. To prevent graph state updates during animation steps, preset buttons are completely disabled if `isAnimationActive` is true.

---

## 3. /components/layout/footer.tsx

### A. File Overview
The Footer houses our interactive **Timeline Scrubber** and **Step Explanation Box**. It provides an aesthetic "console log" detailing *what* the algorithm is doing and *why* it made its decision (e.g. accepting/rejecting edges, disjoint subset statuses, heap expansions).

### B. Code Breakdown & Scrubbing Mechanics
We draw standard, readable, custom tick marks representing each step of our algorithm sequence.
* To make micro-positioning visual, we overlay a progress bar on top of the native HTML range input:
  ```html
  <input type="range" value={currentStepIndex} onChange={(e) => onStepIndexChange(parseInt(e.target.value))} />
  ```
* When users slide this controller, it calls `setStepIndex`, which calculates the target state and updates all edge and node highlights immediately.

---

## 4. /components/visualizer/canvas.tsx

### A. File Overview & Cytoscape Sync Systems
This is the most critical file for rendering. It initializes a Cytoscape instance, configures custom stylesheet selectors, and handles mouse/canvas events (adding nodes, connecting nodes with edges, editing weights, and deletion).

### B. Step-by-Step Breakdown of Cytoscape Integration
Since we are using Next.js with Server-Side Rendering (SSR), `window` and standard canvas objects don't exist during compilation. We must lazy-load Cytoscape on client-side mount:

```typescript
  useEffect(() => {
    if (typeof window !== 'undefined' && !cytoscape) {
      import('cytoscape').then((module) => {
        cytoscape = module.default;
        initCytoscape();
      });
    } else if (cytoscape) {
      initCytoscape();
    }
```

#### Synchronizing React State with Cytoscape Styles on every Frame Update
If an animation step is active (`isAnimationActive` is true and `currentStep` is defined), we update styles on the fly:
```typescript
    if (isAnimationActive && currentStep) {
      // Clear previous styles from elements
      cy.nodes().classes([]);
      cy.edges().classes([]);

      // Overwrite Node Styles based on current step
      Object.entries(currentStep.nodeStates).forEach(([nodeId, state]) => {
        const cyNode = cy.getElementById(nodeId);
        if (cyNode.length > 0) cyNode.addClass(`node-${state}`);
      });

      // Overwrite Edge Styles based on current step
      Object.entries(currentStep.edgeStates).forEach(([edgeId, state]) => {
        const cyEdge = cy.getElementById(edgeId);
        if (cyEdge.length > 0) cyEdge.addClass(`edge-${state}`);
      });
    }
```

#### Dynamic Stylesheet Configuration
We map the stylesheet using distinct cytoscape style selectors:
* **`.node-active`**: Yellow background with orange borders to represent the node currently being evaluated.
* **`.node-visited`**: Green border and soft green background representing spanned network vertices.
* **`.edge-candidate`**: Orange dashed lines indicating the edge being checked for cycles or heap extractions.
* **`.edge-accepted`**: Solid green edge representing a successful Minimum Spanning Tree path.
* **`.edge-rejected`**: Dotted red line representing a skipped cyclic edge.
* **`.edge-neutral`**: Grey, low-opacity lines represent edges that aren't part of the active MST, keeping the visualization clean and easy to follow.

#### Deletion, Positioning, and Weight Editors
* **Mode Switch**: Users can toggle between `select` (to move nodes), `addNode` (to click and drop new vertices), `addEdge` (to click a source node, then a target node to create a weighted edge), and `delete` (to click and delete components).
* **Floating Form Editor**: When users click a neutral edge, we find its precise canvas midpoint (`target.midpoint()`) and render a floating React HTML Form wrapper directly above it. This allows the user to input custom weights (1 to 99) in real time.

---

## 5. /components/visualizer/pseudocode.tsx

### A. File Overview
Displays the algorithmic pseudocode for Kruskal or Prim side-by-side with the canvas. It synchronizes line-highlighting with the active playback frame.

### B. Synchronizing Syntax Highlighter Rows
We build code mappings. For instance, in Kruskal's algorithm:
- When `currentStep.stepType` is `'CHECK_EDGE'`: we highlight checking lines (Lines 4 & 5).
- When `currentStep.stepType` is `'ACCEPT_EDGE'`: we highlight union merging lines (Lines 6 & 7).
- When `currentStep.stepType` is `'REJECT_EDGE'`: we highlight cyclic skipped lines (Lines 8 & 9).

This line-by-line tracing aligns code logic directly with the visual animations. It uses Framer Motion’s `layoutId` to slide transition indicators smoothly between code rows.

---

## 6. /components/visualizer/stats-panel.tsx

### A. File Overview
Provides mathematical context for the visualizer. It displays total weight progress, execution-level comparisons, disconnected segments, and theoretical Big-O complexity labels.

---

## 7. /components/visualizer/completion-modal.tsx

### A. File Overview
A modal dialog styled like a bento grid that overlays the screen upon algorithm completion. It showcases the final tree metrics and provides a call-to-action to reset the workspace or analyze the computed branches.

---

## 8. /app/page.tsx

### A. File Overview & State Orchestra
This is our root-level Next.js page component. It acts as the coordinator, initializing:
1. **The Graph State Core (`useGraphState`)**: Nodes, edges, and topologies.
2. **The Algorithm Compilers (`KruskalAlgorithm` & `PrimAlgorithm`)**: Instantiated via React `useMemo` so they are created only once.
3. **The Playback Controller (`useVisualizerTimeline`)**: Play, pause, speeds.

```typescript
  // 1. Initial State Load
  const { graph, addNode, updateNodePosition, ... } = useGraphState('default');

  // 2. Fast Step Calculations
  const timeline = useMemo<VisualizerStep[]>(() => {
    if (graph.nodes.length === 0) return [];
    
    if (algorithm === 'kruskal') {
      return kruskalCompiler.generateSteps(graph);
    } else {
      const defaultStartId = graph.nodes[0]?.id;
      return primCompiler.generateSteps(graph, defaultStartId);
    }
  }, [graph, algorithm, kruskalCompiler, primCompiler]);

  // 3. Playback Loop Initialization
  const { currentStep, status, ... } = useVisualizerTimeline(timeline);
```

By separating graph state from animation timelines and UI rendering, we ensure that changes in one module don't introduce side-effects in others. The entire interface operates deterministically, providing a reliable and responsive educational tool.
