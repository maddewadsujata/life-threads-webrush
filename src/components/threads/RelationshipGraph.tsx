import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Receipt, Connection, Thread, ReceiptCategory } from '../../types';
import { useLifeThreads } from '../../context/LifeThreadsContext';
import { CATEGORY_THEMES, ALL_CATEGORIES } from '../../utils/categoryTheme';
import { CategoryBadge } from '../common/CategoryBadge';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Filter,
  ArrowRight,
} from 'lucide-react';

interface GraphNode {
  id: string;
  receipt: Receipt;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  degree: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  score: number;
  reason: string;
  weight: number;
}

export const RelationshipGraph: React.FC = () => {
  const {
    receipts,
    connections,
    threads,
    adjacencyMap,
    openReceiptDetail,
  } = useLifeThreads();

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isolatedThreadId, setIsolatedThreadId] = useState<string>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 900,
    height: 600,
  });

  // Keep track of container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: Math.max(600, entry.contentRect.width),
          height: Math.max(450, entry.contentRect.height),
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter nodes according to isolated thread or category
  const filteredReceipts = useMemo(() => {
    let list = receipts;
    if (isolatedThreadId !== 'all') {
      const thread = threads.find((t) => t.id === isolatedThreadId);
      if (thread) {
        const set = new Set(thread.receiptIds);
        list = list.filter((r) => set.has(r.id));
      }
    }
    if (activeCategoryFilter !== 'all') {
      list = list.filter((r) => r.category === activeCategoryFilter);
    }
    // Limit to top 80 most connected if dataset is huge, to keep SVG fast
    if (list.length > 80) {
      const scored = [...list].sort(
        (a, b) => (adjacencyMap.get(b.id)?.length || 0) - (adjacencyMap.get(a.id)?.length || 0)
      );
      list = scored.slice(0, 80);
    }
    return list;
  }, [receipts, isolatedThreadId, activeCategoryFilter, threads, adjacencyMap]);

  // Compute graph nodes with deterministic circular + radial force layout
  const { nodes, nodeMap } = useMemo(() => {
    const map = new Map<string, GraphNode>();
    const count = filteredReceipts.length;
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const radiusBase = Math.min(cx, cy) * 0.75;

    // Group by category for pleasant clustered layout
    const categorized = new Map<ReceiptCategory, Receipt[]>();
    filteredReceipts.forEach((r) => {
      if (!categorized.has(r.category)) categorized.set(r.category, []);
      categorized.get(r.category)!.push(r);
    });

    const categoryAngles: Record<string, number> = {};
    const catKeys = Array.from(categorized.keys());
    catKeys.forEach((cat, idx) => {
      categoryAngles[cat] = (idx / catKeys.length) * 2 * Math.PI;
    });

    const nodesList: GraphNode[] = filteredReceipts.map((r, i) => {
      const degree = adjacencyMap.get(r.id)?.length || 0;
      const theme = CATEGORY_THEMES[r.category] || CATEGORY_THEMES.notes;
      const baseAngle = categoryAngles[r.category] || (i / count) * 2 * Math.PI;

      // Deterministic offset based on ID hash
      const hash = r.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const angleJitter = ((hash % 100) / 100 - 0.5) * 0.5;
      const distance = radiusBase * (0.35 + ((hash % 60) / 100));

      const angle = baseAngle + angleJitter;
      const x = cx + Math.cos(angle) * distance;
      const y = cy + Math.sin(angle) * distance;

      const node: GraphNode = {
        id: r.id,
        receipt: r,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: Math.min(18, Math.max(8, 7 + Math.sqrt(degree) * 2.5)),
        color: theme.color,
        degree,
      };
      map.set(r.id, node);
      return node;
    });

    return { nodes: nodesList, nodeMap: map };
  }, [filteredReceipts, dimensions, adjacencyMap]);

  // Filter connections between existing visible nodes
  const edges: GraphEdge[] = useMemo(() => {
    const list: GraphEdge[] = [];
    const seen = new Set<string>();

    connections.forEach((conn) => {
      if (nodeMap.has(conn.sourceId) && nodeMap.has(conn.targetId)) {
        const edgeKey = [conn.sourceId, conn.targetId].sort().join(':::');
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          list.push({
            id: edgeKey,
            source: conn.sourceId,
            target: conn.targetId,
            score: conn.score,
            reason: conn.primaryReason,
            weight: Math.max(1, (conn.score / 100) * 3.5),
          });
        }
      }
    });

    return list;
  }, [connections, nodeMap]);

  // Find neighbor nodes of the active/hovered node
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedNodeIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const neighbors = new Set<string>();
    neighbors.add(activeNodeId);
    const nodeConns = adjacencyMap.get(activeNodeId) || [];
    nodeConns.forEach((c) => neighbors.add(c.targetId));
    return neighbors;
  }, [activeNodeId, adjacencyMap]);

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    setHoveredNodeId(null);
  };

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  return (
    <section aria-label="Relationship network graph" className="relative flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 bg-zinc-900/50 px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Thread Isolator */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <select
              aria-label="Filter network by thread cluster"
              value={isolatedThreadId}
              onChange={(e) => setIsolatedThreadId(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all" className="bg-zinc-900 text-white">All Discovered Clusters</option>
              {threads.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  Thread: {t.title} ({t.receiptIds.length})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1 text-zinc-300">
            <Filter className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
            <select
              aria-label="Filter network by receipt category"
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 focus:outline-none"
            >
              <option value="all" className="bg-zinc-900 text-white">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900 text-white">
                  {CATEGORY_THEMES[cat].name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1" role="toolbar" aria-label="Graph view controls">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
            className="rounded p-1 text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            className="rounded p-1 text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <div className="h-3 w-px bg-zinc-800 mx-0.5" aria-hidden="true" />
          <button
            type="button"
            onClick={resetView}
            className="rounded p-1 text-zinc-400 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors"
            aria-label="Reset zoom and position"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative h-[560px] sm:h-[620px] w-full cursor-grab active:cursor-grabbing select-none overflow-hidden bg-radial-at-c from-zinc-900/30 via-zinc-950 to-black"
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          role="img"
          aria-label={`Interactive network graph displaying ${nodes.length} nodes and ${edges.length} connections`}
          className="overflow-visible"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="0.8" fill="#27272a" />
              </pattern>
            </defs>
            <rect
              x={-dimensions.width}
              y={-dimensions.height}
              width={dimensions.width * 3}
              height={dimensions.height * 3}
              fill="url(#graph-grid)"
            />

            {/* Render Edges */}
            <g className="edges">
              {edges.map((edge) => {
                const sNode = nodeMap.get(edge.source);
                const tNode = nodeMap.get(edge.target);
                if (!sNode || !tNode) return null;

                const isConnectedToActive =
                  activeNodeId && (edge.source === activeNodeId || edge.target === activeNodeId);
                const isDimmed = activeNodeId && !isConnectedToActive;

                return (
                  <line
                    key={edge.id}
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke={isConnectedToActive ? '#22d3ee' : '#3f3f46'}
                    strokeWidth={isConnectedToActive ? edge.weight * 1.5 : edge.weight}
                    strokeOpacity={isDimmed ? 0.08 : isConnectedToActive ? 0.9 : 0.25}
                    className="transition-all duration-200"
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                );
              })}
            </g>

            {/* Render Nodes */}
            <g className="nodes">
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isNeighbor = connectedNodeIds.has(node.id);
                const isDimmed = activeNodeId && !isNeighbor;

                return (
                  <g
                    key={node.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Node: ${node.receipt.title}, ${node.degree} connections. Press Enter to select, space to view details.`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-opacity duration-200 focus-visible:outline-none"
                    opacity={isDimmed ? 0.2 : 1}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setSelectedNodeId(node.id);
                      } else if (e.key === ' ') {
                        e.preventDefault();
                        openReceiptDetail(node.id);
                      }
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      openReceiptDetail(node.id);
                    }}
                  >
                    {/* Pulsing ring if selected or hovered */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={node.radius + 6}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        className="animate-spin-slow"
                        opacity={0.8}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={node.radius}
                      fill={node.color}
                      stroke="#09090b"
                      strokeWidth="2"
                      className="transition-transform duration-200 hover:scale-125"
                    />

                    {/* Central dot */}
                    <circle r={2.5} fill="#09090b" />

                    {/* Label for high-degree or hovered nodes */}
                    {(node.degree >= 4 || isHovered || isSelected || nodes.length < 25) && (
                      <text
                        y={node.radius + 12}
                        textAnchor="middle"
                        fontSize="9"
                        fill={isSelected || isHovered ? '#ffffff' : '#a1a1aa'}
                        fontFamily="monospace"
                        className="pointer-events-none select-none font-medium"
                      >
                        {node.receipt.title.slice(0, 16)}
                        {node.receipt.title.length > 16 ? '…' : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Edge Tooltip */}
        {hoveredEdge && (
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-xl border border-cyan-500/40 bg-zinc-950/90 p-3 text-xs backdrop-blur-md shadow-xl">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block">
              Discovered Relationship ({hoveredEdge.score}% score)
            </span>
            <span className="text-zinc-300 mt-1 block">{hoveredEdge.reason}</span>
          </div>
        )}

        {/* Selected Node Inspector Drawer (Floating bottom right) */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 z-20 w-80 max-w-[calc(100%-2rem)] rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center justify-between">
              <CategoryBadge category={selectedNode.receipt.category} size="sm" />
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1"
                aria-label="Dismiss inspector"
              >
                Dismiss
              </button>
            </div>

            <h4 className="mt-2 text-sm font-semibold font-display text-white line-clamp-1">
              {selectedNode.receipt.title}
            </h4>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
              {selectedNode.receipt.description}
            </p>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
              <span className="text-zinc-500 font-mono">
                {selectedNode.degree} links connected
              </span>
              <button
                type="button"
                onClick={() => openReceiptDetail(selectedNode.receipt.id)}
                className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-1"
              >
                <span>Full Details</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Helpful hint overlay */}
        <div className="pointer-events-none absolute top-3 left-4 text-[11px] font-mono text-zinc-500 bg-zinc-950/70 px-2 py-1 rounded border border-zinc-800/80">
          Showing {nodes.length} nodes · {edges.length} connections · Drag to pan · Scroll to zoom
        </div>
      </div>
    </section>
  );
};
