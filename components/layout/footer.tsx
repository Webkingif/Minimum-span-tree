'use client';

import React from 'react';
import { VisualizerStep } from '@/types/graph';
import { HelpCircle, BarChart2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FooterProps {
  currentStep: VisualizerStep | null;
  algorithm: 'kruskal' | 'prim';
  hasTimeline: boolean;
  totalSteps: number;
}

export default function Footer({
  currentStep,
  algorithm,
  hasTimeline,
  totalSteps,
}: FooterProps) {
  // Safe extraction of values
  const stepIndex = currentStep ? currentStep.stepIndex : 0;
  const descriptionText = currentStep
    ? currentStep.description
    : 'Graph Mode Active. Use editing options to design a custom network structure.';
  const subDescriptionText = currentStep
    ? currentStep.subDescription
    : 'Click the Play button above or advance steps manually to trace the step-by-step MST algorithm path execution.';
  const metrics = currentStep?.metrics || { comparisons: 0, unions: 0, heapSize: 0 };

  const isKruskal = algorithm === 'kruskal';

  return (
    <footer className="h-56 bg-white border-t border-slate-200 p-6 flex gap-8 shrink-0 select-none overflow-hidden">
      {/* State Logger Column */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Step-by-Step Execution Console
          </label>
          <p className="text-[10px] text-slate-400 font-medium">
            Active snapshot logic and structural checks
          </p>
        </div>

        {/* Console Explanations Box */}
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4.5 overflow-y-auto mt-2 min-h-0 flex items-start gap-4">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
            hasTimeline
              ? "bg-indigo-50 text-indigo-700 border border-indigo-100/50"
              : "bg-slate-100 text-slate-400"
          )}>
            {hasTimeline ? String(stepIndex).padStart(2, '0') : '00'}
          </div>
          
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {descriptionText}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-2xl italic">
              {subDescriptionText}
            </p>
          </div>
        </div>
      </div>

      {/* Static Splitter */}
      <div className="w-px bg-slate-100 h-full" />

      {/* Statistics and Complexity Card */}
      <div className="w-76 flex flex-col justify-between shrink-0">
        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" />
          Algorithm Metrics
        </label>

        <div className="flex-1 flex flex-col justify-center space-y-3.5 pt-2">
          {/* Comparisons Metric */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Edge Comparisons</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-8 text-center text-[11px]">
              {metrics.comparisons}
            </span>
          </div>

          {/* Dynamic DSU/Heap Metrics */}
          {isKruskal ? (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Union Operations</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md min-w-8 text-center text-[11px]">
                {metrics.unions ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Cut Frontier Size</span>
              <span className="font-mono font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/20 px-2 py-0.5 rounded-md min-w-8 text-center text-[11px]">
                {metrics.heapSize ?? 0}
              </span>
            </div>
          )}

          {/* Theoretical Big-O complexity rows */}
          <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-700 block">Time Complexity</span>
              <span className="text-[10px] text-slate-400 font-medium">Worst-case bounds</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100/50 rounded-lg uppercase tracking-wide">
              {isKruskal ? 'O(E log E)' : 'O(E log V)'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
