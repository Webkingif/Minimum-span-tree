import { GraphData, VisualizerStep, GraphEdge, EdgeHighlightType, NodeHighlightType } from '@/types/graph';
import { AlgorithmGenerator } from './types';

/**
 * A highly scalable Min-Heap implementation suited for Prim's, Dijkstra's, and A* algorithms.
 * Stores elements ordered by a customizable priority (such as edge weight).
 */
class MinHeap<T> {
  private heap: { element: T; priority: number }[] = [];

  constructor() {}

  get size(): number {
    return this.heap.length;
  }

  insert(element: T, priority: number): void {
    this.heap.push({ element, priority });
    this.upHeap(this.heap.length - 1);
  }

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

  peekMin(): T | null {
    if (this.heap.length === 0) return null;
    return this.heap[0].element;
  }

  // Debug tool/snapshot getter for education visual states
  toArray(): T[] {
    return this.heap.map(item => item.element);
  }

  private upHeap(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private downHeap(index: number): void {
    const length = this.heap.length;
    while (2 * index + 1 < length) {
      let leftChild = 2 * index + 1;
      let rightChild = leftChild + 1;
      let smallest = leftChild;

      if (rightChild < length && this.heap[rightChild].priority < this.heap[leftChild].priority) {
        smallest = rightChild;
      }

      if (this.heap[index].priority <= this.heap[smallest].priority) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

export class PrimAlgorithm implements AlgorithmGenerator {
  generateSteps(graph: GraphData, startNodeId?: string): VisualizerStep[] {
    const steps: VisualizerStep[] = [];
    const nodes = graph.nodes;
    
    // Defensive filter to omit any orphaned edges referencing non-existent nodes
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    // Prevent rendering of empty workspace networks
    if (nodes.length === 0) return [];

    // Map labels easily for educational message layouts
    const labelMap = new Map<string, string>(
      nodes.map((node) => [node.id, node.label])
    );

    // Step 0: Identify start node (Default to the first item created inside useGraphState)
    const startNode = nodes.find((n) => n.id === startNodeId) || nodes[0];

    // Data structure initialization
    const visitedNodes = new Set<string>();
    const mstEdgeIds: string[] = [];
    let totalCost = 0;
    let comparisons = 0;

    const currentEdgeStates: Record<string, EdgeHighlightType> = {};
    const currentNodeStates: Record<string, NodeHighlightType> = {};

    // Initial state setup (All components start as slate neutral)
    edges.forEach((edge) => {
      currentEdgeStates[edge.id] = 'neutral';
    });
    nodes.forEach((node) => {
      currentNodeStates[node.id] = 'neutral';
    });

    // Setup an Adjacency List for state traversal (Supports O(E log V))
    const adjList: Record<string, { neighborId: string; edge: GraphEdge }[]> = {};
    nodes.forEach(n => {
      adjList[n.id] = [];
    });
    edges.forEach(edge => {
      if (adjList[edge.source]) {
        adjList[edge.source].push({ neighborId: edge.target, edge });
      }
      if (adjList[edge.target]) {
        adjList[edge.target].push({ neighborId: edge.source, edge });
      }
    });

    // Step 1: Push root node selection context step
    visitedNodes.add(startNode.id);
    currentNodeStates[startNode.id] = 'visited';

    steps.push({
      stepIndex: 0,
      stepType: 'CHECK_EDGE',
      description: `Starting Prim's Algorithm at source node ${startNode.label}.`,
      subDescription: `Initializing spanning from arbitrary node ${startNode.label}. Visited nodes set: { ${startNode.label} }. Cut frontier is empty.`,
      edgeStates: { ...currentEdgeStates },
      nodeStates: { ...currentNodeStates },
      mstEdgeIds: [],
      totalMstCost: 0,
      metrics: { comparisons: 0, heapSize: 0 },
    });

    // Instantiate our active Binary Min-Heap
    const heap = new MinHeap<GraphEdge>();

    // Add starting neighbors to the heap initially
    adjList[startNode.id]?.forEach(({ edge }) => {
      heap.insert(edge, edge.weight);
    });

    // Run until we span all nodes in this connected network
    while (visitedNodes.size < nodes.length && heap.size > 0) {
      // Extract edge with smallest weight from active heap
      const minEdgeRef = heap.extractMin();
      if (!minEdgeRef) break;

      comparisons++;

      // Evaluate edge connectivity to detect cyclical returns
      const u = minEdgeRef.source;
      const v = minEdgeRef.target;
      const uVisited = visitedNodes.has(u);
      const vVisited = visitedNodes.has(v);

      const sourceLabel = labelMap.get(u) || '';
      const targetLabel = labelMap.get(v) || '';
      const weightVal = minEdgeRef.weight;

      // Skip if edge endpoints are already spanned (Redundant cycle)
      if (uVisited && vVisited) {
        // Step step check for Rejected edge
        const oldState = currentEdgeStates[minEdgeRef.id];
        if (oldState === 'neutral' || oldState === 'candidate') {
          currentEdgeStates[minEdgeRef.id] = 'rejected';
          steps.push({
            stepIndex: steps.length,
            stepType: 'REJECT_EDGE',
            description: `Skipped cyclic edge (${sourceLabel}, ${targetLabel}) with weight ${weightVal}.`,
            subDescription: `Both ${sourceLabel} and ${targetLabel} are already visited in the Spanned Tree. Discarding to avoid cycle.`,
            edgeStates: { ...currentEdgeStates },
            nodeStates: { ...currentNodeStates },
            mstEdgeIds: [...mstEdgeIds],
            totalMstCost: totalCost,
            metrics: { comparisons, heapSize: heap.size },
          });
        }
        continue;
      }

      // Identify unvisited node targets
      const unvisitedNodeId = uVisited ? v : u;
      const unvisitedLabel = labelMap.get(unvisitedNodeId) || '';

      // --- VISUAL SETUP: Highlight Candidate State ---
      const candidateStepEdgeStates = { ...currentEdgeStates };
      const candidateStepNodeStates = { ...currentNodeStates };

      // Highlight other elements currently available inside our binary Min-Heap frontier
      heap.toArray().forEach((frontierEdge) => {
        if (frontierEdge.id !== minEdgeRef.id && currentEdgeStates[frontierEdge.id] === 'neutral') {
          candidateStepEdgeStates[frontierEdge.id] = 'candidate';
        }
      });

      candidateStepEdgeStates[minEdgeRef.id] = 'candidate';
      candidateStepNodeStates[unvisitedNodeId] = 'active';

      steps.push({
        stepIndex: steps.length,
        stepType: 'CHECK_EDGE',
        description: `Inspecting minimum frontier edge: (${sourceLabel}, ${targetLabel}) with weight ${weightVal}.`,
        subDescription: `This edge has the absolute lightest weight (${weightVal}) leading out of the current MST spanned footprint to Node ${unvisitedLabel}.`,
        edgeStates: candidateStepEdgeStates,
        nodeStates: candidateStepNodeStates,
        mstEdgeIds: [...mstEdgeIds],
        totalMstCost: totalCost,
        metrics: { comparisons, heapSize: heap.size + 1 },
      });

      // --- EXPAND STEP: Span tree footprint ---
      visitedNodes.add(unvisitedNodeId);
      mstEdgeIds.push(minEdgeRef.id);
      totalCost += weightVal;

      currentEdgeStates[minEdgeRef.id] = 'accepted';
      currentNodeStates[unvisitedNodeId] = 'visited';

      // Load newly reachable adjacency list borders into our active Min-Heap
      adjList[unvisitedNodeId]?.forEach(({ neighborId, edge }) => {
        if (!visitedNodes.has(neighborId)) {
          heap.insert(edge, edge.weight);
        }
      });

      steps.push({
        stepIndex: steps.length,
        stepType: 'ACCEPT_EDGE',
        description: `Accepted edge (${sourceLabel}, ${targetLabel}). Node ${unvisitedLabel} is now Spanned.`,
        subDescription: `Appended ${unvisitedLabel} to the spanned set. Discovered edges total cost expanded to ${totalCost}. Added new neighbor edges to the heap.`,
        edgeStates: { ...currentEdgeStates },
        nodeStates: { ...currentNodeStates },
        mstEdgeIds: [...mstEdgeIds],
        totalMstCost: totalCost,
        metrics: { comparisons, heapSize: heap.size },
      });
    }

    // Capture visual completeness
    steps.push({
      stepIndex: steps.length,
      stepType: 'COMPLETE',
      description: "Completion: Prim's Spanning successfully finished.",
      subDescription: `Minimum Spanning Tree discovered. Connected all ${visitedNodes.size} reachable nodes using ${mstEdgeIds.length} edges with an aggregate path footprint of ${totalCost}.`,
      edgeStates: { ...currentEdgeStates },
      nodeStates: { ...currentNodeStates },
      mstEdgeIds: [...mstEdgeIds],
      totalMstCost: totalCost,
      metrics: { comparisons, heapSize: 0 },
    });

    return steps;
  }
}

export default PrimAlgorithm;

