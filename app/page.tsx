'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import Footer from '@/components/layout/footer';
import Canvas from '@/components/visualizer/canvas';
import Pseudocode from '@/components/visualizer/pseudocode';
import ReusableStatsPanel from '@/components/visualizer/stats-panel';
import CompletionModal from '@/components/visualizer/completion-modal';
import { useGraphState } from '@/hooks/use-graph-state';
import { useVisualizerTimeline } from '@/hooks/use-visualizer-timeline';
import { KruskalAlgorithm } from '@/lib/algorithms/kruskal';
import { PrimAlgorithm } from '@/lib/algorithms/prim';
import { VisualizerStep } from '@/types/graph';

export default function Home() {
  const [algorithm, setAlgorithm] = useState<'kruskal' | 'prim'>('kruskal');
  const [workspaceMode, setWorkspaceMode] = useState<'select' | 'addNode' | 'addEdge' | 'delete'>('select');

  // Load custom graph state hook (Preset default selected)
  const {
    graph,
    addNode,
    updateNodePosition,
    deleteNode,
    addEdge,
    updateEdgeWeight,
    deleteEdge,
    clearGraph,
    loadPreset,
  } = useGraphState('default');

  // Initialize Algorithm Compilers
  const kruskalCompiler = useMemo(() => new KruskalAlgorithm(), []);
  const primCompiler = useMemo(() => new PrimAlgorithm(), []);

  // Compute the entire Step Timeline dynamically using the Snapshot Pattern
  const timeline = useMemo<VisualizerStep[]>(() => {
    // If empty graph, return empty timeline
    if (graph.nodes.length === 0) return [];

    try {
      if (algorithm === 'kruskal') {
        return kruskalCompiler.generateSteps(graph);
      } else {
        // For Prim, dynamically start on the first node available in the array
        const defaultStartId = graph.nodes[0]?.id;
        return primCompiler.generateSteps(graph, defaultStartId);
      }
    } catch (err) {
      console.error('Error generating algorithm steps:', err);
      return [];
    }
  }, [graph, algorithm, kruskalCompiler, primCompiler]);

  // Load playback timeline manager hook
  const {
    currentStepIndex,
    currentStep,
    status,
    speed,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    setSpeed,
    setStepIndex,
    hasTimeline,
    totalSteps,
  } = useVisualizerTimeline(timeline);

  // Render-time status tracking to avoid cascading effect renders
  const [prevStatus, setPrevStatus] = useState(status);
  const [hasDismissedCompletedModal, setHasDismissedCompletedModal] = useState<boolean>(false);

  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status !== 'completed') {
      setHasDismissedCompletedModal(false);
    }
  }

  const isModalOpen = status === 'completed' && !hasDismissedCompletedModal;

  const isAnimationActive = status === 'playing' || status === 'paused' || status === 'completed';
  const effectiveMode = isAnimationActive ? 'select' : workspaceMode;

  // Helper displays for side banners
  const selectedAlgoDetail = useMemo(() => {
    if (algorithm === 'kruskal') {
      return {
        name: "Kruskal's Engine",
        short: 'Kruskal',
      };
    }
    return {
      name: "Prim's Engine",
      short: 'Prim',
    };
  }, [algorithm]);

  // Compute final MST Cost from current frame snapshot
  const activeMstCost = useMemo(() => {
    if (isAnimationActive && currentStep) {
      return currentStep.totalMstCost;
    }
    return 0;
  }, [isAnimationActive, currentStep]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-900 border-8 border-slate-200 overflow-hidden leading-normal">
      {/* Visual Navigation Header */}
      <Header
        algorithm={algorithm}
        onChangeAlgorithm={setAlgorithm}
        nodeCount={graph.nodes.length}
        edgeCount={graph.edges.length}
        mstCost={activeMstCost}
        isAnimationActive={isAnimationActive}
        onResetAnimation={reset}
      />

      {/* Main split work chamber */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* Left Hand Execution Console */}
        <Sidebar
          status={status}
          speed={speed}
          onSpeedChange={setSpeed}
          onPlay={play}
          onPause={pause}
          onReset={reset}
          onNextStep={nextStep}
          onPrevStep={prevStep}
          hasTimeline={hasTimeline}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          onLoadPreset={(key) => {
            reset();
            loadPreset(key);
          }}
          onClearGraph={() => {
            reset();
            clearGraph();
          }}
          isAnimationActive={isAnimationActive}
          algorithmName={selectedAlgoDetail.short}
        />

        {/* Center Sandbox Canvas */}
        <main className="flex-1 relative p-6 flex flex-row gap-6 bg-slate-50/50 min-w-0">
          
          {/* Main Cytoscape Canvas view */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            <Canvas
              graph={graph}
              currentStep={currentStep}
              mode={effectiveMode}
              onChangeMode={setWorkspaceMode}
              onAddNode={addNode}
              onUpdateNodePosition={updateNodePosition}
              onDeleteNode={deleteNode}
              onAddEdge={addEdge}
              onUpdateEdgeWeight={updateEdgeWeight}
              onDeleteEdge={deleteEdge}
              isAnimationActive={isAnimationActive}
            />
          </div>

          {/* Right Hand Pseudocode Trace & Statistics Board */}
          <div className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-1">
            <Pseudocode
              algorithm={algorithm}
              currentStep={currentStep}
              hasTimeline={hasTimeline}
            />
            
            <ReusableStatsPanel
              algorithm={algorithm}
              graph={graph}
              currentStep={currentStep}
              hasTimeline={hasTimeline}
              totalSteps={totalSteps}
            />
          </div>
        </main>
      </div>

      {/* Step Explanation Terminal with integrated Scrubber */}
      <Footer
        currentStep={currentStep}
        algorithm={algorithm}
        hasTimeline={hasTimeline}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        onStepIndexChange={setStepIndex}
        status={status}
      />

      {/* Congratulations Completion Modal */}
      <CompletionModal
        isOpen={isModalOpen}
        onClose={() => setHasDismissedCompletedModal(true)}
        onReset={reset}
        algorithm={algorithm}
        graph={graph}
        finalStep={timeline[timeline.length - 1] || null}
      />
    </div>
  );
}
