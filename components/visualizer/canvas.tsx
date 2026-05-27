'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphData, VisualizerStep } from '@/types/graph';
import { Trash2, Edit3, PlusCircle, ArrowUpRight, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

// We import Cytoscape dynamically in UseEffect to avoid Next SSR issues
let cytoscape: any = null;

interface CanvasProps {
  graph: GraphData;
  currentStep: VisualizerStep | null;
  mode: 'select' | 'addNode' | 'addEdge' | 'delete';
  onChangeMode: (mode: 'select' | 'addNode' | 'addEdge' | 'delete') => void;
  onAddNode: (x: number, y: number) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onAddEdge: (source: string, target: string, weight: number) => void;
  onUpdateEdgeWeight: (id: string, weight: number) => void;
  onDeleteEdge: (id: string) => void;
  isAnimationActive: boolean;
}

export default function Canvas({
  graph,
  currentStep,
  mode,
  onChangeMode,
  onAddNode,
  onUpdateNodePosition,
  onDeleteNode,
  onAddEdge,
  onUpdateEdgeWeight,
  onDeleteEdge,
  isAnimationActive,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  
  // Weight editor state
  const [editingEdge, setEditingEdge] = useState<{ id: string; weight: number; x: number; y: number } | null>(null);

  // Initialize Cytoscape.js once on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && !cytoscape) {
      // Lazy load standard cytoscape on the browser
      import('cytoscape').then((module) => {
        cytoscape = module.default;
        initCytoscape();
      });
    } else if (cytoscape) {
      initCytoscape();
    }

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initCytoscape() {
    if (!containerRef.current || !cytoscape) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'background-color': '#ffffff',
            'border-width': '2px',
            'border-color': '#94a3b8', // Slate-400
            'color': '#334155', // Slate-700
            'font-size': '12px',
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '38px',
            'height': '38px',
            'transition-property': 'background-color, border-color, border-width, box-shadow',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(weight)',
            'width': '2px',
            'line-color': '#cbd5e1', // Slate-300
            'font-size': '11px',
            'font-weight': 'bold',
            'color': '#475569', // Slate-600
            'text-background-opacity': 1,
            'text-background-color': '#ffffff',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-margin-y': -2,
            'curve-style': 'haystack', // High performance straight lines
            'transition-property': 'line-color, width, line-style',
            'transition-duration': '0.2s',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#6366f1', // Indigo-500
            'border-width': '3px',
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#6366f1',
            'width': '3px',
          },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Handle Drag ends
    cyRef.current.on('free', 'node', (evt: any) => {
      if (isAnimationActive) return;
      const node = evt.target;
      const pos = node.position();
      onUpdateNodePosition(node.id(), pos.x, pos.y);
    });

    // Handle single tap on Canvas/Elements
    cyRef.current.on('tap', (evt: any) => {
      const target = evt.target;
      const isCanvas = target === cyRef.current;

      // Handle Weight Editor removal
      setEditingEdge(null);

      if (isAnimationActive) return;

      if (isCanvas) {
        if (mode === 'addNode') {
          const renderedPos = evt.position;
          onAddNode(renderedPos.x, renderedPos.y);
        }
        setSelectedSourceId(null);
      } else if (target.isNode()) {
        const nodeId = target.id();

        if (mode === 'delete') {
          onDeleteNode(nodeId);
          setSelectedSourceId(null);
        } else if (mode === 'addEdge') {
          if (!selectedSourceId) {
            setSelectedSourceId(nodeId);
          } else {
            if (selectedSourceId !== nodeId) {
              onAddEdge(selectedSourceId, nodeId, 5); // Default weight 5
              setSelectedSourceId(null);
            } else {
              // Clicked same node, toggle off
              setSelectedSourceId(null);
            }
          }
        }
      } else if (target.isEdge()) {
        const edgeId = target.id();
        if (mode === 'delete') {
          onDeleteEdge(edgeId);
        } else {
          // Double-tap or standard selected weight prompt
          // Get the midpoint of the edge for placing input
          const midpoint = target.midpoint();
          const weight = target.data('weight');
          setEditingEdge({
            id: edgeId,
            weight: Number(weight),
            x: midpoint.x,
            y: midpoint.y,
          });
        }
      }
    });

    // Populate data init
    syncGraphData();
  };

  // Sync graph data (nodes and edges) from React state into Cytoscape
  function syncGraphData() {
    const cy = cyRef.current;
    if (!cy) return;

    // Batch updates to avoid visual lag
    cy.startBatch();

    // Remove obsolete nodes/edges
    const existingNodeIds = new Set(graph.nodes.map((n) => n.id));
    const existingEdgeIds = new Set(graph.edges.map((e) => e.id));

    cy.nodes().forEach((node: any) => {
      if (!existingNodeIds.has(node.id())) {
        cy.remove(node);
      }
    });

    cy.edges().forEach((edge: any) => {
      if (!existingEdgeIds.has(edge.id())) {
        cy.remove(edge);
      }
    });

    // Update or add nodes
    graph.nodes.forEach((node) => {
      const cyNode = cy.getElementById(node.id);
      if (cyNode.length > 0) {
        // Node exists, update position & label
        // Only update position if we are not actively dragging it in Cy to avoid loop issues
        if (!cyNode.grabbed()) {
          cyNode.position({ x: node.x, y: node.y });
        }
        cyNode.data('label', node.label);
      } else {
        // Add new node
        cy.add({
          group: 'nodes',
          data: { id: node.id, label: node.label },
          position: { x: node.x, y: node.y },
        });
      }
    });

    // Update or add edges
    graph.edges.forEach((edge) => {
      const cyEdge = cy.getElementById(edge.id);
      if (cyEdge.length > 0) {
        cyEdge.data('weight', edge.weight);
      } else {
        cy.add({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            weight: edge.weight,
          },
        });
      }
    });

    cy.endBatch();
  }

  // Keep cytoscape elements updated when react graph state updates
  useEffect(() => {
    syncGraphData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  // Handle active selected highlights in addEdge mode
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('source-highlight');
    if (selectedSourceId) {
      const cyNode = cy.getElementById(selectedSourceId);
      if (cyNode.length > 0) {
        cyNode.addClass('source-highlight');
      }
    }
  }, [selectedSourceId]);

  // Adjust style changes depending on whether timeline animation is active!
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // 1. Reset visual classes
    cy.nodes().classes([]);
    cy.edges().classes([]);

    if (isAnimationActive && currentStep) {
      // Apply Node Overrides
      Object.entries(currentStep.nodeStates).forEach(([nodeId, state]) => {
        const cyNode = cy.getElementById(nodeId);
        if (cyNode.length > 0) {
          cyNode.addClass(`node-${state}`);
        }
      });

      // Apply Edge Overrides
      Object.entries(currentStep.edgeStates).forEach(([edgeId, state]) => {
        const cyEdge = cy.getElementById(edgeId);
        if (cyEdge.length > 0) {
          cyEdge.addClass(`edge-${state}`);
        }
      });
    }

    // Update stylesheet rules on the fly for animation support
    cy.style()
      // Animation Node Styling
      .selector('.node-active')
      .style({
        'background-color': '#fef3c7', // Warm Amber fill
        'border-color': '#f59e0b', // Amber-500 border
        'border-width': '3px',
        'color': '#92400e', // Dark Amber text
      })
      .selector('.node-visited')
      .style({
        'border-color': '#10b981', // Emerald border
        'border-width': '3px',
        'background-color': '#ecfdf5', // Light emerald tint to highlight MST Nodes
      })
      .selector('.node-neutral')
      .style({
        'background-color': '#ffffff',
        'border-color': '#94a3b8',
        'border-width': '2px',
      })
      // Custom edge highlights
      .selector('.edge-candidate')
      .style({
        'line-color': '#f59e0b', // Amber-500
        'width': '4px',
        'line-style': 'dashed',
      })
      .selector('.edge-accepted')
      .style({
        'line-color': '#10b981', // Emerald-500
        'width': '4px',
        'line-style': 'solid',
      })
      .selector('.edge-rejected')
      .style({
        'line-color': '#ef4444', // Red-500
        'width': '2.5px',
        'line-style': 'dotted',
        'color': '#ef4444',
      })
      .selector('.edge-neutral')
      .style({
        'line-color': '#f1f5f9', // Very dimmed neutral slate since it's inactive
        'width': '1.5px',
        'opacity': 0.4,
      })
      // Custom edit state helpers
      .selector('.source-highlight')
      .style({
        'border-color': '#4f46e5', // Deep Indigo source highlight
        'border-width': '3.5px',
        'background-color': '#e0e7ff',
      })
      .update();
  }, [isAnimationActive, currentStep]);

  // Automatically fit nodes to canvas viewport if size changes or standard elements reset
  const handleAutoLayout = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.animate({
      fit: { padding: 40 },
      duration: 350,
      easing: 'ease-out-cubic',
    });
  };

  const saveEdgeWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEdge) {
      onUpdateEdgeWeight(editingEdge.id, editingEdge.weight);
      setEditingEdge(null);
    }
  };

  return (
    <div className="flex-1 min-h-[400px] w-full relative bg-[#f8fafc] border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Dynamic Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 0)',
          backgroundSize: '30px 30px',
        }}
      />

      {/* Mode Selector Panel */}
      {!isAnimationActive && (
        <div id="workspace-modes-toolbar" className="absolute top-4 left-4 z-10 flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button
            id="mode-select-btn"
            title="Drag / Edit Mode"
            onClick={() => {
              onChangeMode('select');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-2 rounded-lg transition-all',
              mode === 'select'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Move className="w-4 h-4" />
          </button>
          
          <button
            id="mode-node-btn"
            title="Insert Node"
            onClick={() => {
              onChangeMode('addNode');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-2 rounded-lg transition-all',
              mode === 'addNode'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <PlusCircle className="w-4 h-4" />
          </button>

          <button
            id="mode-edge-btn"
            title="Connect Nodes"
            onClick={() => onChangeMode('addEdge')}
            className={cn(
              'p-2 rounded-lg transition-all',
              mode === 'addEdge'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            id="mode-delete-btn"
            title="Delete Elements"
            onClick={() => {
              onChangeMode('delete');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-2 rounded-lg transition-all',
              mode === 'delete'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Instructions label depending on mode */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        {isAnimationActive ? (
          <span className="text-indigo-600 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
            Animation Active
          </span>
        ) : mode === 'select' ? (
          <span>Select Edge to change Weight • Drag Node</span>
        ) : mode === 'addNode' ? (
          <span className="text-emerald-600 font-bold">Tap Canvas to Drop Node</span>
        ) : mode === 'addEdge' ? (
          selectedSourceId ? (
            <span className="text-indigo-600 animate-pulse font-bold">Tap second Node to Connect</span>
          ) : (
            <span>Tap First Node to Connect</span>
          )
        ) : (
          <span className="text-red-600 font-bold">Tap Node/Edge to Destroy</span>
        )}
      </div>

      {/* Cytoscape Container Anchor */}
      <div id="cytoscape-element-root" ref={containerRef} className="w-full h-full cursor-crosshair min-h-[420px]" />

      {/* Floating Weight Editor Modal */}
      {editingEdge && (
        <div
          style={{
            position: 'absolute',
            left: `${editingEdge.x - 55}px`,
            top: `${editingEdge.y - 45}px`,
          }}
          className="z-20 bg-white p-2.5 rounded-xl shadow-xl border border-slate-200 w-28 absolute transition-all duration-300 animate-in fade-in zoom-in-90"
        >
          <form onSubmit={saveEdgeWeight} className="space-y-1.5">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Set Weight</label>
            <div className="flex gap-1.5 items-center">
              <input
                id="edge-weight-input-box"
                type="number"
                min="1"
                max="99"
                value={editingEdge.weight}
                onChange={(e) =>
                  setEditingEdge((prev) =>
                    prev ? { ...prev, weight: parseInt(e.target.value) || 1 } : null
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 px-1.5 py-1 text-xs font-mono font-bold text-slate-700 rounded-md focus:outline-none focus:border-indigo-400 focus:bg-white"
                autoFocus
              />
              <button
                type="submit"
                className="h-7 w-7 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 focus:outline-none shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar Options on Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleAutoLayout}
          className="h-9 px-3.5 bg-white border border-slate-200 rounded-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:border-indigo-300 transition-colors bg-white/95"
          title="Zoom to Fit Nodes"
        >
          Fit Viewport
        </button>
      </div>
    </div>
  );
}
