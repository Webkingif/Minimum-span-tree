import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'Minimum Spanning Tree Visualizer | Interactive Algorithms Lab',
    template: '%s | MST Visualizer Lab'
  },
  description: 'A professional-tier visual computer science laboratory to construct weighted graphs, simulate optimal linear programs, and visualize Prim\'s and Kruskal\'s algorithms in real-time.',
  keywords: [
    'Minimum Spanning Tree',
    'MST Visualizer',
    'Kruskal\'s Algorithm',
    'Prim\'s Algorithm',
    'Graph Theory Visualizer',
    'Computer Science Laboratory',
    'Interactive Algorithm Visualizer',
    'Weighted Graph',
    'Union-Find',
    'Min Heap Priority Queue'
  ],
  authors: [{ name: 'Idowu Oluwafemi (Webkingif)' }],
  creator: 'Idowu Oluwafemi (Webkingif)',
  openGraph: {
    title: 'Minimum Spanning Tree Visualizer | Interactive Algorithms Lab',
    description: 'Construct weighted graphs dynamically and simulate Prim\'s and Kruskal\'s algorithms step-by-step with real-time complexity metrics.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Minimum Spanning Tree Visualizer Lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minimum Spanning Tree Visualizer | Interactive Algorithms Lab',
    description: 'Construct weighted graphs dynamically and simulate Prim\'s and Kruskal\'s algorithms step-by-step with real-time complexity metrics.',
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}
