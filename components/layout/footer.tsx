'use client';

import React from 'react';
import { VisualizerStep, PlaybackStatus } from '@/types/graph';
import { HelpCircle, BarChart2, BookOpen, SkipForward, Landmark, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  currentStep: VisualizerStep | null;
  algorithm: 'kruskal' | 'prim';
  hasTimeline: boolean;
  currentStepIndex: number;
  totalSteps: number;
  onStepIndexChange: (index: number) => void;
  status: PlaybackStatus;
}

export default function Footer({
  currentStep,
  algorithm,
  hasTimeline,
  currentStepIndex,
  totalSteps,
  onStepIndexChange,
  status,
}: FooterProps) {
  const isKruskal = algorithm === 'kruskal';

  // Safe extraction of descriptions & helper states
  const descriptionText = currentStep
    ? currentStep.description
    : 'Graph Sandbox Active. Draw a custom node-weighted network topology using the editing suite above.';
  
  const subDescriptionText = currentStep
    ? currentStep.subDescription
    : 'Click the Play controller or scrub the timeline above to visualize execution tree decisions in real time.';

  const metrics = currentStep?.metrics || { comparisons: 0, unions: 0, heapSize: 0 };

  // Calculate percentage progress metrics for tracking
  const progressPercent = totalSteps > 1
    ? (currentStepIndex / (totalSteps - 1)) * 100
    : 0;

  return (
    <footer className="h-72 bg-white border-t border-slate-200 flex flex-col shrink-0 select-none overflow-hidden">
      {/* Tilted Timeline Scrubber Slider Header spanning the entire width */}
      <div id="interactive-timeline-scrubber" className="bg-slate-50 border-b border-slate-200/60 py-3.5 px-8 flex items-center justify-between gap-6 shrink-0">
        <div className="flex items-center gap-2 shrink-0">
          <Landmark className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Timeline Progress Scrubber
          </span>
        </div>

        {/* Slider Track Wrapper */}
        <div className="flex-1 flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold text-slate-400">00</span>
          
          <div className="relative flex-1 group py-2">
            {/* Custom interactive range slider to scrub steps */}
            <input
              id="timeline-progress-slider"
              type="range"
              min="0"
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              disabled={!hasTimeline}
              onChange={(e) => onStepIndexChange(parseInt(e.target.value, 10))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              title="Scrub Simulation Step"
            />
            
            {/* Custom Background Track */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative">
              {/* Highlight Fill */}
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-100",
                  status === 'completed' ? "bg-emerald-500" : "bg-indigo-600"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Custom Track Dots (Ticks for each step) to aid micro-positioning */}
            {hasTimeline && totalSteps < 35 && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-0.5">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-1 h-1 rounded-full transition-all",
                      idx <= currentStepIndex
                        ? (status === 'completed' ? "bg-emerald-300" : "bg-indigo-300")
                        : "bg-slate-300"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono font-bold text-slate-500">
            {hasTimeline ? String(totalSteps - 1).padStart(2, '0') : '00'}
          </span>
        </div>

        {/* Current Indicator badge */}
        <div className="shrink-0 flex items-center gap-2">
          <span className={cn(
            "text-[9px] font-bold uppercase px-2 py-0.5 rounded-md",
            status === 'playing' && "bg-amber-50 text-amber-600 border border-amber-150/40 animate-pulse",
            status === 'paused' && "bg-slate-100 text-slate-500 border border-slate-200/50",
            status === 'completed' && "bg-emerald-50 text-emerald-600 border border-emerald-150/40",
            status === 'idle' && "bg-slate-100 text-slate-400"
          )}>
            {status}
          </span>
        </div>
      </div>

      {/* Main explanation body split */}
      <div className="flex-1 flex gap-8 p-6 overflow-hidden min-h-0">
        
        {/* State Logger Column */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Dynamic Explanation Engine
            </label>
            <p className="text-[10px] text-slate-400 font-medium font-sans">
              Algorithmic verification checklist of node connections
            </p>
          </div>

          {/* Console Explanations Box */}
          <div className="flex-1 bg-slate-50 border border-slate-100/80 rounded-2xl p-4 overflow-y-auto mt-2.5 min-h-0 flex items-start gap-4">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border font-mono transition-all",
              hasTimeline
                ? (status === 'completed'
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                    : "bg-indigo-50 text-indigo-700 border-indigo-100")
                : "bg-slate-50 text-slate-400 border-slate-200/40"
            )}>
              {hasTimeline ? String(currentStepIndex).padStart(2, '0') : '00'}
            </div>
            
            <div className="space-y-1 flex-1">
              <h4 className="text-[13px] font-bold text-slate-800 leading-snug">
                {descriptionText}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-2xl italic">
                {subDescriptionText}
              </p>
            </div>
          </div>
        </div>

        {/* Static Splitter */}
        <div className="w-px bg-slate-150 bg-slate-100 h-full shrink-0" />

        {/* Statistics and Complexity Card */}
        <div className="w-76 flex flex-col justify-between shrink-0">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            Decision Metrics
          </label>

          <div className="flex-1 flex flex-col justify-end space-y-3.5 pt-2">
            {/* Comparisons Metric */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Active Comparisons</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-8 text-center text-[10px]">
                {metrics.comparisons}
              </span>
            </div>

            {/* Dynamic DSU/Heap Metrics */}
            {isKruskal ? (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Union Operations</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-8 text-center text-[10px]">
                  {metrics.unions ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Heap Frontiers Size</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md min-w-8 text-center text-[10px]">
                  {metrics.heapSize ?? 0}
                </span>
              </div>
            )}

            {/* Theoretical Big-O complexity rows */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Relative Cost Bounds</span>
                <span className="text-[10px] text-slate-400 font-medium">Asymptotic complexity</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100/40 rounded uppercase tracking-wider">
                {isKruskal ? 'O(E log E)' : 'O(E log V)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tiny clean copyright & credit bar */}
      <div id="footer-credit-bar" className="px-8 text-[10px] text-slate-400 font-medium font-sans flex justify-between items-center bg-slate-50 border-t border-slate-200/50 py-2 shrink-0">
        <div>© 2026 Minimum Spanning Tree Visualizer Lab.</div>
        <div className="flex items-center gap-1">
          <span>Created by</span>
          <span className="text-indigo-600 font-extrabold hover:text-indigo-700 transition-colors">Idowu Oluwafemi (Webkingif)</span>
        </div>
      </div>
    </footer>
  );
}
