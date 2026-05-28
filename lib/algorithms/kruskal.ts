import { GraphData, VisualizerStep, EdgeHighlightType, NodeHighlightType } from '@/types/graph';
import { AlgorithmGenerator } from './types';

// Union-Find / Disjoint Set Data Structure
class UnionFind {
  private parent: Record<string, string> = {};
  private rank: Record<string, number> = {};

  constructor(nodeIds: string[]) {
    nodeIds.forEach((id) => {
      this.parent[id] = id;
      this.rank[id] = 0;
    });
  }

  find(id: string): string {
    if (!this.parent[id] || this.parent[id] === id) {
      return id;
    }
    // Path compression
    this.parent[id] = this.find(this.parent[id]);
    return this.parent[id];
  }

  union(id1: string, id2: string): boolean {
    const root1 = this.find(id1);
    const root2 = this.find(id2);

    if (root1 !== root2) {
      // Union by rank
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

export class KruskalAlgorithm implements AlgorithmGenerator {
  generateSteps(graph: GraphData): VisualizerStep[] {
    const steps: VisualizerStep[] = [];
    const nodes = graph.nodes;
    
    // Defensive filter to omit any orphaned edges referencing non-existent nodes
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    // Initialize blank tracking sets
    const mstEdgeIds: string[] = [];
    let totalCost = 0;
    let comparisons = 0;
    let unions = 0;

    // Helper map of node labels for beautiful logs
    const labelMap = new Map<string, string>(
      nodes.map((node) => [node.id, node.label])
    );

    // Initial state setup (Step 0)
    const initialEdgeStates: Record<string, EdgeHighlightType> = {};
    const initialNodeStates: Record<string, NodeHighlightType> = {};

    edges.forEach((edge) => {
      initialEdgeStates[edge.id] = 'neutral';
    });
    nodes.forEach((node) => {
      initialNodeStates[node.id] = 'neutral';
    });

    steps.push({
      stepIndex: 0,
      stepType: 'CHECK_EDGE',
      description: 'Starting Kruskal\'s Algorithm.',
      subDescription: 'Sort all edges in ascending order of their weights, then test each one using Union-Find to avoid creating cycles.',
      edgeStates: { ...initialEdgeStates },
      nodeStates: { ...initialNodeStates },
      mstEdgeIds: [],
      totalMstCost: 0,
      metrics: { comparisons: 0, unions: 0 },
    });

    // 1. Sort all edges ascending
    edges.sort((a, b) => a.weight - b.weight);

    // 2. Initialize union-find container
    const ufu = new UnionFind(nodes.map((node) => node.id));

    // Dynamic deep references to current state
    const currentEdgeStates = { ...initialEdgeStates };
    const currentNodeStates = { ...initialNodeStates };

    // 3. Process each sorted edge
    edges.forEach((edge) => {
      comparisons += 1;

      const sourceLabel = labelMap.get(edge.source) || '';
      const targetLabel = labelMap.get(edge.target) || '';
      const weightVal = edge.weight;

      // STEP A: Highlight candidate evaluation
      const candidateStepEdgeStates = { ...currentEdgeStates };
      const candidateStepNodeStates = { ...currentNodeStates };

      candidateStepEdgeStates[edge.id] = 'candidate';
      candidateStepNodeStates[edge.source] = 'active';
      candidateStepNodeStates[edge.target] = 'active';

      steps.push({
        stepIndex: steps.length,
        stepType: 'CHECK_EDGE',
        description: `Evaluating edge (${sourceLabel}, ${targetLabel}) with weight ${weightVal}.`,
        subDescription: `Checking if incorporating this edge creates a cycle between node ${sourceLabel} and node ${targetLabel}.`,
        edgeStates: candidateStepEdgeStates,
        nodeStates: candidateStepNodeStates,
        mstEdgeIds: [...mstEdgeIds],
        totalMstCost: totalCost,
        metrics: { comparisons, unions },
      });

      // STEP B: Perform Union-Find Cycle Check
      const root1 = ufu.find(edge.source);
      const root2 = ufu.find(edge.target);
      const isCycleFree = root1 !== root2;

      if (isCycleFree) {
        // Union/Join nodes
        ufu.union(edge.source, edge.target);
        unions += 1;
        mstEdgeIds.push(edge.id);
        totalCost += edge.weight;

        // Save stable visual assignments
        currentEdgeStates[edge.id] = 'accepted';
        currentNodeStates[edge.source] = 'visited';
        currentNodeStates[edge.target] = 'visited';

        // Add step
        steps.push({
          stepIndex: steps.length,
          stepType: 'ACCEPT_EDGE',
          description: `Accepted edge (${sourceLabel}, ${targetLabel}).`,
          subDescription: `Union-Find confirms ${sourceLabel} and ${targetLabel} belong to different subsets. Joined them successfully.`,
          edgeStates: { ...currentEdgeStates },
          nodeStates: { ...currentNodeStates },
          mstEdgeIds: [...mstEdgeIds],
          totalMstCost: totalCost,
          metrics: { comparisons, unions },
        });
      } else {
        // Creates cycle, reject it
        currentEdgeStates[edge.id] = 'rejected';

        // Add step
        steps.push({
          stepIndex: steps.length,
          stepType: 'REJECT_EDGE',
          description: `Rejected edge (${sourceLabel}, ${targetLabel}) with weight ${weightVal}.`,
          subDescription: `Union-Find reports ${sourceLabel} and ${targetLabel} are already connected. Adding this would introduce a cyclic loop.`,
          edgeStates: { ...currentEdgeStates },
          nodeStates: { ...currentNodeStates },
          mstEdgeIds: [...mstEdgeIds],
          totalMstCost: totalCost,
          metrics: { comparisons, unions },
        });

        // Decay rejected state into dimmed Neutral state so the canvas stays clean on successive steps
        currentEdgeStates[edge.id] = 'neutral';
      }
    });

    // Final Completion Step
    steps.push({
      stepIndex: steps.length,
      stepType: 'COMPLETE',
      description: 'Completion: Kruskal\'s Algorithm complete.',
      subDescription: `Minimum Spanning Tree discovered successfully. Spanned all reachable nodes with a final minimal core metric cost of ${totalCost}.`,
      edgeStates: { ...currentEdgeStates },
      nodeStates: { ...currentNodeStates },
      mstEdgeIds: [...mstEdgeIds],
      totalMstCost: totalCost,
      metrics: { comparisons, unions },
    });

    return steps;
  }
}
