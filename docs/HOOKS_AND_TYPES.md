# Hooks & Type Systems Documentation

This document explains the shared types, structures, and custom hooks that manage the React application states, user event histories, and playback timelines.

---

## 1. /types/graph.ts

### A. File Overview
This file contains the unified state contracts for all files. All items passed between components, hooks, and loaders must conform to these types, preventing runtime property mismatch bugs.

### B. Full Code Breakdown
```typescript
export interface GraphNode {
  id: string;   // Unique string key representing the node
  label: string; // Printable letter label like 'A', 'B', 'A1'
  x: number;    // Absolute x coordinate of the node's position on canvas
  y: number;    // Absolute y coordinate of the node's position on canvas
}

export interface GraphEdge {
  id: string;     // Unique string key representing the edge
  source: string; // The ID of the source GraphNode
  target: string; // The ID of the target GraphNode
  weight: number; // Positive integer representing edge travel cost
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
```
* **Why split nodes and edges into arrays?** This aligns perfectly with Cytoscape's elements declaration and allows React to loop through or count nodes and edges instantly.

```typescript
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export type EdgeHighlightType = 'candidate' | 'accepted' | 'rejected' | 'neutral';
export type NodeHighlightType = 'active' | 'visited' | 'neutral';

export type StepType = 'CHECK_EDGE' | 'ACCEPT_EDGE' | 'REJECT_EDGE' | 'COMPLETE';
```
These types are critical for styling:
* **`PlaybackStatus`**: Drives the play/pause state machine.
* **`EdgeHighlightType`** & **`NodeHighlightType`**: Direct Cytoscape to apply specific CSS classes (such as `node-visited`, `node-doubletapped`, `edge-accepted`, `edge-candidate`, or `edge-rejected`) corresponding to the current step of the animation.

---

## 2. /hooks/use-graph-state.ts

### A. File Overview
This hook handles all graph configuration logic. It maintains the nodes and edges array, manages addition, deletion, node movement, double-clicks for changing weights, clearing the workspace, and loading from three beautiful structured presets.

### B. Concept Explanation (For Beginners)
* **`useCallback`**: This is a React hook that saves a copy of a function between re-renders. Every time a React state updates, the component function executes again. If we don’t use `useCallback`, functions are recreated from scratch on every frame, which can degrade rendering performance in interactive canvas engines.
* **UUID-less ID Generation**: We build unique identifiers using `Date.now() + Math.random().toString(36).substr(2, 5)`. This creates highly reliable IDs client-side without having to load heavy dependencies.

### C. Code Breakdown & Data Flow
#### Label Generator
```typescript
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getNextLabel(existingNodes: GraphNode[]): string {
  const count = existingNodes.length;
  if (count < 26) {
    return ALPHABET[count];
  }
  return `${ALPHABET[count % 26]}${Math.floor(count / 26)}`;
}
```
* Automatically generates logical labels: `A` through `Z`, followed by `A1`, `B1`, etc., based on the number of nodes.

#### The State Hook & Presets
We declare three preset graphs (`default` with 6 nodes, `simpleCycle` with 5 nodes, and `sparse` with 4 nodes) containing preset node positions and weights.

Inside `useGraphState`:
```typescript
export function useGraphState(initialPresetKey = 'default') {
  const [graph, setGraph] = useState<GraphData>(() => {
    return GRAPH_PRESETS[initialPresetKey] || GRAPH_PRESETS.default;
  });
```

* **`addNode(x, y)`**: Spawns a node at the precise click location. It creates a random ID, fetches the next alphabetic label based on `getNextLabel`, and registers it into state.
* **`updateNodePosition(id, x, y)`**: Updates a node's coordinates in states. This is fired when the user finishes dragging a node on the Cytoscape canvas, ensuring positions are persisted.
* **`deleteNode(nodeId)`**: Uses a cascading delete structure. First, it removes the node with ID equal to `nodeId`. Then, it filters out all edges where `source` or `target` matches that ID, preventing broken and orphaned edge pointers.
* **`addEdge(source, target)`**: Checks if source and target are the same (avoiding loops). It checks if an edge already exists between those nodes (avoiding duplicate edges) and adds a default weight of 5.

---

## 3. /hooks/use-visualizer-timeline.ts

### A. File Overview
This custom state-machine manages the playback timer. It drives the indexing ticker that moves the visualizer step-by-step, controlling auto-running playback loops, pausing, skipping, and calculating delays based on speed states.

### B. Core React Hooks Used (For Beginners)
* **`useRef`**: A mutable box that persists values without triggering visual re-renders. We use it to store our standard JavaScript timer ID (`setInterval`), so we can clear and reset it from any helper function.

### C. Code Breakdown & Timer Mechanism
Let's see how the timing loops coordinates:

```typescript
  // Synchronizing Timeline if users update the graph topology
  const [prevTimeline, setPrevTimeline] = useState<VisualizerStep[]>(timeline);
  if (prevTimeline !== timeline) {
    setPrevTimeline(timeline);
    setCurrentStepIndex(0);
    setStatus('idle');
  }
```
* If the user dynamically adds or removes edges/nodes while an animation is active, this block detects the change, resets the frame index to `0`, and stops playback. This prevents array out-of-bounds crashes.

#### The Playback Ticker Effect
```typescript
  useEffect(() => {
    if (status !== 'playing') {
      clearTimer();
      return;
    }

    clearTimer();

    // Convert speed multiple to timeout delay (ms)
    const delay = Math.round(1000 / speed);

    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const nextIdx = prev + 1;
        if (nextIdx >= timeline.length) {
          setStatus('completed');
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return nextIdx;
      });
    }, delay);
```
* Whenever `status` or `speed` changes, this React effect fires.
* If `status === 'playing'`, we determine the tick interval. We map the speed slider (e.g. `1x` $\rightarrow 1000$ms, `2x` $\rightarrow 500$ms).
* We initiate an interval that increments `currentStepIndex` on each tick. Once we reach `timeline.length`, we change `status` to `completed` and clear the timer safely, which triggers the celebration modal.

---

## 4. /hooks/use-mobile.ts

### A. File Overview & Web API Concepts
This helper hook tracks if the user is loading the workspace on a small tablet or smartphone using the browser's native CSS media queries APIs.

### B. Code Breakdown
```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: 767px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < 768)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < 768)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```
* **Concepts**: We use `window.matchMedia` to subscribe directly to screen width transitions. This approach is highly efficient because it avoids firing updates on every single pixel resize, only executing callbacks when crossing the 768px barrier.
