export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export type EdgeHighlightType = 'candidate' | 'accepted' | 'rejected' | 'neutral';
export type NodeHighlightType = 'active' | 'visited' | 'neutral';

export type StepType = 'CHECK_EDGE' | 'ACCEPT_EDGE' | 'REJECT_EDGE' | 'COMPLETE';

export interface VisualizerStep {
  stepIndex: number;
  stepType?: StepType;
  description: string;
  subDescription?: string;
  
  // Elements state mappings for visual rendering
  edgeStates: Record<string, EdgeHighlightType>; // Edge.id -> Visual State
  nodeStates: Record<string, NodeHighlightType>; // Node.id -> Visual State
  
  // Disjoint set / MST details for visualizers
  mstEdgeIds: string[];
  totalMstCost: number;
  
  // Algorithm execution metrics
  metrics: {
    comparisons: number;
    unions?: number;
    heapSize?: number;
    [key: string]: number | undefined;
  };
}

export interface AlgorithmMetadata {
  id: string;
  name: string;
  complexity: string;
  description: string;
}
