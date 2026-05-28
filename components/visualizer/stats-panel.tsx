'use client';

import React, { useMemo } from 'react';
import { VisualizerStep, GraphData } from '@/types/graph';
import { BarChart3, Clock, Compass, Dumbbell, ShieldAlert, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsPanelProps {
  algorithm: 'kruskal' | 'prim';
  graph: GraphData;
  currentStep: VisualizerStep | null;
  hasTimeline: boolean;
  totalSteps: number;
}

export default function ReusableStatsPanel({
  algorithm,
  graph,
  currentStep,
  hasTimeline,
  totalSteps,
}: StatsPanelProps) {
  const isKruskal = algorithm === 'kruskal';

  // Compute active nodes spanned and stats from structural elements
  const metrics = currentStep?.metrics || { comparisons: 0, unions: 0, heapSize: 0 };

  const liveStats = useMemo(() => {
    if (!currentStep) {
      return {
        accepted: 0,
        rejected: 0,
        totalCost: 0,
      };
    }

    // Accumulate states from edgeStates
    let accepted = 0;
    let rejected = 0;
    Object.values(currentStep.edgeStates).forEach((state) => {
      if (state === 'accepted') accepted++;
      if (state === 'rejected') rejected++;
    });

    return {
      accepted,
      rejected,
      totalCost: currentStep.totalMstCost,
    };
  }, [currentStep]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-5 shadow-sm select-none">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-100 shrink-0">
        <BarChart3 className="w-4 h-4 text-indigo-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Live Run Analytics
        </span>
      </div>

      {/* Numerical Metrics Grid (Bento Boxes) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Cost Column */}
        <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50 flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-wider text-emerald-600/80 font-bold">
            MST Weight Cost
          </span>
          <span className="text-xl font-mono font-bold text-emerald-700 mt-1">
            {hasTimeline ? liveStats.totalCost : 0}
          </span>
        </div>

        {/* Steps Column */}
        <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex flex-col justify-between">
          <span className="text-[9px] uppercase tracking-wider text-indigo-600/80 font-bold">
            Dynamic Stepping
          </span>
          <span className="text-xl font-mono font-bold text-indigo-700 mt-1">
            {hasTimeline ? `${currentStep?.stepIndex ?? 0}/${totalSteps - 1}` : '0/0'}
          </span>
        </div>
      </div>

      {/* Structural Evaluation Stats */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Accepted Edges
          </span>
          <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/80 text-[11px]">
            {liveStats.accepted} / {Math.max(0, graph.nodes.length - 1)}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            Rejected (Cyclic) Edges
          </span>
          <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/80 text-[11px]">
            {liveStats.rejected}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            Evaluations
          </span>
          <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100/80 text-[11px]">
            {metrics.comparisons ?? 0}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-slate-100 my-1" />

      {/* Theoretical Big-O bounds */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Time Complexity</span>
              <span className="text-[9px] font-mono font-bold bg-indigo-55 bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                {isKruskal ? 'O(E log E)' : 'O(E log V)'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {isKruskal
                ? 'Driven by sorting all weight elements.'
                : 'Driven by Min-Heap / priority queue cut lookups.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Dumbbell className="w-4 h-4 text-slate-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Space Complexity</span>
              <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">
                {isKruskal ? 'O(V)' : 'O(V + E)'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {isKruskal
                ? 'Driven by disjoint set mapping vectors.'
                : 'Driven by Priority Heap cut frontiers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
