'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Network, Play, MousePointer, Sliders, Info, BookOpen, 
  Zap, Award, Trash2, PlusCircle, Edit3, Search, Code, CheckCircle, 
  X, ChevronRight, HelpCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

// Structuring detailed sections about using the website
interface HelpSection {
  id: string;
  category: 'getting-started' | 'sandbox' | 'algorithms' | 'playback' | 'visuals';
  title: string;
  icon: React.ReactNode;
  summary: string;
  content: React.ReactNode;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('mst-basics');

  const categories = [
    { id: 'all', title: 'All Guides' },
    { id: 'getting-started', title: 'Getting Started' },
    { id: 'sandbox', title: 'Sandbox Controls' },
    { id: 'algorithms', title: 'MST Algorithms' },
    { id: 'playback', title: 'Execution & Playback' },
    { id: 'visuals', title: 'Visual Legend' },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const sections = useMemo<HelpSection[]>(() => [
    {
      id: 'mst-basics',
      category: 'getting-started',
      title: 'Introduction to Minimum Spanning Trees',
      icon: <BookOpen className="w-5 h-5 text-indigo-500" />,
      summary: 'Understand the core mathematical definition of Spanning Trees and why we compute them.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            A <strong>Spanning Tree</strong> of a connected, undirected graph is a subgraph that is a tree (contains no cycles) and connects (spans) all the vertices together.
          </p>
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> The Minimum Spanning Tree (MST)
            </h4>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              For a weighted graph, the MST is the spanning tree with the <strong>minimum possible total edge weight</strong>. If there are $V$ vertices, an MST will always contain exactly $V - 1$ edges.
            </p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            MST algorithms find immediate, daily application in real-world infrastructure systems such as designing high-efficiency computer systems, power grids, telecommunication hubs, pipeline networks, and finding optimal travel matrices.
          </p>
        </div>
      )
    },
    {
      id: 'sandbox-creation',
      category: 'sandbox',
      title: 'Drawing Nodes & Structuring Graphs',
      icon: <PlusCircle className="w-5 h-5 text-indigo-500" />,
      summary: 'Learn the mouse & touch gestures to populate customized node points in the interactive workspace.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The visualization canvas is a fully interactive, state-governed sandbox supporting precise graph creation. Learn the visual interactions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <MousePointer className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Add Nodes</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Select <strong className="text-slate-700">Add Node</strong> mode, then click anywhere on the grey background to draw a node anchor point.
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-slate-900">Drag & Move Nodes</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Use <strong className="text-slate-700">Select/Move</strong> mode. Click, hold, and drag any node to reposition it dynamically. Edges automatically stretch.
                </p>
              </div>
            </div>
          </div>
          <div className="p-3 bg-amber-50/50 border border-amber-200/40 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 mt-0">
              <strong>Tip on Layouts:</strong> At any time, use the <strong>Auto Layout</strong> action on the bottom toolbar to automatically organize node clusters neatly using a physics-directed force layout scheme.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sandbox-edges',
      category: 'sandbox',
      title: 'Connecting Edges & Setting Weights',
      icon: <Edit3 className="w-5 h-5 text-indigo-500" />,
      summary: 'Establish bidirectional links between nodes and assign numerical cost weights.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Weights define the cost overhead of traversing routes in your graph. Connections are bidirectional:
          </p>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</div>
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">Initiate Edge Draw:</strong> Swap the toolbar to <strong className="text-slate-800">Add Edge</strong> mode.
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</div>
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">Link the Nodes:</strong> Click on the starting node, drag your mouse (or drag the touch vector), and release the cursor on top of the target node.
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</div>
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">Adjust Weight Costs:</strong> In Select Mode, double-click or double-tap on any weight label box. A small slider or inline overlay input will appear, letting you specify custom values from 1 to 99 instantly.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sandbox-deletion',
      category: 'sandbox',
      title: 'Deleting Elements & Restoring Sandbox',
      icon: <Trash2 className="w-5 h-5 text-indigo-500" />,
      summary: 'Safely prune edges and nodes, or wipe clean the workspace to start fresh on a new topology.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Avoid clutter and rebuild structures easily with complete pruning tools:
          </p>
          <ul className="space-y-2.5 text-xs text-slate-600 list-disc pl-5">
            <li>
              <strong>Using Delete Mode:</strong> Swap to <strong>Delete</strong> mode on the bottom menu, then click on any node or edge to erase it from the graph state immediately.
            </li>
            <li>
              <strong>Node Cascading:</strong> When you delete a node, any connecting edges associated with it are automatically removed to prevent floating invalid pathways.
            </li>
            <li>
              <strong>Clear Graph:</strong> Use the <strong>Clear Canvas</strong> button in the left controller to instantly wipe all nodes and edges to begin fresh.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'algorithm-kruskal',
      category: 'algorithms',
      title: "Kruskal's Algorithm Framework",
      icon: <Code className="w-5 h-5 text-indigo-500" />,
      summary: 'A greedy, edge-driven search that sorts connections and maps disjoint partitions.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Kruskal&apos;s Algorithm</strong> is a classic greedy algorithm that discovers the MST by processing edges in non-decreasing order of their weights.
          </p>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs leading-relaxed space-y-1">
            <div className="text-indigo-600 font-bold"># Kruskal Pseudocode Overview</div>
            <div>1. Sort all edges by ascending weight.</div>
            <div>2. Initialize a disjoint-set (Disjoint Set Union - DSU) structure.</div>
            <div>3. For each sorted edge (u, v):</div>
            <div className="pl-4">a. If u and v belong to different subsets:</div>
            <div className="pl-8">i. Union the subsets of u and v.</div>
            <div className="pl-8">ii. Add the edge (u, v) to the MST.</div>
            <div className="pl-4">b. Otherwise, discard the edge (creates a cycle).</div>
            <div>4. Stop when the MST holds exactly V - 1 edges.</div>
          </div>

          <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
            <h5 className="font-bold text-xs text-indigo-900 mb-1">Union-Find Engine & Cycle Prevention</h5>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Kruskal utilizes a fast **Disjoint Set (Union-Find)** structure to confirm if adding an edge connects two previously isolated networks. It implements path compression and union-by-rank, offering almost constant-time cycle assessments of $O(\alpha(V))$.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'algorithm-prim',
      category: 'algorithms',
      title: "Prim's Algorithm Framework",
      icon: <Network className="w-5 h-5 text-indigo-500" />,
      summary: 'A greedy, node-growing algorithm that expands outwards from a starting seed point.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong>Prim&apos;s Algorithm</strong> constructs the MST incrementally by starting from a chosen vertex (seed) and growing the tree outward.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs leading-relaxed space-y-1">
            <div className="text-indigo-600 font-bold"># Prim Pseudocode Overview</div>
            <div>1. Choose an arbitrary starting node. Mark it as visited.</div>
            <div>2. Insert all edges connecting the starting node into a Min-Heap.</div>
            <div>3. While the heap is not empty and nodes remain unspanned:</div>
            <div className="pl-4">a. Extract the minimum weight edge (u, v) from the heap.</div>
            <div className="pl-4">b. If the target node v is already visited, discard.</div>
            <div className="pl-4">c. Otherwise:</div>
            <div className="pl-8">i. Mark v as visited and add edge (u, v) to MST.</div>
            <div className="pl-8">ii. Push all edges starting from v to unvisited nodes into the heap.</div>
          </div>

          <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl">
            <h5 className="font-bold text-xs text-indigo-900 mb-1">Heap Operations</h5>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              At each step, Prim looks at all candidate edges connecting our growing set of spanned nodes to other unvisited nodes throughout the graph, selecting the absolute cheapest connection via an efficient Priority Queue.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'complexities',
      category: 'algorithms',
      title: 'Side-by-Side Comparison Matrix',
      icon: <Sliders className="w-5 h-5 text-indigo-500" />,
      summary: 'An objective analytical comparison of both major algorithms on different graph types.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Depending on graph density (the relationship between the number of Vertices $V$ and Edges $E$), one algorithm typically outperforms the other:
          </p>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3.5 font-bold text-slate-700">Property</th>
                  <th className="p-3.5 font-bold text-indigo-700">Kruskal&apos;s Algorithm</th>
                  <th className="p-3.5 font-bold text-indigo-700">Prim&apos;s Algorithm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Search Paradigm</td>
                  <td className="p-3.5">Edge-centric traversal</td>
                  <td className="p-3.5">Node-centric expanding traversal</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Time Complexity</td>
                  <td className="p-3.5 font-mono">$O(E \log E)$ or $O(E \log V)$</td>
                  <td className="p-3.5 font-mono">$O(E \log V)$ using Min-Heap</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Space Complexity</td>
                  <td className="p-3.5 font-mono">$O(V + E)$ for sorting and DSU</td>
                  <td className="p-3.5 font-mono">$O(V + E)$ for Priority Queue</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Recommended for</td>
                  <td className="p-3.5">Sparse graphs (fewer edges)</td>
                  <td className="p-3.5">Dense graphs (heavily connected)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-bold text-slate-900">Cycle Checking</td>
                  <td className="p-3.5">Explicitly checked via DSU</td>
                  <td className="p-3.5">Implicitly avoided via Visited Set</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      id: 'playback-controls',
      category: 'playback',
      title: 'Tuning Simulation & Speed Controls',
      icon: <Play className="w-5 h-5 text-indigo-500" />,
      summary: 'Familiarize yourself with the playback dashboard to step forward and backward.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            The playback dashboard operates like an interactive media player, allowing you to scrutinize every decision made by the underlying mathematical models:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex gap-2.5 items-center">
                <Play className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Play / Pause</span>
              </div>
              <span className="text-[11px] text-slate-500">Auto-steps forward at the user-defined interval.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex gap-2.5 items-center">
                <span className="font-bold text-sm text-indigo-600">⟨ ⟩</span>
                <span className="text-xs font-bold text-slate-800">Previous / Next Step</span>
              </div>
              <span className="text-[11px] text-slate-500">Manually step to investigate specific logical choices.</span>
            </div>
            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex gap-2.5 items-center">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Speed Multiplier Slider</span>
              </div>
              <span className="text-[11px] text-slate-500">Fine-tune simulation interval between 0.25x and 4.0x speed.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'completion-modal-stats',
      category: 'playback',
      title: 'Deciphering the Spanning Complete Modal & Metrics',
      icon: <Award className="w-5 h-5 text-indigo-500" />,
      summary: 'Analyze final execution metrics, cumulative costs, connection records, and review pathways when an algorithm resolves.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            When an algorithm completes its work by fully spanning the graph or exhausting reachable vertices, the interactive <strong>Spanning Complete Modal</strong> will lock in your final stats. Here is a breakdown of what every field on this modal signifies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2">
              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-indigo-700">
                ⭐ Calculated Metrics
              </h5>
              <ul className="space-y-3.5 text-xs text-slate-600">
                <li>
                  <strong className="text-slate-800">Total Spanned Cost:</strong> The mathematical sum of all selected edge weights in the Minimum Spanning Tree. This represents the absolute cheapest cost to keep the graph points reachable and fully connected.
                </li>
                <li>
                  <strong className="text-slate-800">Nodes Connected:</strong> The total number of vertices ($V$) spanning the active topology. A complete MST always encompasses all connected nodes of the main graph component.
                </li>
                <li>
                  <strong className="text-slate-800">Edges Included:</strong> The number of edges inside your MST. By tree definition, a connected graph with $V$ vertices will always have exactly $V - 1$ optimal edges in its MST.
                </li>
                <li>
                  <strong className="text-slate-800">Edge Evaluations:</strong> The total count of inspections, comparisons, or queue checks executed before finalizing. This highlights the algorithm&apos;s footprint and how many cycles were spent verifying connectivity.
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-2">
              <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-indigo-700">
                🎮 Navigation & Action Options
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take control of the visualization flow after completion using two specialized options:
              </p>
              <ul className="space-y-3 text-xs text-slate-600 list-disc pl-5">
                <li>
                  <strong>Reset Environment:</strong> Click this button to wipe the spanning solution state and restore the graph back to active Sandbox editing mode. You can instantly change weights, draw new edges, or reposition vertices.
                </li>
                <li>
                  <strong>Analyze Saved Path:</strong> Dismisses the modal dialog while preserving the completed tree on the canvas. This allows you to explore the final visual graph, review state steps manually using timeline controls, or hover over optimal paths.
                </li>
                <li>
                  <strong>Reopen Completion Modal:</strong> If you closed the modal to inspect the graph and want to see the performance stats again, look for the green <strong>🏆 Reopen Completion Modal</strong> button in the sidebar panel or canvas tools.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'visual-elements',
      category: 'visuals',
      title: 'Visual Representation Legend',
      icon: <Award className="w-5 h-5 text-indigo-500" />,
      summary: 'Understand the geometric colors and animations representing graph states during runs.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Keep track of the algorithm&apos;s status by monitoring changes in the canvas layout elements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
              <h5 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-400 block shrink-0" /> Node States
              </h5>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Standard Sandbox Node</span>
                  <span className="px-2 py-0.5 bg-slate-100 font-mono text-[10px] text-slate-600 rounded">Slate Outer</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Currently Inspected</span>
                  <span className="px-2 py-0.5 bg-indigo-50 font-mono text-[10px] text-indigo-600 border border-indigo-300 rounded font-bold">Indigo Pulse</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Spanned node (Completed)</span>
                  <span className="px-2 py-0.5 bg-emerald-50 font-mono text-[10px] text-emerald-600 border border-emerald-300 rounded font-bold">Green Glow</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200/80 rounded-2xl">
              <h5 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-1.5 mb-2 flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-indigo-600 block shrink-0" /> Edge States
              </h5>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Currently Inspected</span>
                  <span className="px-2 py-0.5 bg-indigo-50 font-mono text-[10px] text-indigo-600 border border-indigo-100 rounded font-bold">Thick Indigo Line</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Accepted (Optimal path)</span>
                  <span className="px-2 py-0.5 bg-emerald-50 font-mono text-[10px] text-emerald-600 border border-emerald-100 rounded font-bold">Pure Green edge-accepted</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Rejected (Avoids cyclic loops)</span>
                  <span className="px-2 py-0.5 bg-rose-50 font-mono text-[10px] text-rose-600 border border-rose-100 rounded">Faded Dotted Rose</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ], []);

  // Filter sections by category and search term
  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      const matchCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [sections, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      {/* Top sticky guidance banner header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-100 shrink-0">
              <Network className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                Lab Documentation
              </h1>
              <p className="text-[9px] text-indigo-500 font-extrabold tracking-wider uppercase">Minimum Spanning Tree System Guide</p>
            </div>
          </div>
        </div>

        <div>
          <Link 
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer"
            id="documentation-back-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Visualizer</span>
            <span className="sm:hidden">Exit</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-8 relative">
        {/* Left hand sticky navigation rails */}
        <div className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24 h-fit">
          
          {/* Quick search container */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              id="help-page-search"
              type="text"
              placeholder="Search user guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-2xl text-xs font-semibold focus:outline-none placeholder-slate-400/80 shadow-xs transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Table of contents and Category select list */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                Categories
              </h3>
              <div className="flex flex-wrap md:flex-col gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    id={`cat-btn-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-3 py-2 text-left rounded-xl text-xs font-bold transition-all cursor-pointer w-fit md:w-full",
                      selectedCategory === cat.id 
                        ? "bg-indigo-50 text-indigo-700 font-extrabold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:block h-px bg-slate-100" />

            <div className="hidden md:block">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">
                On This Page
              </h3>
              <div className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    id={`toc-btn-${sec.id}`}
                    onClick={() => {
                      setActiveSection(sec.id);
                      const targetEl = document.getElementById(sec.id);
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className={cn(
                      "w-full text-left py-1.5 px-2.5 text-[11px] font-medium rounded-lg truncate transition-all flex items-center gap-1.5 cursor-pointer",
                      activeSection === sec.id 
                        ? "text-indigo-600 bg-indigo-50/50 font-bold" 
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    <ChevronRight className={cn("w-3 h-3 transition-transform", activeSection === sec.id ? "rotate-95 text-indigo-500" : "text-slate-300")} />
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right side documentation sections */}
        <div className="flex-1 space-y-10 min-w-0">
          <AnimatePresence mode="popLayout">
            {filteredSections.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-slate-250 p-12 rounded-3xl text-center space-y-4 shadow-xs"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">No guidelines located</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    We couldn&apos;t find any sections matching &ldquo;{searchQuery}&rdquo;. Try another search criteria or select a different category filter.
                  </p>
                </div>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {filteredSections.map((sec, idx) => (
                  <motion.section
                    id={sec.id}
                    key={sec.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-120px" }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.2) }}
                    className="p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs scroll-mt-28 flex flex-col sm:flex-row gap-5"
                    onViewportEnter={() => setActiveSection(sec.id)}
                  >
                    {/* Visual Section Icon Header Decoration */}
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                      {sec.icon}
                    </div>

                    <div className="flex-1 space-y-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {sec.category.replace('-', ' ')}
                          </span>
                        </div>
                        <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-905 mt-1.5 font-display">
                          {sec.title}
                        </h2>
                        <p className="text-xs font-bold text-indigo-550 mt-1">
                          {sec.summary}
                        </p>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="text-slate-600 text-sm leading-relaxed prose prose-slate">
                        {sec.content}
                      </div>
                    </div>
                  </motion.section>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Interactive Lab Navigation CTA */}
          <div className="p-8 sm:p-10 bg-indigo-900 text-indigo-50 rounded-3xl shadow-md border border-indigo-950/20 text-center relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 p-8 text-indigo-500/10 pointer-events-none">
              <Network className="w-48 h-48" />
            </div>
            
            <div className="max-w-md mx-auto space-y-2 relative z-10">
              <h3 className="text-lg font-black tracking-tight font-display text-white">
                Ready to experiment, scholar?
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Unlock deep structural algorithm steps. Try drafting custom networks, dragging connections or altering edge weights in our visual laboratory dashboard.
              </p>
            </div>

            <div className="relative z-10">
              <Link 
                href="/" 
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl text-xs font-black tracking-wide uppercase shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                id="doc-footer-cta-link"
              >
                Launch Visualizer Laboratory <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified doc footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-[11px] text-slate-400 font-medium">
        <p>© 2026 Minimum Spanning Tree Visualizer Lab. Crafted for computer science educators and scholars.</p>
      </footer>
    </div>
  );
}
