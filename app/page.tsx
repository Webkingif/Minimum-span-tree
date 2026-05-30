'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import Footer from '@/components/layout/footer';

const Canvas = dynamic(() => import('@/components/visualizer/canvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-50 rounded-3xl border border-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading Canvas...</span>
      </div>
    </div>
  ),
});
import Pseudocode from '@/components/visualizer/pseudocode';
import ReusableStatsPanel from '@/components/visualizer/stats-panel';
import CompletionModal from '@/components/visualizer/completion-modal';
import { useGraphState } from '@/hooks/use-graph-state';
import { useVisualizerTimeline } from '@/hooks/use-visualizer-timeline';
import { KruskalAlgorithm } from '@/lib/algorithms/kruskal';
import { PrimAlgorithm } from '@/lib/algorithms/prim';
import { VisualizerStep } from '@/types/graph';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'trace' | 'code' | 'stats' | 'presets'>('trace');

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

  const handleReopenCompletionModal = () => {
    if (status !== 'completed' && totalSteps > 0) {
      setStepIndex(totalSteps - 1);
    }
    setHasDismissedCompletedModal(false);
  };

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

  // Render the Mobile layout
  if (isMobile) {
    const descriptionText = currentStep
      ? currentStep.description
      : 'Graph Sandbox Active. Draw custom node-weighted topologies above to begin.';

    return (
      <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden leading-normal relative select-none">
        {/* Compact Mobile Top Header Navigator */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-100">
              <span className="text-[10px] font-black leading-none">MST</span>
            </div>
            <div>
              <h1 className="text-xs font-extrabold tracking-tight text-slate-800">
                MST Visualizer
              </h1>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Mobile Lab</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              id="mobile-help-link"
              href="/help"
              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-all cursor-pointer"
              title="Help and Guides"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            </Link>
            {/* Quick Engine Switcher Toggle Pill */}
            <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200/40 flex items-center">
              <button
                onClick={() => {
                  reset();
                  setAlgorithm('kruskal');
                }}
                className={cn(
                  "px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer",
                  algorithm === 'kruskal' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                )}
              >
                Kruskal
              </button>
              <button
                onClick={() => {
                  reset();
                  setAlgorithm('prim');
                }}
                className={cn(
                  "px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all cursor-pointer",
                  algorithm === 'prim' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                )}
              >
                Prim
              </button>
            </div>

            {/* Live Weight Score badge */}
            <div className="bg-emerald-50 border border-emerald-100/60 flex items-center gap-1 px-2.5 py-1.5 rounded-xl">
              <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wide">Cst</span>
              <span className="font-mono text-xs font-black text-emerald-700">{activeMstCost}</span>
            </div>

            {isAnimationActive && (
              <div className="flex gap-1.5 items-center">
                <button
                  id="mobile-reopen-modal-btn"
                  onClick={handleReopenCompletionModal}
                  className="bg-emerald-50 border border-emerald-150 rounded-xl px-2.5 py-1.5 flex items-center gap-1 text-[9px] font-extrabold uppercase cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  🏆 Summary
                </button>
                <button
                  id="mobile-reset-env-btn"
                  onClick={reset}
                  className="bg-rose-50 border border-rose-150 text-rose-700 rounded-xl px-2.5 py-1.5 flex items-center gap-1 text-[9px] font-extrabold uppercase cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  🔄 Reset Env
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Hero Cytoscape Sandbox Area */}
        <main className="flex-1 relative bg-slate-50/50 flex flex-col p-3 pb-24 min-h-0 z-0">
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
            isMobile={true}
            onReopenModal={handleReopenCompletionModal}
            onResetEnv={reset}
          />
        </main>

        {/* Swipeable Drawer Dashboard Panel (Thumb Sized) */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-[0_-10px_35px_rgba(0,0,0,0.06)] flex flex-col pointer-events-auto">
          {/* Vertical Pull Selector Anchor Grab Handle */}
          <div 
            onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
            className="w-full py-2 flex items-center justify-center cursor-pointer hover:bg-slate-50"
          >
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* Player controls row */}
          <div className="px-4 pb-4 pt-1 flex items-center gap-3">
            {/* Play Trigger */}
            {status === 'playing' ? (
              <button
                id="mobile-playback-pause-btn"
                onClick={pause}
                disabled={!hasTimeline}
                className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-150 cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="font-mono font-black text-sm">||</span>
              </button>
            ) : (
              <button
                id="mobile-playback-play-btn"
                onClick={play}
                disabled={!hasTimeline}
                className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-150 disabled:opacity-50 cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-all"
              >
                <span className="font-mono font-black text-xs">▶</span>
              </button>
            )}

            {/* Micro Stepper range scroller */}
            <div className="flex-1 flex flex-col justify-center space-y-1">
              <div className="flex justify-between items-center text-[8px] font-black text-slate-400 font-mono uppercase">
                <span>Step {currentStepIndex}</span>
                <span>{hasTimeline ? `Total ${totalSteps - 1}` : 'Sandbox'}</span>
              </div>
              <div className="relative flex items-center h-2">
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, totalSteps - 1)}
                  value={currentStepIndex}
                  disabled={!hasTimeline}
                  onChange={(e) => setStepIndex(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-200 accent-indigo-600 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Info toggle expansion button */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={cn(
                "px-3.5 py-2.5 bg-slate-100 hover:bg-slate-250 text-slate-700 border border-slate-200/60 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0 select-none transition-all",
                isDrawerOpen && "bg-indigo-50 border-indigo-200 text-indigo-700 font-black shadow-xs shadow-indigo-50"
              )}
            >
              Info {isDrawerOpen ? '▼' : '▲'}
            </button>
          </div>

          {/* Slide out expandable container */}
          <AnimatePresence>
            {isDrawerOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: '260px', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                className="border-t border-slate-150 bg-slate-50 flex flex-col overflow-hidden"
              >
                {/* Horizontal Sliding Tab Headers */}
                <div className="flex border-b border-slate-200 bg-white shadow-xs shrink-0 select-none">
                  {[
                    { key: 'trace', label: 'Trace' },
                    { key: 'code', label: 'Code' },
                    { key: 'stats', label: 'Stats' },
                    { key: 'presets', label: 'Graph' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setMobileTab(tab.key as any)}
                      className={cn(
                        "flex-1 py-3 text-center text-[10px] font-black uppercase tracking-widest cursor-pointer border-b-2 transition-all",
                        mobileTab === tab.key
                          ? "border-indigo-600 text-indigo-700 bg-indigo-50/10 font-black"
                          : "border-transparent text-slate-400 font-bold hover:text-slate-600"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Switchable Bodies viewport */}
                <div className="flex-1 p-4.5 overflow-y-auto overflow-x-hidden min-h-0">
                  {mobileTab === 'trace' && (
                    <div className="space-y-3.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          Step Explanation
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-extrabold bg-slate-200/60 px-2 py-0.5 rounded-sm">
                          Marker {currentStepIndex}
                        </span>
                      </div>
                      
                      <div className="bg-white border border-slate-150/50 p-4 rounded-2xl shadow-xs flex items-start gap-3">
                        <span className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-xs font-mono font-black text-indigo-600 shrink-0">
                          {currentStepIndex}
                        </span>
                        <div className="space-y-1">
                          <p className="text-xs font-bold leading-snug text-slate-800">{descriptionText}</p>
                          {currentStep?.subDescription && (
                            <p className="text-[10px] text-slate-450 leading-relaxed font-medium italic pt-1.5 border-t border-dashed border-slate-100 mt-1">{currentStep.subDescription}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {mobileTab === 'code' && (
                    <div className="h-full flex flex-col justify-start">
                      <Pseudocode
                        algorithm={algorithm}
                        currentStep={currentStep}
                        hasTimeline={hasTimeline}
                      />
                    </div>
                  )}

                  {mobileTab === 'stats' && (
                    <div className="h-full flex flex-col justify-start">
                      <ReusableStatsPanel
                        algorithm={algorithm}
                        graph={graph}
                        currentStep={currentStep}
                        hasTimeline={hasTimeline}
                        totalSteps={totalSteps}
                      />
                    </div>
                  )}

                  {mobileTab === 'presets' && (
                    <div className="space-y-4 text-left">
                      {/* Presets Grid */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          Load Presets
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              reset();
                              loadPreset('default');
                              setIsDrawerOpen(false);
                            }}
                            disabled={isAnimationActive}
                            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded-xl font-bold flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Explore (6 Nodes)
                          </button>
                          <button
                            onClick={() => {
                              reset();
                              loadPreset('simpleCycle');
                              setIsDrawerOpen(false);
                            }}
                            disabled={isAnimationActive}
                            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded-xl font-bold flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Ring (5 Nodes)
                          </button>
                          <button
                            onClick={() => {
                              reset();
                              loadPreset('sparse');
                              setIsDrawerOpen(false);
                            }}
                            disabled={isAnimationActive}
                            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded-xl font-bold flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Sparse (4 Nodes)
                          </button>
                          <button
                            onClick={() => {
                              reset();
                              clearGraph();
                              setIsDrawerOpen(false);
                            }}
                            disabled={isAnimationActive}
                            className="p-3 bg-red-50 hover:bg-red-100/30 border border-red-150 text-red-600 text-[10px] rounded-xl font-bold flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer"
                          >
                            Reset Workspace
                          </button>
                        </div>
                      </div>

                      {/* Speed Buttons */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">
                          Simulation Speeds
                        </label>
                        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-150">
                          {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
                            <button
                              key={val}
                              onClick={() => setSpeed(val)}
                              className={cn(
                                "flex-1 py-2 text-center text-xs font-mono font-bold rounded-lg transition-all cursor-pointer",
                                speed === val ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              {val}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Playback Completion Modal */}
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

  // Fallback / Premium Desktop Layout
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-900 md:border-8 md:border-slate-200 border-0 overflow-hidden leading-normal">
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
          onReopenModal={handleReopenCompletionModal}
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
              isMobile={false}
              onReopenModal={handleReopenCompletionModal}
              onResetEnv={reset}
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
