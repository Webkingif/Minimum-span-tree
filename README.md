# 🏆 Minimum Spanning Tree (MST) Visualizer Lab

An educational, high-fidelity, interactive computer science laboratory designed to construct weighted graphs dynamically and visualize optimal tree spanning programs (Prim's & Kruskal's algorithms) in real-time. Built specifically as a premium showcase application with polished user experiences, responsive layouts, and modern typography.

**🔗 Live Demo:** [Minimum Spanning Tree Visualizer](https://ais-pre-rvnlgu6q273seygq6cj2j6-163134622239.europe-west2.run.app)  
**👤 Developer:** Idowu Oluwafemi (Webkingif)

---

## 🎨 Project Overview & Design Philosophy
This application operates like an interactive computer science laboratory. Key design principles include:
- **Swiss / Modern Aesthetics**: Using **Inter** for clean controls paired with **JetBrains Mono** for structural complexity metrics.
- **Architectural Honesty**: Clean typography, high contrast, generous whitespace, and absolute avoidance of "AI-slop" clutter.
- **High-Performance Canvas**: Utilizes **Cytoscape.js** for high-performance physics-based node dragging, custom weighted edge lines, and beautiful active selections.

---

## 🚀 Key Features

### 1. Dynamic Graph Sandbox
* **Single-Tap Node Dragging**: Smoothly select, reposition, and drag vertices anywhere on the virtual canvas.
* **Double-Tap Node Spawn**: Intuitively **double-tap or double-click** on any empty canvas area to instantly spawn a new node without leaving your selection tool.
* **Double-Tap Node Connection**: Double-tap any existing node to roll out an elegant **Add Edge Dialog** showing searchable dropdowns for target nodes.
* **Interactive Weight Editor**: Double-click or tap the edge floating weight labels to focus a rich inline numeric scrubbing slider (range 1 - 99) or manual text input fields.

### 2. High-Performance Algorithm Solvers
* **Kruskal's Algorithm Framework**: Uses an optimized **Disjoint Set Union (DSU / Union-Find)** structure to group non-cyclic edges by ascending weight.
* **Prim's Algorithm Framework**: Uses an active **Min Heap / Priority Queue** to greedily expand the minimum boundary-crossing cut.
* **Instant Decisive Solves**: Clicking the "Play" button immediately evaluates and flashes the **final completed spanning forest** onto the workspace canvas, omitting slow frame iterations for a fast, responsive user flow.

### 3. Comprehensive Analytics & Guidance
* **Interactive Spanning Complete Modal**: Shows final cumulative tree weight costs, vertices connected, optimal edges included ($V - 1$), and total cycles / edge evaluations.
* **SEO Optimized Metadata**: Configured with responsive indexing metadata, author credits, and Twitter/OpenGraph tags.
* **Interactive Help Guide**: Accessible at `/help` detailing double-tap shortcuts, formula definitions, and mathematical complexities.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15+ (App Router, Server Components by default)
- **Language**: TypeScript (Strict type safety, explicit interfaces)
- **Styling**: Tailwind CSS (Fluid utility layers, zero global pollution)
- **Animations**: Framer Motion (`motion/react`)
- **Graph Renderer**: Cytoscape.js
- **Icons**: Lucide React

All state machines are divided into:
1. **Graph State**: Vertices, edges, selection vectors, and coordinate maps.
2. **Algorithm State**: Spanning results, evaluation counts, DSU tracking array status, and Priority Queue items.
3. **UI/UX State**: Dialog states, active sidebar panel widgets, speed settings, and interactive modals.

---

## 🤝 Contribution & License
Designed and maintained by **Idowu Oluwafemi (Webkingif)**. Developed as an educational reference tool for algorithms classes, software engineering portfolios, and structural discrete mathematics.
