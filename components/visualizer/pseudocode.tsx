'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { VisualizerStep } from '@/types/graph';
import { cn } from '@/lib/utils';
import { Code2 } from 'lucide-react';

interface PseudocodeProps {
  algorithm: 'kruskal' | 'prim';
  currentStep: VisualizerStep | null;
  hasTimeline: boolean;
}

interface CodeLine {
  lineNum: number;
  text: string;
  indent: number;
}

export default function Pseudocode({
  algorithm,
  currentStep,
  hasTimeline,
}: PseudocodeProps) {
  const isKruskal = algorithm === 'kruskal';

  // Format standard, humble, readable CS pseudocode lines
  const codeLines = useMemo<CodeLine[]>(() => {
    if (isKruskal) {
      return [
        { lineNum: 1, text: 'KruskalMST(G):', indent: 0 },
        { lineNum: 2, text: '  Sort G.edges in ascending order of weight', indent: 1 },
        { lineNum: 3, text: '  For each vertex v in G.nodes: MakeSet(v)', indent: 1 },
        { lineNum: 4, text: '  For each edge e = (u, v) in sorted G.edges:', indent: 1 },
        { lineNum: 5, text: '    If Find(u) ≠ Find(v):', indent: 2 },
        { lineNum: 6, text: '      Accept e into MST', indent: 3 },
        { lineNum: 7, text: '      Union(u, v)', indent: 3 },
        { lineNum: 8, text: '    Else:', indent: 2 },
        { lineNum: 9, text: '      Reject e  // Avoids cyclic loop', indent: 3 },
        { lineNum: 10, text: '  Return MST', indent: 1 },
      ];
    } else {
      return [
        { lineNum: 1, text: 'PrimMST(G, startNode):', indent: 0 },
        { lineNum: 2, text: '  Set visited = { startNode }, MST = {}', indent: 1 },
        { lineNum: 3, text: '  Insert all neighboring edges into Heap (Frontier)', indent: 1 },
        { lineNum: 4, text: '  While Heap is not empty and spanned < V:', indent: 1 },
        { lineNum: 5, text: '    Extract lightest edge e = (u, v) from Heap', indent: 2 },
        { lineNum: 6, text: '    If Find(u) and Find(v) are both visited:', indent: 2 },
        { lineNum: 7, text: '      Reject e // Discard loop connection', indent: 3 },
        { lineNum: 8, text: '    Else:', indent: 2 },
        { lineNum: 9, text: '      Accept e into MST, mark v as visited', indent: 3 },
        { lineNum: 10, text: '      Insert new neighbor edges of v into Heap', indent: 3 },
        { lineNum: 11, text: '  Return MST', indent: 1 },
      ];
    }
  }, [isKruskal]);

  // Determine active lines based on engine stepping values
  const activeLineNums = useMemo<number[]>(() => {
    if (!hasTimeline || !currentStep) return [];

    const { stepIndex, stepType } = currentStep;

    if (isKruskal) {
      if (stepIndex === 0) {
        return [2, 3];
      }
      if (stepType === 'CHECK_EDGE') {
        return [4, 5];
      }
      if (stepType === 'ACCEPT_EDGE') {
        return [6, 7];
      }
      if (stepType === 'REJECT_EDGE') {
        return [8, 9];
      }
      if (stepType === 'COMPLETE') {
        return [10];
      }
    } else {
      if (stepIndex === 0) {
        return [2, 3];
      }
      if (stepType === 'CHECK_EDGE') {
        return [4, 5];
      }
      if (stepType === 'REJECT_EDGE') {
        return [6, 7];
      }
      if (stepType === 'ACCEPT_EDGE') {
        return [8, 9, 10];
      }
      if (stepType === 'COMPLETE') {
        return [11];
      }
    }

    return [];
  }, [hasTimeline, currentStep, isKruskal]);

  return (
    <div className="flex flex-col bg-slate-900 text-[#cbd5e1] rounded-2xl border border-slate-800 p-4 font-mono text-[11px] leading-relaxed shadow-lg overflow-hidden shrink-0 select-none">
      {/* Container Header */}
      <div className="flex items-center gap-2 pb-3.5 border-b border-slate-800/80 mb-3 shrink-0">
        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Pseudocode Trace
        </span>
      </div>

      {/* Code viewport */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {codeLines.map((line) => {
          const isActive = activeLineNums.includes(line.lineNum);
          return (
            <div
              key={line.lineNum}
              className={cn(
                'relative flex items-center py-1 px-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-indigo-950/60 text-indigo-300 font-bold'
                  : 'text-slate-400'
              )}
            >
              {/* Dynamic highlight indicator backing */}
              {isActive && (
                <motion.div
                  layoutId="active-line-indicator"
                  className="absolute inset-0 bg-indigo-500/15 border-l-2 border-indigo-400 rounded-lg pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Line marker */}
              <span className="w-5 text-right font-semibold text-slate-600 mr-4 select-none">
                {line.lineNum}
              </span>

              {/* Indented contents */}
              <span
                style={{ paddingLeft: `${line.indent * 12}px` }}
                className="whitespace-pre truncate"
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
