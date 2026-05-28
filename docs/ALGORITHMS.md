# Core Algorithm Systems & Data Structures

This document breaks down the mathematical core, data structures, and dynamic step compilers for the Minimum Spanning Tree Visualizer. There are two primary algorithms implemented: **Kruskal's Algorithm** and **Prim's Algorithm**.

---

## 1. /lib/algorithms/types.ts

### A. File Overview
This file establishes the **Strategy Design Pattern** interface contracts for all algorithm compilers. By defining a strict interface, the client UI component can switch between Kruskal and Prim algorithms transparently without worrying about how those steps are compiled.

### B. Code Breakdown & Line-by-Line Explanation
```typescript
import { GraphData, VisualizerStep } from '@/types/graph';

export interface AlgorithmGenerator {
  generateSteps(graph: GraphData, startNodeId?: string): VisualizerStep[];
}

export interface DisjointSet {
  parent: Record<string, string>;
  find(id: string): string;
  union(id1: string, id2: string): boolean;
}
```
- **`AlgorithmGenerator`**: An interface requiring any implementing class to provide a `generateSteps` function. This takes the current layout of the graph, computes the MST, and outputs a list of discrete visual snapshots (`VisualizerStep[]`) to render the steps.
- **`DisjointSet`**: Explains the minimum API required for a cycle-prevention Disjoint-Set forest.

---

## 2. /lib/algorithms/kruskal.ts

### A. File Overview & How It Works
**Kruskal's Algorithm** is a greedy algorithm that finds a Minimum Spanning Tree for a connected weighted undirected graph. The algorithm operates by:
1. Treating every node as a separate individual component (disjoint set).
2. Sorting all edges in the graph in ascending order of weight.
3. Iterating through sorted edges: for each edge, check if its endpoints are already in the same set.
   * If they are **NOT**, add this edge to the MST and merge (union) the two sets.
   * If they **ARE**, skip this edge because adding it would form a cycle.

To implement this efficiently, Kruskal's uses a **Union-Find (Disjoint-Set Forest) data structure with Path Compression and Union by Rank**.

```
Initial sets of Nodes:  {A}  {B}  {C}  {D}

Step 1: Inspect sorted Edge (A, B) weight = 2.
- Find(A) => A
- Find(B) => B
- Root A !== Root B (No cycle!) -> ACCEPT edge & Merge.
Merged sets:  {A, B}  {C}  {D}

Step 2: Inspect sorted Edge (B, C) weight = 3.
- Find(B) => B
- Find(C) => C
- Root B !== Root C (No cycle!) -> ACCEPT edge & Merge.
Merged sets:  {A, B, C}  {D}

Step 3: Inspect sorted Edge (A, C) weight = 4.
- Find(A) => C (via path compression)
- Find(C) => C
- Root C === Root C (Cycle detected!) -> REJECT edge.
```

### B. Core Data Structure: `UnionFind` Line-by-Line Code Breakdown
```typescript
class UnionFind {
  private parent: Record<string, string> = {};
  private rank: Record<string, number> = {};

  constructor(nodeIds: string[]) {
    nodeIds.forEach((id) => {
      this.parent[id] = id;
      this.rank[id] = 0;
    });
  }
```
- **`parent` Map**: Maps each node's ID to the node ID of its parent in the set forest. If `parent[id] === id`, then `id` is the root representative of its set.
- **`rank` Map**: Keeps track of the depth of trees to ensure we keep the trees shallow during unions.
- **`constructor`**: Initializes each node as its parent (meaning every node starts as a self-contained subset of size 1) and sets their ranks to 0.

#### The `find` operation (with Path Compression)
```typescript
  find(id: string): string {
    if (this.parent[id] === id) {
      return id;
    }
    this.parent[id] = this.find(this.parent[id]);
    return this.parent[id];
  }
```
- When looking for the root representative of a node, we traverse up until we find the parent that points to itself.
- **Path Compression**: `this.parent[id] = this.find(this.parent[id]);` on line 21 update parents directly to point to the root. Subsequent lookups will speed up dramatically from $O(V)$ to virtually $O(1)$.

#### The `union` operation (with Union by Rank)
```typescript
  union(id1: string, id2: string): boolean {
    const root1 = this.find(id1);
    const root2 = this.find(id2);

    if (root1 !== root2) {
      if (this.rank[root1] < this.rank[root2]) {
        this.parent[root1] = root2;
      } else if (this.rank[root1] > this.rank[root2]) {
        this.parent[root2] = root1;
      } else {
        this.parent[root1] = root2;
        this.rank[root2] += 1;
      }
      return true;
    }
    return false;
  }
}
```
- We find the roots of both items. If they are different (`root1 !== root2`), we merge them.
- To prevent our tree from getting too deep, we always attach the shorter tree (lower rank) to the root of the taller tree (higher rank).
- If ranks are equal, we arbitrarily attach one to another and increment the root's rank.

### C. The Kruskal Snapshot Loop Breakdown
```typescript
export class KruskalAlgorithm implements AlgorithmGenerator {
  generateSteps(graph: GraphData): VisualizerStep[] {
```
The compiler initializes the tracking vectors. It deep-copies lists of nodes and edges, so it doesn't pollute the active React UI states.

```typescript
    const steps: VisualizerStep[] = [];
    const nodes = graph.nodes;
    const edges = [...graph.edges];
```

#### Step 0 (Initial Neutral Framework)
```typescript
    const initialEdgeStates: Record<string, EdgeHighlightType> = {};
    const initialNodeStates: Record<string, NodeHighlightType> = {};

    edges.forEach((edge) => { initialEdgeStates[edge.id] = 'neutral'; });
    nodes.forEach((node) => { initialNodeStates[node.id] = 'neutral'; });

    steps.push({
      stepIndex: 0,
       stepType: 'CHECK_EDGE',
      description: 'Starting Kruskal\'s Algorithm.',
      ...
    });
```
We push an initial step, telling the user we are sorting edges.

#### Sorting & Processing
```typescript
    edges.sort((a, b) => a.weight - b.weight);
    const ufu = new UnionFind(nodes.map((node) => node.id));
```
We sort all edges ascendingly by weight, and initialize our Disjoint Set.

#### The Edge Scrutiny Iteration
For each sorted edge, we generate **two separate snapshots**:
1. **Candidate Verification Step (`CHECK_EDGE`)**:
   We highlight the edge as a yellow-dashed `candidate` and its source and target nodes as `active` so the user is clear *which* element we are looking at.
   ```typescript
   candidateStepEdgeStates[edge.id] = 'candidate';
   candidateStepNodeStates[edge.source] = 'active';
   candidateStepNodeStates[edge.target] = 'active';
   ```
2. **Acceptance (`ACCEPT_EDGE`) or Rejection (`REJECT_EDGE`) Step**:
   We run the Union-Find check:
   ```typescript
   const root1 = ufu.find(edge.source);
   const root2 = ufu.find(edge.target);
   const isCycleFree = root1 !== root2;
   ```
   * If `isCycleFree` is true: we execute the union, add the cost, change the edge style permanently to a solid bold emerald green (`#10b981`, 5px width, and a high-contrast deep green `#047857` weight label inside a padded `#ecfdf5` background badge) `accepted` look, and mark nodes as `visited`. We save this stable visual progress in `currentEdgeStates`.
   * If false: we change the style of the edge temporarily to red dotted `#ef4444` `rejected` and write a description: *"This would introduce a cyclic loop."* On the subsequent step, we clear (decay) this specific rejected highlight back to a highly desaturated, thin, and partially translucent (`#cbd5e1`, 1.5px, opacity: 0.4) `neutral` fallback so the screen stays clean.

---

## 3. /lib/algorithms/prim.ts

### A. File Overview & How It Works
**Prim's Algorithm** is also greedy, but unlike Kruskal's, it grows the tree from a **single starting node (root)** outward, one node at a time. It works by:
1. Selecting a starting node and adding it to the set of visited vertices.
2. Looking at all edges that connect a *visited* node to an *unvisited* node (**the cut frontier**).
3. Finding the edge with the absolute minimum weight in this frontier.
4. Adding that edge and the new node to the visited set, and continuing until all reachable nodes are traversed.

To scale Prim's algorithm for larger networks, we utilize a **Binary Min-Heap** (Priority Queue) to store current frontier edges, ordered by edge weight. This reduces lookup times from $O(V)$ to $O(\log E)$.

---

### B. Core Data Structure: `MinHeap` Line-by-Line Code Breakdown
A binary heap is represented efficiently inside an array. For any element at index $i$:
* its left child is at index $2i + 1$
* its right child is at index $2i + 2$
* its parent is at index $\lfloor(i - 1) / 2\rfloor$

```typescript
class MinHeap<T> {
  private heap: { element: T; priority: number }[] = [];
```
- **`heap` Array**: Stores key-value items. The `priority` corresponds to the edge weight.

#### The insertion operation (`insert` with Up-Heap)
```typescript
  insert(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.upHeap(this.heap.length - 1);
  }

  private upHeap(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }
```
- We push the new item to the very bottom of our heap tree (at the end of the array), and then bubble it up (`upHeap`) as long as its priority is lower than its parent's priority.

#### The extraction operation (`extractMin` with Down-Heap)
```typescript
  extractMin(): T | null {
    if (this.heap.length === 0) return null;
    const min = this.heap[0].element;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.downHeap(0);
    }
    return min;
  }
```
- The smallest element is always at index 0.
- We pull index 0, place the last element of the array at its spot, and trickle it downward (`downHeap`) until it rests in its appropriate heap-order location.

---

### C. The Prim Snapshot Loop Breakdown
```typescript
export class PrimAlgorithm implements AlgorithmGenerator {
  generateSteps(graph: GraphData, startNodeId?: string): VisualizerStep[] {
```
The algorithm converts the graph edges array into a local **Adjacency List** map structure:
```typescript
    const adjList: Record<string, { neighborId: string; edge: GraphEdge }[]> = {};
    nodes.forEach(n => adjList[n.id] = []);
    edges.forEach(edge => {
      adjList[edge.source].push({ neighborId: edge.target, edge });
      adjList[edge.target].push({ neighborId: edge.source, edge });
    });
```
This is vital because we need to query neighboring connections of a specific node instantly in $O(1)$.

#### Initialization
We place our starting node into the `visitedNodes` set and push all neighboring connections into our `MinHeap`.

```typescript
    visitedNodes.add(startNode.id);
    adjList[startNode.id]?.forEach(({ edge }) => {
      heap.insert(edge, edge.weight);
    });
```

#### Selection and Update Loop
While we haven't visited all nodes and our heap has elements:
1. We pull the minimum edge from the heap.
   ```typescript
   const minEdgeRef = heap.extractMin();
   ```
2. We check if both endpoints of this edge have already been visited.
   ```typescript
   const uVisited = visitedNodes.has(minEdgeRef.source);
   const vVisited = visitedNodes.has(minEdgeRef.target);
   if (uVisited && vVisited) { ... continue; }
   ```
   If they have, we reject this edge as a cyclic connection. We record a `REJECT_EDGE` step and progress.
3. If one end is unvisited, we accept it!
   * The unvisited endpoint (`unvisitedNodeId`) is added to `visitedNodes`.
   * The edge is pushed to `mstEdgeIds` and style is saved as `accepted` (solid green).
   * We insert all neighbor edges of the new node into our `MinHeap`.
   ```typescript
   adjList[unvisitedNodeId]?.forEach(({ neighborId, edge }) => {
     if (!visitedNodes.has(neighborId)) {
       heap.insert(edge, edge.weight);
     }
   });
   ```

At each decision boundary, we construct a descriptive log so the user understands that Prim's algorithm selected this edge because it was the absolute lightest path leading out of the current subtree into unvisited node territory.
