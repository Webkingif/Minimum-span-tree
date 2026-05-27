import { GraphData, VisualizerStep } from '@/types/graph';

export interface AlgorithmGenerator {
  /**
   * Generates a deterministic sequence of visualizer steps by running the algorithm
   * to completion over the provided graph.
   * 
   * @param graph The input graph data containing nodes and edges
   * @param startNodeId Optional starting node for algorithms like Prim or Single-Source Shortest Path
   */
  generateSteps(graph: GraphData, startNodeId?: string): VisualizerStep[];
}

export interface DisjointSet {
  parent: Record<string, string>;
  find(id: string): string;
  union(id1: string, id2: string): boolean;
}
