import { GraphData, VisualizerStep, EdgeHighlightType, NodeHighlightType } from '@/types/graph';
import { AlgorithmGenerator } from './types';

export class PrimAlgorithm implements AlgorithmGenerator {
  generateSteps(graph: GraphData, startNodeId?: string): VisualizerStep[] {
    const steps: VisualizerStep[] = [];
    const nodes = graph.nodes;
    const edges = graph.edges;

    // Edge check
    if (nodes.length === 0) return [];

    // Select start node
    const startNode = nodes.find((n) => n.id === startNodeId) || nodes[0];
    const labelMap = new Map<string, string>(
      nodes.map((node) => [node.id, node.label])
    );

    const visitedNodes = new Set<string>();
    const mstEdgeIds: string[] = [];
    let totalCost = 0;
    let comparisons = 0;

    const currentEdgeStates: Record<string, EdgeHighlightType> = {};
    const currentNodeStates: Record<string, NodeHighlightType> = {};

    // Initial setup (Slate base)
    edges.forEach((edge) => {
      currentEdgeStates[edge.id] = 'neutral';
    });
    nodes.forEach((node) => {
      currentNodeStates[node.id] = 'neutral';
    });

    // Step 0: Starting point selection
    visitedNodes.add(startNode.id);
    currentNodeStates[startNode.id] = 'visited';

    steps.push({
      stepIndex: 0,
      stepType: 'CHECK_EDGE',
      description: `Starting Prim's Algorithm at source node ${startNode.label}.`,
      subDescription: 'Initialize the tree with the root node. The algorithm will now grow the tree outward, one minimum edge at a time.',
      edgeStates: { ...currentEdgeStates },
      nodeStates: { ...currentNodeStates },
      mstEdgeIds: [],
      totalMstCost: 0,
      metrics: { comparisons: 0, heapSize: 0 },
    });

    // Run until we span all nodes (or run out of reachable edges)
    while (visitedNodes.size < nodes.length) {
      // Find all frontier edges (edges that have exactly one node visited)
      const frontierEdges: typeof edges = [];
      const rejectedEdges: typeof edges = [];

      edges.forEach((edge) => {
        const hasSource = visitedNodes.has(edge.source);
        const hasTarget = visitedNodes.has(edge.target);

        if ((hasSource && !hasTarget) || (!hasSource && hasTarget)) {
          frontierEdges.push(edge);
        } else if (hasSource && hasTarget) {
          // If both ends are visited, and it's not and wasn't part of MST, represent as rejected to keep clean
          if (!mstEdgeIds.includes(edge.id) && currentEdgeStates[edge.id] === 'neutral') {
            rejectedEdges.push(edge);
          }
        }
      });

      // Handle cyclic boundary updates
      rejectedEdges.forEach((e) => {
        currentEdgeStates[e.id] = 'rejected';
      });

      if (frontierEdges.length === 0) {
        // Connected component finished (rest of elements are disconnected)
        break;
      }

      // Step comparisons: find the edge with minimum weight in frontier
      comparisons += frontierEdges.length;
      frontierEdges.sort((a, b) => a.weight - b.weight);
      const chosenEdge = frontierEdges[0];

      const sourceLabel = labelMap.get(chosenEdge.source) || '';
      const targetLabel = labelMap.get(chosenEdge.target) || '';
      const weightVal = chosenEdge.weight;

      // Identify the freshly traversed node
      const nextNodeId = visitedNodes.has(chosenEdge.source)
        ? chosenEdge.target
        : chosenEdge.source;
      const nextNodeLabel = labelMap.get(nextNodeId) || '';

      // STEP A: Candidate/frontier review
      const candidateStepEdgeStates = { ...currentEdgeStates };
      const candidateStepNodeStates = { ...currentNodeStates };

      // Highlight frontier nodes & all eligible frontier edges
      frontierEdges.forEach((fe) => {
        if (fe.id !== chosenEdge.id) {
          candidateStepEdgeStates[fe.id] = 'candidate'; // frontier indicator
        }
      });

      // Focus on selected chosen candidate
      candidateStepEdgeStates[chosenEdge.id] = 'candidate';
      candidateStepNodeStates[nextNodeId] = 'active';

      steps.push({
        stepIndex: steps.length,
        stepType: 'CHECK_EDGE',
        description: `Inspecting cut frontier. Chosen minimum edge (${sourceLabel}, ${targetLabel}) with weight ${weightVal}.`,
        subDescription: `From the currently visited nodes, the edge (${sourceLabel}, ${targetLabel}) has the absolute lightest weight (${weightVal}) leading to unspanned territory.`,
        edgeStates: candidateStepEdgeStates,
        nodeStates: candidateStepNodeStates,
        mstEdgeIds: [...mstEdgeIds],
        totalMstCost: totalCost,
        metrics: { comparisons, heapSize: frontierEdges.length },
      });

      // STEP B: Append node and edge to the Spanned tree
      visitedNodes.add(nextNodeId);
      mstEdgeIds.push(chosenEdge.id);
      totalCost += chosenEdge.weight;

      currentEdgeStates[chosenEdge.id] = 'accepted';
      currentNodeStates[nextNodeId] = 'visited';

      // Decay other frontier flags back to neutral to visual refresh
      frontierEdges.forEach((fe) => {
        if (fe.id !== chosenEdge.id) {
          currentEdgeStates[fe.id] = 'neutral';
        }
      });

      steps.push({
        stepIndex: steps.length,
        stepType: 'ACCEPT_EDGE',
        description: `Spanned node ${nextNodeLabel} via edge (${sourceLabel}, ${targetLabel}).`,
        subDescription: `Node ${nextNodeLabel} is now part of the minimum spanning tree. Adding ${weightVal} to the aggregate algorithm cost.`,
        edgeStates: { ...currentEdgeStates },
        nodeStates: { ...currentNodeStates },
        mstEdgeIds: [...mstEdgeIds],
        totalMstCost: totalCost,
        metrics: { comparisons, heapSize: frontierEdges.length - 1 },
      });
    }

    // Final Completion Step
    steps.push({
      stepIndex: steps.length,
      stepType: 'COMPLETE',
      description: 'Completion: Prim\'s Algorithm complete.',
      subDescription: `Spanned all reachable components from source node ${startNode.label}. Minimum Spanning Tree discovered with optimal aggregate cost of ${totalCost}.`,
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
