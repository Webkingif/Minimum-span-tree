'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphData, VisualizerStep } from '@/types/graph';
import { Trash2, Edit3, PlusCircle, ArrowUpRight, Move } from 'lucide-react';
import { cn } from '@/lib/utils';
import cytoscape from 'cytoscape';

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
  isMobile?: boolean;
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
  isMobile = false,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Maintain up-to-date refs for Cytoscape event handlers to completely bypass design-time stale closures
  const stateRef = useRef({ graph, isAnimationActive, mode, selectedSourceId });
  useEffect(() => {
    stateRef.current = { graph, isAnimationActive, mode, selectedSourceId };
  }, [graph, isAnimationActive, mode, selectedSourceId]);
  
  // Weight editor state
  const [editingEdge, setEditingEdge] = useState<{ id: string; weight: number; x: number; y: number } | null>(null);

  // Double tapped node state for edge creation
  const [doubleTappedNodeId, setDoubleTappedNodeId] = useState<string | null>(null);
  const [selectedTargetNodeId, setSelectedTargetNodeId] = useState<string>('');
  const [newEdgeWeight, setNewEdgeWeight] = useState<number>(5);

  // Sync / Clean up double-tapped selection if that node gets deleted
  useEffect(() => {
    if (doubleTappedNodeId) {
      const exists = graph.nodes.some((n) => n.id === doubleTappedNodeId);
      if (!exists) {
        const timer = setTimeout(() => {
          setDoubleTappedNodeId(null);
          setSelectedTargetNodeId('');
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [graph.nodes, doubleTappedNodeId]);

  // Initialize Cytoscape.js once on client-side
  useEffect(() => {
    initCytoscape();

    // Windows resize listener
    const handleWindowResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  function initCytoscape() {
    if (!containerRef.current || !cytoscape) return;

    const nodeWidth = isMobile ? '46px' : '38px';
    const nodeHeight = isMobile ? '46px' : '38px';
    const nodeFontSize = isMobile ? '13px' : '11px';
    const edgeWidth = isMobile ? '3px' : '2px';
    const edgeFontSize = isMobile ? '12px' : '11px';
    const edgePadding = isMobile ? '4.5px' : '3px';

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
            'font-size': nodeFontSize,
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': nodeWidth,
            'height': nodeHeight,
            'transition-property': 'background-color, border-color, border-width, box-shadow',
            'transition-duration': 150,
          },
        },
        {
          selector: 'edge',
          style: {
            'label': 'data(weight)',
            'width': edgeWidth,
            'line-color': '#cbd5e1', // Slate-300
            'font-size': edgeFontSize,
            'font-weight': 'bold',
            'color': '#475569', // Slate-600
            'text-background-opacity': 1,
            'text-background-color': '#ffffff',
            'text-background-padding': edgePadding,
            'text-background-shape': 'roundrectangle',
            'text-margin-y': -2,
            'curve-style': 'haystack', // High performance straight lines
            'transition-property': 'line-color, width, line-style',
            'transition-duration': 150,
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
          selector: '.node-doubletapped',
          style: {
            'background-color': '#fef08a', // vibrant yellow background (yellow-200)
            'border-color': '#eab308', // yellow-500 border
            'border-width': '4px',
            'color': '#854d0e', // yellow-800 text
          },
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#6366f1',
            'width': isMobile ? '4.5px' : '3px',
          },
        },
      ],
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
    });

    // Handle Drag ends
    cyRef.current.on('free', 'node', (evt: any) => {
      if (stateRef.current.isAnimationActive) return;
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

      if (stateRef.current.isAnimationActive) return;

      if (isCanvas) {
        if (stateRef.current.mode === 'addNode') {
          const renderedPos = evt.position;
          onAddNode(renderedPos.x, renderedPos.y);
        }
        setSelectedSourceId(null);
      } else if (target.isNode()) {
        const nodeId = target.id();

        if (stateRef.current.mode === 'delete') {
          onDeleteNode(nodeId);
          setSelectedSourceId(null);
        } else if (stateRef.current.mode === 'addEdge') {
          if (!stateRef.current.selectedSourceId) {
            setSelectedSourceId(nodeId);
          } else {
            if (stateRef.current.selectedSourceId !== nodeId) {
              onAddEdge(stateRef.current.selectedSourceId, nodeId, 5); // Default weight 5
              setSelectedSourceId(null);
            } else {
              // Clicked same node, toggle off
              setSelectedSourceId(null);
            }
          }
        }
      } else if (target.isEdge()) {
        const edgeId = target.id();
        if (stateRef.current.mode === 'delete') {
          onDeleteEdge(edgeId);
        } else {
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

    // Handle double tap/click on Canvas or on Nodes
    cyRef.current.on('dbltap', (evt: any) => {
      if (stateRef.current.isAnimationActive) return;
      const target = evt.target;
      const isCanvas = target === cyRef.current;

      if (isCanvas) {
        if (stateRef.current.mode !== 'addNode') {
          const renderedPos = evt.position;
          onAddNode(renderedPos.x, renderedPos.y);
          setSelectedSourceId(null);
        }
      } else if (target !== cyRef.current && typeof target.isNode === 'function' && target.isNode()) {
        const nodeId = target.id();
        setDoubleTappedNodeId(nodeId);
        // Pre-select the first other node if existing
        const otherNodes = stateRef.current.graph.nodes.filter((n) => n.id !== nodeId);
        if (otherNodes.length > 0) {
          setSelectedTargetNodeId(otherNodes[0].id);
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
      // Safely verify that both source and target node elements exist in cytoscape before rendering edge
      const sourceNode = cy.getElementById(edge.source);
      const targetNode = cy.getElementById(edge.target);
      if (sourceNode.length === 0 || targetNode.length === 0) {
        return;
      }

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

    if (!isAnimationActive && doubleTappedNodeId) {
      const cyNode = cy.getElementById(doubleTappedNodeId);
      if (cyNode.length > 0) {
        cyNode.addClass('node-doubletapped');
      }
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
        'line-color': '#f59e0b', // Dashed golden/amber color
        'width': '3.5px',
        'line-style': 'dashed',
        'color': '#b45309', // Amber-700
        'text-background-color': '#fef3c7', // Soft amber background
        'text-background-opacity': 1,
        'text-background-padding': '4px',
      })
      .selector('.edge-accepted')
      .style({
        'line-color': '#10b981', // Vibrant emerald green
        'width': '5px', // Bold 5px and distinct
        'line-style': 'solid',
        'color': '#047857', // Deep green for high-contrast legible weight label
        'text-background-color': '#ecfdf5', // Soft light green highlight badge to isolate weight label
        'text-background-opacity': 1,
        'text-background-padding': '4px',
      })
      .selector('.edge-rejected')
      .style({
        'line-color': '#ef4444', // Thin, dotted red lines
        'width': '2px',
        'line-style': 'dotted',
        'color': '#b91c1c', // Red-700
        'text-background-color': '#fee2e2', // Soft red background
        'text-background-opacity': 1,
        'text-background-padding': '4px',
      })
      .selector('.edge-neutral')
      .style({
        'line-color': '#cbd5e1', // Highly desaturated neutral slate (using a slightly darker gray than pure white-ish f1f5f9 for good text legibility)
        'width': '1.5px', // thin
        'opacity': 0.4, // partially translucent
        'color': '#64748b',
        'text-background-color': '#ffffff',
        'text-background-opacity': 0.4,
      })
      // Custom edit state helpers
      .selector('.source-highlight')
      .style({
        'border-color': '#4f46e5', // Deep Indigo source highlight
        'border-width': '3.5px',
        'background-color': '#e0e7ff',
      })
      .selector('.node-doubletapped')
      .style({
        'background-color': '#fef08a', // vibrant yellow background (yellow-200)
        'border-color': '#eab308', // yellow-500 border
        'border-width': '4px',
        'color': '#854d0e', // yellow-800 text
      })
      .update();
  }, [isAnimationActive, currentStep, isMobile, doubleTappedNodeId]);

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
        <div
          id="workspace-modes-toolbar"
          className="absolute top-4 left-4 z-20 flex gap-1.5 bg-white p-1.5 sm:p-1 rounded-2xl sm:rounded-xl shadow-md sm:shadow-sm border border-slate-150 sm:border-slate-100"
        >
          <button
            id="mode-select-btn"
            title="Drag / Edit Mode"
            onClick={() => {
              onChangeMode('select');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-3.5 sm:p-2 rounded-xl sm:rounded-lg transition-all cursor-pointer',
              mode === 'select'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Move className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
          
          <button
            id="mode-node-btn"
            title="Insert Node"
            onClick={() => {
              onChangeMode('addNode');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-3.5 sm:p-2 rounded-xl sm:rounded-lg transition-all cursor-pointer',
              mode === 'addNode'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          <button
            id="mode-edge-btn"
            title="Connect Nodes"
            onClick={() => onChangeMode('addEdge')}
            className={cn(
              'p-3.5 sm:p-2 rounded-xl sm:rounded-lg transition-all cursor-pointer',
              mode === 'addEdge'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <ArrowUpRight className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          <button
            id="mode-delete-btn"
            title="Delete Elements"
            onClick={() => {
              onChangeMode('delete');
              setSelectedSourceId(null);
            }}
            className={cn(
              'p-3.5 sm:p-2 rounded-xl sm:rounded-lg transition-all cursor-pointer',
              mode === 'delete'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      {/* Instructions label depending on mode */}
      <div className="absolute top-20 left-4 sm:top-4 sm:left-auto sm:right-4 z-10 pointer-events-none bg-white/95 backdrop-blur-sm px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-lg border border-slate-150 sm:border-slate-100 shadow-sm text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
        isMobile ? (
          // Swipe-friendly backdrop modal overlay for Mobile devices
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 animate-in slide-in-from-bottom duration-300 pb-8 text-left select-none">
              <form onSubmit={saveEdgeWeight} className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connection Cost</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEdge(null);
                      if (cyRef.current) cyRef.current.$(':selected').unselect();
                    }}
                    className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="space-y-3 pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Edge Weight (1 - 99)</label>
                  <div className="flex gap-3">
                    <input
                      id="edge-weight-input-box-mobile"
                      type="number"
                      min="1"
                      max="99"
                      value={editingEdge.weight}
                      onChange={(e) =>
                        setEditingEdge((prev) =>
                          prev ? { ...prev, weight: parseInt(e.target.value, 10) || 1 } : null
                        )
                      }
                      className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3.5 text-xl font-mono font-bold text-slate-800 rounded-2xl focus:outline-none focus:border-indigo-400 focus:bg-white text-center"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-750 font-bold text-sm shadow-lg shadow-indigo-100 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      <Edit3 className="w-4 h-4 mr-1.5" /> Save
                    </button>
                  </div>
                </div>

                {/* Instant select helper increments for mobile thumbs */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {[1, 5, 10, 25].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setEditingEdge((prev) =>
                          prev ? { ...prev, weight: prev.weight + val <= 99 ? prev.weight + val : 99 } : null
                        );
                      }}
                      className="py-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-mono font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95 transition-all"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </div>
        ) : (
          // Classic absolute-positioned desktop tooltip
          <div
            style={{
              position: 'absolute',
              left: `${editingEdge.x - 55}px`,
              top: `${editingEdge.y - 45}px`,
            }}
            className="z-20 bg-white p-2.5 rounded-xl shadow-xl border border-slate-250 w-28 absolute transition-all duration-300 animate-in fade-in zoom-in-90"
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
        )
      )}

      {/* Double-tap Connection Modal Overlay */}
      {doubleTappedNodeId && (
        <div id="connect-node-modal-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div
            id="connect-node-modal-container"
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-200 relative text-left"
          >
            <h3 id="connect-modal-title" className="text-base font-bold text-slate-800 mb-1">
              Create New Edge
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select which node you want to connect <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                Node {graph.nodes.find((n) => n.id === doubleTappedNodeId)?.label || ''}
              </span> with.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedTargetNodeId) {
                  onAddEdge(doubleTappedNodeId, selectedTargetNodeId, newEdgeWeight);
                  setDoubleTappedNodeId(null);
                  setSelectedTargetNodeId('');
                  setNewEdgeWeight(5);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Target Node
                </label>
                <select
                  id="target-node-select"
                  value={selectedTargetNodeId}
                  onChange={(e) => setSelectedTargetNodeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  {graph.nodes.filter((n) => n.id !== doubleTappedNodeId).length === 0 ? (
                    <option value="">No other nodes to connect to</option>
                  ) : (
                    graph.nodes
                      .filter((n) => n.id !== doubleTappedNodeId)
                      .map((node) => (
                        <option key={node.id} value={node.id}>
                          Node {node.label}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Edge Weight (1 - 99)
                </label>
                <input
                  id="target-node-weight-input"
                  type="number"
                  min="1"
                  max="99"
                  value={newEdgeWeight}
                  onChange={(e) => setNewEdgeWeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-mono font-bold text-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDoubleTappedNodeId(null);
                    setSelectedTargetNodeId('');
                    setNewEdgeWeight(5);
                  }}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTargetNodeId}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-100 transition-all cursor-pointer text-center"
                >
                  Add Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toolbar Options on Bottom Right */}
      <div className="absolute bottom-4 right-4 z-15 flex gap-2">
        <button
          onClick={handleAutoLayout}
          className="h-12 px-5 sm:h-9 sm:px-3.5 bg-white border border-slate-250 sm:border-slate-200 rounded-2xl sm:rounded-full flex items-center justify-center gap-1.5 text-xs font-bold sm:font-semibold text-slate-700 sm:text-slate-600 shadow-md sm:shadow-sm hover:border-indigo-300 transition-all cursor-pointer bg-white/95"
          title="Zoom to Fit Nodes"
        >
          Fit Viewport
        </button>
      </div>
    </div>
  );
}
