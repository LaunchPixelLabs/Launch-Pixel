'use client';
import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import { 
  Play, Split, Search, PhoneIncoming, Calendar, Bot, 
  Trash2, Plus, Save, Loader2, CheckCircle, Database 
} from 'lucide-react';
import '@xyflow/react/dist/style.css';

// ─────────────────────── TYPES ───────────────────────
interface CanvasProps {
  onSave?: (state: { nodes: any[]; edges: any[]; enabledTools: string[] }) => void;
  initialState?: { nodes: any[]; edges: any[] } | null;
  isLoading?: boolean;
}

// ─────────────────────── CUSTOM NODES ───────────────────────

const PromptNode = ({ data }: NodeProps) => (
  <div className="bg-black/60 backdrop-blur-xl border border-[var(--lp-accent)] rounded-xl w-[320px] shadow-[0_0_20px_rgba(249,115,22,0.15)] overflow-hidden">
    <div className="bg-[var(--lp-accent)]/10 px-4 py-3 border-b border-[var(--lp-accent)]/30 flex items-center gap-2">
      <Play className="w-4 h-4 text-[var(--lp-accent)]" />
      <span className="font-bold text-white text-sm">Starting Point (Prompt)</span>
    </div>
    <div className="p-4 space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Instructions</p>
      <textarea 
        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[var(--lp-accent)] min-h-[100px] resize-none"
        defaultValue={data.label as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[var(--lp-accent)] border-2 border-black" />
  </div>
);

const KeywordNode = ({ data }: NodeProps) => (
  <div className="bg-zinc-950 backdrop-blur-xl border border-white/10 rounded-xl w-[280px] shadow-2xl overflow-hidden group">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400 border-2 border-black" />
    <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Split className="w-4 h-4 text-indigo-400" />
        <span className="font-bold text-white text-sm">Listen for Keyword</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    <div className="p-4 space-y-3 flex flex-col">
      <input 
        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 text-center font-mono"
        defaultValue={data.keyword as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
      <span className="text-xs text-zinc-500 text-center">If user says this, route to:</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-400 border-2 border-black" />
  </div>
);

const ActionNode = ({ data }: NodeProps) => {
  const iconMap: Record<string, React.ReactNode> = {
    knowledge: <Search className="w-4 h-4 text-emerald-400" />,
    transfer: <PhoneIncoming className="w-4 h-4 text-rose-400" />,
    calendar: <Calendar className="w-4 h-4 text-sky-400" />,
    default: <Bot className="w-4 h-4 text-purple-400" />,
  };
  return (
    <div className="bg-zinc-950 backdrop-blur-xl border border-white/10 rounded-xl w-[260px] shadow-2xl overflow-hidden group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400 border-2 border-black" />
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {iconMap[(data.icon as string) || 'default']}
          <span className="font-bold text-white text-sm">{data.title as string}</span>
        </div>
        {data.onDelete && (
          <button onClick={() => (data.onDelete as () => void)()} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-zinc-400">{data.description as string}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white/20 border-2 border-black" />
    </div>
  );
};

const InstructionNode = ({ data }: NodeProps) => (
  <div className="bg-zinc-900/80 backdrop-blur-xl border border-yellow-500/30 rounded-xl w-[300px] shadow-2xl overflow-hidden group">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-zinc-400 border-2 border-black" />
    <div className="bg-yellow-500/10 px-4 py-3 border-b border-yellow-500/20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4 text-yellow-400" />
        <span className="font-bold text-white text-sm">Custom Instruction</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    <div className="p-4 flex flex-col gap-2">
      <textarea 
        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-yellow-100/80 focus:outline-none focus:border-yellow-400/50 min-h-[80px] resize-none"
        placeholder="Add custom behavior, rules, or comments here..."
        defaultValue={data.instruction as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-yellow-400/50 border-2 border-black" />
  </div>
);

const nodeTypes = {
  prompt: PromptNode,
  keyword: KeywordNode,
  action: ActionNode,
  instruction: InstructionNode,
};

// ─────────────────────── DEFAULT STATE ───────────────────────

const defaultNodes = [
  { 
    id: '1', type: 'prompt', position: { x: 350, y: 50 }, 
    data: { label: 'You are the frontline assistant. Greet the user, ask how you can help, and listen for their response to route them correctly.' } 
  },
  { 
    id: '2', type: 'keyword', position: { x: 100, y: 350 }, 
    data: { keyword: 'pricing|cost|how much' } 
  },
  { 
    id: '3', type: 'keyword', position: { x: 600, y: 350 }, 
    data: { keyword: 'human|agent|manager' } 
  },
  { 
    id: '4', type: 'action', position: { x: 80, y: 560 }, 
    data: { icon: 'knowledge', title: 'RAG Lookup', description: 'Search knowledge base for pricing and product information.' } 
  },
  { 
    id: '5', type: 'action', position: { x: 580, y: 560 }, 
    data: { icon: 'transfer', title: 'Transfer Call', description: 'Forward the caller to your phone number.' } 
  },
  {
    id: '6', type: 'keyword', position: { x: 350, y: 350 },
    data: { keyword: 'book|schedule|appointment' }
  },
  {
    id: '7', type: 'action', position: { x: 330, y: 560 },
    data: { icon: 'calendar', title: 'Book Meeting', description: 'Schedule a meeting with the caller.' }
  },
];

const defaultEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
  { id: 'e1-6', source: '1', target: '6', animated: true, style: { stroke: '#f97316', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#818cf8', strokeWidth: 2 } },
  { id: 'e6-7', source: '6', target: '7', style: { stroke: '#818cf8', strokeWidth: 2 } },
];

// ─────────────────────── TOOL PALETTE ───────────────────────
const toolPalette = [
  { type: 'keyword', icon: Split, label: 'Keyword Router', color: 'text-indigo-400', defaults: { keyword: 'your keyword' } },
  { type: 'instruction', icon: Bot, label: 'Instruction Node', color: 'text-yellow-400', defaults: { instruction: '' } },
  { type: 'action', icon: Search, label: 'RAG Lookup', color: 'text-emerald-400', defaults: { icon: 'knowledge', title: 'RAG Lookup', description: 'Search knowledge base for answers.' } },
  { type: 'action', icon: PhoneIncoming, label: 'Transfer Call', color: 'text-rose-400', defaults: { icon: 'transfer', title: 'Transfer Call', description: 'Forward the caller to a human agent.' } },
  { type: 'action', icon: Calendar, label: 'Book Meeting', color: 'text-sky-400', defaults: { icon: 'calendar', title: 'Book Meeting', description: 'Schedule a meeting with the caller.' } },
];

// ─────────────────────── CANVAS COMPONENT ───────────────────────

export default function SteeringCanvas({ onSave, initialState, isLoading }: CanvasProps) {
  const idCounter = useRef(10);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState?.nodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState?.edges || defaultEdges);
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#f97316', strokeWidth: 2 }, animated: true }, eds)),
    [setEdges],
  );

  const addNode = useCallback((paletteItem: typeof toolPalette[0]) => {
    const newId = String(idCounter.current++);
    const newNode = {
      id: newId,
      type: paletteItem.type,
      position: { x: 300 + Math.random() * 200, y: 400 + Math.random() * 100 },
      data: { ...paletteItem.defaults },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowPalette(false);
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Derive which tools are enabled based on action nodes present on the canvas
  const enabledTools = useMemo(() => {
    const tools: string[] = [];
    for (const node of nodes) {
      if (node.type === 'action') {
        const icon = node.data?.icon as string;
        if (icon === 'knowledge' && !tools.includes('rag')) tools.push('rag');
        if (icon === 'transfer' && !tools.includes('transfer')) tools.push('transfer');
        if (icon === 'calendar' && !tools.includes('calendar')) tools.push('calendar');
      }
    }
    return tools;
  }, [nodes]);

  // Add delete callbacks to node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onDelete: n.id === '1' ? undefined : () => deleteNode(n.id), // Can't delete the start node
      },
    }));
  }, [nodes, deleteNode]);

  const handleSave = useCallback(() => {
    // Strip callback functions before saving (they can't be serialized)
    const cleanNodes = nodes.map(({ data, ...rest }) => {
      const { onDelete, onChange, ...cleanData } = data as any;
      return { ...rest, data: cleanData };
    });
    
    if (onSave) {
      onSave({ nodes: cleanNodes, edges, enabledTools });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [nodes, edges, enabledTools, onSave]);

  return (
    <div className="flex-1 w-full h-[800px] bg-[#050505] border border-white/10 rounded-2xl overflow-hidden relative">
      {/* Control Panel - Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-xl max-w-xs">
          <h3 className="text-white font-bold mb-1 text-sm">Conversation Logic</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3">
            Drag nodes to build your AI call flow. Connect keyword triggers to actions like RAG search, call transfer, or meeting booking.
          </p>
          
          {/* Active Tools Indicator */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {enabledTools.map(t => (
              <span key={t} className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[var(--lp-accent)]/10 text-[var(--lp-accent)] border border-[var(--lp-accent)]/20">
                {t}
              </span>
            ))}
            {enabledTools.length === 0 && (
              <span className="text-[10px] text-zinc-500">No tools active</span>
            )}
          </div>

          <button 
            onClick={() => setShowPalette(!showPalette)}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Node
          </button>
        </div>

        {/* Node Palette Dropdown */}
        {showPalette && (
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {toolPalette.map((item, idx) => (
              <button
                key={idx}
                onClick={() => addNode(item)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left border-b border-white/5 last:border-b-0"
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-sm text-white font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Save Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            saved 
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' 
              : 'bg-[var(--lp-accent)] text-black hover:opacity-90'
          } disabled:opacity-50`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {isLoading ? 'Syncing...' : saved ? 'Saved!' : 'Save Workflow'}
        </button>
      </div>

      {/* Tool Status Bar - Bottom */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2">
        <Database className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-400">{nodes.length} nodes</span>
        <span className="text-zinc-600">•</span>
        <span className="text-xs text-zinc-400">{edges.length} connections</span>
        <span className="text-zinc-600">•</span>
        <span className="text-xs text-[var(--lp-accent)]">{enabledTools.length} tools active</span>
      </div>

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Controls className="fill-white" style={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)' }} />
        <Background gap={24} size={2} color="rgba(255,255,255,0.05)" />
      </ReactFlow>
    </div>
  );
}
