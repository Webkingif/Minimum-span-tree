import { useState, useCallback } from 'react';
import { GraphData } from '@/types/graph';
import { useNodeOperations } from './use-node-operations';
import { useEdgeOperations } from './use-edge-operations';

// Beautiful standard presets for CS visualizers
export const GRAPH_PRESETS: Record<string, GraphData> = {
  default: {
    nodes: [
      { id: 'node-A', label: 'A', x: 150, y: 150 },
      { id: 'node-B', label: 'B', x: 300, y: 100 },
      { id: 'node-C', label: 'C', x: 450, y: 150 },
      { id: 'node-D', label: 'D', x: 550, y: 280 },
      { id: 'node-E', label: 'E', x: 350, y: 280 },
      { id: 'node-F', label: 'F', x: 180, y: 310 },
    ],
    edges: [
      { id: 'edge-AB', source: 'node-A', target: 'node-B', weight: 4 },
      { id: 'edge-AF', source: 'node-A', target: 'node-F', weight: 8 },
      { id: 'edge-BF', source: 'node-B', target: 'node-F', weight: 11 },
      { id: 'edge-BC', source: 'node-B', target: 'node-C', weight: 8 },
      { id: 'edge-BE', source: 'node-B', target: 'node-E', weight: 2 },
      { id: 'edge-CE', source: 'node-C', target: 'node-E', weight: 4 },
      { id: 'edge-CD', source: 'node-C', target: 'node-D', weight: 9 },
      { id: 'edge-DE', source: 'node-D', target: 'node-E', weight: 10 },
      { id: 'edge-EF', source: 'node-E', target: 'node-F', weight: 7 },
    ],
  },
  simpleCycle: {
    nodes: [
      { id: 'node-A', label: 'A', x: 300, y: 100 },
      { id: 'node-B', label: 'B', x: 450, y: 220 },
      { id: 'node-C', label: 'C', x: 380, y: 340 },
      { id: 'node-D', label: 'D', x: 220, y: 340 },
      { id: 'node-E', label: 'E', x: 150, y: 220 },
    ],
    edges: [
      { id: 'edge-AB', source: 'node-A', target: 'node-B', weight: 1 },
      { id: 'edge-BC', source: 'node-B', target: 'node-C', weight: 5 },
      { id: 'edge-CD', source: 'node-C', target: 'node-D', weight: 2 },
      { id: 'edge-DE', source: 'node-D', target: 'node-E', weight: 6 },
      { id: 'edge-EA', source: 'node-E', target: 'node-A', weight: 3 },
      { id: 'edge-BD', source: 'node-B', target: 'node-D', weight: 4 },
      { id: 'edge-CE', source: 'node-C', target: 'node-E', weight: 7 },
    ],
  },
  sparse: {
    nodes: [
      { id: 'node-A', label: 'A', x: 150, y: 200 },
      { id: 'node-B', label: 'B', x: 300, y: 120 },
      { id: 'node-C', label: 'C', x: 300, y: 280 },
      { id: 'node-D', label: 'D', x: 450, y: 200 },
    ],
    edges: [
      { id: 'edge-AB', source: 'node-A', target: 'node-B', weight: 10 },
      { id: 'edge-AC', source: 'node-A', target: 'node-C', weight: 5 },
      { id: 'edge-BC', source: 'node-B', target: 'node-C', weight: 2 },
      { id: 'edge-BD', source: 'node-B', target: 'node-D', weight: 8 },
      { id: 'edge-CD', source: 'node-C', target: 'node-D', weight: 15 },
    ],
  },
};

export function useGraphState(initialPresetKey = 'default') {
  const [graph, setGraph] = useState<GraphData>(() => {
    return GRAPH_PRESETS[initialPresetKey] || GRAPH_PRESETS.default;
  });

  const loadPreset = useCallback((presetKey: string) => {
    if (GRAPH_PRESETS[presetKey]) {
      setGraph(JSON.parse(JSON.stringify(GRAPH_PRESETS[presetKey])));
    }
  }, []);

  const clearGraph = useCallback(() => {
    setGraph({ nodes: [], edges: [] });
  }, []);

  // Connect sub-module hooks for Node & Edge operations
  const { addNode, updateNodePosition, deleteNode } = useNodeOperations(setGraph);
  const { addEdge, updateEdgeWeight, deleteEdge } = useEdgeOperations(setGraph);

  return {
    graph,
    addNode,
    updateNodePosition,
    deleteNode,
    addEdge,
    updateEdgeWeight,
    deleteEdge,
    clearGraph,
    loadPreset,
  };
}
