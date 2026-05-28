'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, X, Award, CheckCircle2 } from 'lucide-react';
import { VisualizerStep, GraphData } from '@/types/graph';

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  algorithm: 'kruskal' | 'prim';
  graph: GraphData;
  finalStep: VisualizerStep | null;
}

export default function CompletionModal({
  isOpen,
  onClose,
  onReset,
  algorithm,
  graph,
  finalStep,
}: CompletionModalProps) {
  if (!isOpen) return null;

  const totalCost = finalStep ? finalStep.totalMstCost : 0;
  const comparisons = finalStep?.metrics.comparisons ?? 0;
  const edgeCount = finalStep?.mstEdgeIds.length ?? 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          id="completion-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]"
        />

        {/* Modal content dialog */}
        <motion.div
          id="completion-modal-dialog"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200/50 p-7 shadow-2xl z-10 select-none overflow-hidden"
        >
          {/* Subtle graphic circular flares */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Close trigger */}
          <button
            id="close-completion-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-500 shadow-md shadow-emerald-50/50">
              <Award className="w-5.5 h-5.5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1 bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
                Spanning Complete!
              </h2>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-xs mt-1">
                {algorithm === 'kruskal' ? "Kruskal's Disjoint-Set" : "Prim's Binary Min-Heap"} algorithm successfully linked the active components.
              </p>
            </div>
          </div>

          {/* Middle summary card */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-4.5 my-6 space-y-3">
            {/* Stat Row 1 */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Total Spanned Cost</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                {totalCost}
              </span>
            </div>

            {/* Stat Row 2 */}
            <div className="flex justify-between items-center text-xs border-y border-slate-100 py-2.5">
              <span className="text-slate-500 font-semibold">Nodes Connected</span>
              <span className="font-mono font-semibold text-slate-800">
                {graph.nodes.length} Vertices
              </span>
            </div>

            {/* Stat Row 3 */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Edges Included</span>
              <span className="font-mono font-semibold text-slate-800">
                {edgeCount} Edges
              </span>
            </div>

            {/* Stat Row 4 */}
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-500 font-semibold">Edge Evaluations</span>
              <span className="font-mono font-semibold text-indigo-600 bg-indigo-50/50 border border-indigo-100/10 px-1.5 py-0.5 rounded text-[10px]">
                {comparisons} checks
              </span>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="flex flex-col gap-2">
            <button
              id="modal-reset-btn"
              onClick={() => {
                onReset();
                onClose();
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-150 cursor-pointer uppercase"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Environment
            </button>

            <button
              id="modal-review-btn"
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer text-center uppercase"
            >
              Analyze Saved Path
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
