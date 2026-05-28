import { useCallback } from 'react';
import { GraphData, GraphNode } from '@/types/graph';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function getNextLabel(existingNodes: GraphNode[]): string {
  const usedLabels = new Set(existingNodes.map((n) => n.label));

  // 1. Try single letter labels first: A-Z
  for (let i = 0; i < ALPHABET.length; i++) {
    const label = ALPHABET[i];
    if (!usedLabels.has(label)) {
      return label;
    }
  }

  // 2. If all A-Z are taken, try AA, AB, ..., ZZ
  for (let i = 0; i < ALPHABET.length; i++) {
    for (let j = 0; j < ALPHABET.length; j++) {
      const label = `${ALPHABET[i]}${ALPHABET[j]}`;
      if (!usedLabels.has(label)) {
        return label;
      }
    }
  }

  // 3. Robust generic node name fallback
  let index = existingNodes.length + 1;
  while (usedLabels.has(`N${index}`)) {
    index++;
  }
  return `N${index}`;
}

export function useNodeOperations(
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>
) {
  const addNode = useCallback((x: number, y: number) => {
    setGraph((prev) => {
      // Calculate a guaranteed unique label and ID
      const nextId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newLabel = getNextLabel(prev.nodes);
      const newNode: GraphNode = {
        id: nextId,
        label: newLabel,
        x: Math.round(x),
        y: Math.round(y),
      };
      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
      };
    });
  }, [setGraph]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setGraph((prev) => ({
      ...prev,
      nodes: prev.nodes.map((node) =>
        node.id === id ? { ...node, x: Math.round(x), y: Math.round(y) } : node
      ),
    }));
  }, [setGraph]);

  const deleteNode = useCallback((nodeId: string) => {
    setGraph((prev) => {
      // 1. Filter out the targeted node
      const nodes = prev.nodes.filter((node) => node.id !== nodeId);
      
      // 2. Cascade delete all connected edges to avoid orphaned edge references
      const edges = prev.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      
      return { nodes, edges };
    });
  }, [setGraph]);

  return {
    addNode,
    updateNodePosition,
    deleteNode,
  };
}
