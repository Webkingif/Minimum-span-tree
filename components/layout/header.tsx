'use client';

import React from 'react';
import { Network, Activity, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeaderProps {
  algorithm: 'kruskal' | 'prim';
  onChangeAlgorithm: (algo: 'kruskal' | 'prim') => void;
  nodeCount: number;
  edgeCount: number;
  mstCost: number;
  isAnimationActive: boolean;
  onResetAnimation: () => void;
}

export default function Header({
  algorithm,
  onChangeAlgorithm,
  nodeCount,
  edgeCount,
  mstCost,
  isAnimationActive,
  onResetAnimation,
}: HeaderProps) {
  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
      {/* Brand & Graphic Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-indigo-100">
          <Network className="w-4.5 h-4.5" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
            MST Visualizer
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded-full">v1.1.0</span>
          </h1>
          <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">Interactive CS Lab</p>
        </div>
      </div>

      {/* Controller & Dynamic Stats */}
      <div className="flex items-center gap-6">
        {/* Toggle Controls */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            id="algo-kruskal-select"
            onClick={() => {
              if (algorithm !== 'kruskal') {
                onResetAnimation();
                onChangeAlgorithm('kruskal');
              }
            }}
            className={cn(
              'px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              algorithm === 'kruskal'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Kruskal&apos;s
          </button>
          
          <button
            id="algo-prim-select"
            onClick={() => {
              if (algorithm !== 'prim') {
                onResetAnimation();
                onChangeAlgorithm('prim');
              }
            }}
            className={cn(
              'px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer',
              algorithm === 'prim'
                ? 'bg-white shadow-sm text-indigo-600'
                : 'text-slate-500 hover:text-slate-800'
            )}
          >
            Prim&apos;s
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Live Counters */}
        <div className="flex items-center gap-5 text-xs font-semibold text-slate-600">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Nodes</span>
            <span className="font-mono text-slate-800">{nodeCount}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">Edges</span>
            <span className="font-mono text-slate-800">{edgeCount}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-wider text-slate-400">MST Cost</span>
            <span className={cn(
              "font-mono text-sm font-bold transition-all",
              isAnimationActive ? "text-emerald-600 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "text-slate-600"
            )}>
              {mstCost}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Documentation / Guide */}
        <Link
          id="header-help-guide-link"
          href="/help"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-100/60 rounded-xl transition-all cursor-pointer shadow-xs uppercase tracking-wide"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 animate-pulse" /> Help Guide
        </Link>
      </div>
    </header>
  );
}
