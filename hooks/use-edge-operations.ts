import { useCallback } from 'react';
import { GraphData, GraphEdge } from '@/types/graph';

export function useEdgeOperations(
  setGraph: React.Dispatch<React.SetStateAction<GraphData>>
) {
  const addEdge = useCallback((source: string, target: string, weight = 5) => {
    if (source === target) return; // Prevent self-loops

    setGraph((prev) => {
      // 1. Validate that source and target nodes exist in state
      const sourceExists = prev.nodes.some((n) => n.id === source);
      const targetExists = prev.nodes.some((n) => n.id === target);
      if (!sourceExists || !targetExists) return prev;

      // 2. Prevent duplicate undirected edges (A-B and B-A are treated as duplicate)
      const edgeExists = prev.edges.some(
        (edge) =>
          (edge.source === source && edge.target === target) ||
          (edge.source === target && edge.target === source)
      );

      if (edgeExists) return prev;

      // 3. Construct the clean new edge node with unique ID
      const nextId = `edge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newEdge: GraphEdge = {
        id: nextId,
        source,
        target,
        weight: Math.max(1, Math.round(weight)),
      };

      return {
        ...prev,
        edges: [...prev.edges, newEdge],
      };
    });
  }, [setGraph]);

  const updateEdgeWeight = useCallback((edgeId: string, weight: number) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((edge) =>
        edge.id === edgeId ? { ...edge, weight: Math.max(1, Math.round(weight)) } : edge
      ),
    }));
  }, [setGraph]);

  const deleteEdge = useCallback((edgeId: string) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter((edge) => edge.id !== edgeId),
    }));
  }, [setGraph]);

  return {
    addEdge,
    updateEdgeWeight,
    deleteEdge,
  };
}
