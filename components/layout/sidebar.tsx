'use client';

import React from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Layers, Sparkles, BarChart2, ShieldAlert } from 'lucide-react';
import { PlaybackStatus } from '@/types/graph';
import { cn } from '@/lib/utils';

interface SidebarProps {
  status: PlaybackStatus;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  hasTimeline: boolean;
  currentStepIndex: number;
  totalSteps: number;

  onLoadPreset: (presetKey: string) => void;
  onClearGraph: () => void;
  isAnimationActive: boolean;
  algorithmName: string;
}

export default function Sidebar({
  status,
  speed,
  onSpeedChange,
  onPlay,
  onPause,
  onReset,
  onNextStep,
  onPrevStep,
  hasTimeline,
  currentStepIndex,
  totalSteps,
  onLoadPreset,
  onClearGraph,
  isAnimationActive,
  algorithmName,
}: SidebarProps) {
  return (
    <aside className="w-76 border-r border-slate-200 bg-white flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="p-6 space-y-7 flex-1">
        {/* Playback Controls Section */}
        <section className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
            Execution Controls
          </label>
          
          {/* Main Action Grid */}
          <div className="grid grid-cols-2 gap-2">
            {status === 'playing' ? (
              <button
                id="playback-pause-btn"
                onClick={onPause}
                disabled={!hasTimeline}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-750 transition-all cursor-pointer shadow-md shadow-indigo-100 uppercase"
              >
                <Pause className="w-3.5 h-3.5 fill-white" /> Pause
              </button>
            ) : (
              <button
                id="playback-play-btn"
                onClick={onPlay}
                disabled={!hasTimeline}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-100 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Play
              </button>
            )}

            <button
              id="playback-reset-btn"
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Stepper & Skip Buttons */}
          <div className="flex gap-2 justify-between items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button
              id="prev-step-btn"
              onClick={onPrevStep}
              disabled={!hasTimeline || currentStepIndex === 0}
              className="p-1.5 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {hasTimeline ? `Step ${currentStepIndex}/${totalSteps - 1}` : 'No Timeline'}
            </span>

            <button
              id="next-step-btn"
              onClick={onNextStep}
              disabled={!hasTimeline || status === 'completed'}
              className="p-1.5 hover:bg-white hover:shadow-sm text-slate-500 hover:text-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Playback speed slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Playback Speed</span>
              <span className="font-mono text-indigo-600 font-bold">{speed.toFixed(1)}x</span>
            </div>
            <input
              id="speed-control-slider"
              type="range"
              min="0.5"
              max="3.0"
              step="0.5"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
          </div>
        </section>

        {/* Graph Presets Section */}
        <section className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">
            Graph Workbench
          </label>
          
          <div className="space-y-1.5">
            <button
              id="preset-default-btn"
              onClick={() => onLoadPreset('default')}
              disabled={isAnimationActive}
              className={cn(
                "w-full text-left text-xs font-semibold px-3 py-2 border rounded-xl flex items-center justify-between transition-all cursor-pointer",
                isAnimationActive ? "opacity-30 cursor-not-allowed" : "hover:border-indigo-200 hover:bg-indigo-50/20 border-slate-200"
              )}
            >
              <span>Explore Graph (6 Nodes)</span>
              <span className="text-[10px] text-slate-400 font-normal">Preset 1</span>
            </button>
            
            <button
              id="preset-cycle-btn"
              onClick={() => onLoadPreset('simpleCycle')}
              disabled={isAnimationActive}
              className={cn(
                "w-full text-left text-xs font-semibold px-3 py-2 border rounded-xl flex items-center justify-between transition-all cursor-pointer",
                isAnimationActive ? "opacity-30 cursor-not-allowed" : "hover:border-indigo-200 hover:bg-indigo-50/20 border-slate-200"
              )}
            >
              <span>Cyclic Ring (5 Nodes)</span>
              <span className="text-[10px] text-slate-400 font-normal">Preset 2</span>
            </button>

            <button
              id="preset-sparse-btn"
              onClick={() => onLoadPreset('sparse')}
              disabled={isAnimationActive}
              className={cn(
                "w-full text-left text-xs font-semibold px-3 py-2 border rounded-xl flex items-center justify-between transition-all cursor-pointer",
                isAnimationActive ? "opacity-30 cursor-not-allowed" : "hover:border-indigo-200 hover:bg-indigo-50/20 border-slate-200"
              )}
            >
              <span>Sparse Matrix (4 Nodes)</span>
              <span className="text-[10px] text-slate-400 font-normal">Preset 3</span>
            </button>
          </div>

          {!isAnimationActive && (
            <button
              id="clear-graph-workspace-btn"
              onClick={onClearGraph}
              className="w-full py-1.5 text-[10px] border border-red-100 text-red-500 font-bold rounded-lg hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer text-center uppercase tracking-wide block"
            >
              Clear Graph Workspace
            </button>
          )}
        </section>

        {/* Architecture Card */}
        <section className="pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Timeline Engine
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Algorithms compile the graph into deterministic snap-steps instantly. Scrub, pause, and travel timelines with zero rendering race conditions.
            </p>
          </div>
        </section>

        {/* Informative Tip Box */}
        <section className="pt-1">
          <div className="flex gap-2.5 p-3.5 bg-amber-50/50 border border-amber-100/50 rounded-2xl text-[11px] text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">
              <strong>Tip:</strong> Tap canvas to place nodes. Tap nodes sequentially to establish connections, or select edge to alter core path weights.
            </span>
          </div>
        </section>
      </div>

      {/* Engine Status footer inside Sidebar */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div id="engine-status-pills" className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isAnimationActive ? 'Simulation Run' : 'Engine Standby'}
          </span>
        </div>
        <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
          {isAnimationActive ? algorithmName : 'IDLE'}
        </div>
      </div>
    </aside>
  );
}
