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
  Trash2, Plus, Save, Loader2, CheckCircle, Database,
  Clock, ShieldCheck, Zap
} from 'lucide-react';
import '@xyflow/react/dist/style.css';

/**
 * SKETCH MATRIX — Autonomous Workflow Canvas
 * Ported from CanvasX Sketch.
 */

// ─────────────────────── TYPES ───────────────────────
interface CanvasProps {
  onSave?: (state: { nodes: any[]; edges: any[]; enabledTools: string[] }) => void;
  initialState?: { nodes: any[]; edges: any[] } | null;
  isLoading?: boolean;
}

// ─────────────────────── CUSTOM NODES ───────────────────────

const PromptNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-[#FEED01] rounded-2xl w-[360px] shadow-[8px_8px_0px_0px_#FEED01] overflow-hidden">
    <div className="bg-[#FEED01] px-5 py-3 border-b-2 border-black flex items-center gap-3">
      <Bot className="w-5 h-5 text-black" />
      <span className="font-sketch text-lg font-bold text-black tracking-tight">System Teammate</span>
    </div>
    <div className="p-5 space-y-3 bg-black/40">
      <p className="text-[10px] text-[#FEED01] font-bold uppercase tracking-[0.2em] font-sketch">Core Instructions</p>
      <textarea 
        className="w-full bg-white/5 border border-[#FEED01]/20 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#FEED01] min-h-[140px] resize-none font-sketch leading-relaxed"
        defaultValue={data.label as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
    </div>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#FEED01] border-2 border-black" />
  </div>
);

const KeywordNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-white/10 rounded-2xl w-[300px] shadow-2xl overflow-hidden group hover:border-[#FEED01]/50 transition-all">
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#FEED01] border-2 border-black" />
    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Split className="w-4 h-4 text-[#FEED01]" />
        <span className="font-sketch text-white font-bold">Intent Trigger</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="text-zinc-600 hover:text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-5 space-y-4">
      <input 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#FEED01] focus:outline-none focus:border-[#FEED01] text-center font-sketch"
        defaultValue={data.keyword as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
        placeholder="e.g. pricing|cost"
      />
      <p className="text-[10px] text-zinc-500 text-center font-bold uppercase tracking-widest">Branch on detection</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#FEED01] border-2 border-black" />
  </div>
);

const ActionNode = ({ data }: NodeProps) => {
  const iconMap: Record<string, React.ReactNode> = {
    knowledge: <Search className="w-5 h-5" />,
    transfer: <PhoneIncoming className="w-5 h-5" />,
    calendar: <Calendar className="w-5 h-5" />,
    schedule: <Clock className="w-5 h-5" />,
    approval: <ShieldCheck className="w-5 h-5" />,
    default: <Zap className="w-5 h-5" />,
  };
  
  const type = (data.icon as string) || 'default';

  return (
    <div className="bg-[#0c0c0e] border-2 border-white/20 rounded-2xl w-[280px] shadow-xl overflow-hidden group hover:border-[#FEED01] transition-all">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#FEED01] border-2 border-black" />
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="text-[#FEED01]">
            {iconMap[type]}
          </div>
          <span className="font-sketch text-white font-bold">{data.title as string}</span>
        </div>
        {data.onDelete && (
          <button onClick={() => (data.onDelete as () => void)()} className="text-zinc-600 hover:text-red-400 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-zinc-400 leading-relaxed font-sketch">{data.description as string}</p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-white/20 border-2 border-black" />
    </div>
  );
};


const nodeTypes = {
  prompt: PromptNode,
  keyword: KeywordNode,
  action: ActionNode,
};

// ─────────────────────── DEFAULT STATE ───────────────────────

const defaultNodes = [
  { 
    id: '1', type: 'prompt', position: { x: 350, y: 50 }, 
    data: { label: 'Greeting: Welcome to LaunchPixel. How can I help your business today?' } 
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
    data: { icon: 'knowledge', title: 'Knowledge Retrieval', description: 'Search shared org memory.' } 
  },
  { 
    id: '5', type: 'action', position: { x: 580, y: 560 }, 
    data: { icon: 'transfer', title: 'Specialist Handoff', description: 'Forward to human expert.' } 
  },
];

const defaultEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#FEED01', strokeWidth: 2, strokeDasharray: '5,5' } },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#FEED01', strokeWidth: 2, strokeDasharray: '5,5' } },
];

// ─────────────────────── TOOL PALETTE ───────────────────────
const toolPalette = [
  { type: 'keyword', icon: Split, label: 'Keyword Router', color: 'text-[#FEED01]', defaults: { keyword: 'your keyword' } },
  { type: 'action', icon: Search, label: 'Org Knowledge', color: 'text-[#FEED01]', defaults: { icon: 'knowledge', title: 'Knowledge Retrieval', description: 'Search shared organizational knowledge.' } },
  { type: 'action', icon: PhoneIncoming, label: 'Specialist Handoff', color: 'text-[#FEED01]', defaults: { icon: 'transfer', title: 'Specialist Handoff', description: 'Forward to a human expert.' } },
  { type: 'action', icon: Clock, label: 'Schedule Action', color: 'text-[#FEED01]', defaults: { icon: 'schedule', title: 'Schedule Follow-up', description: 'Set a delayed agent action.' } },
  { type: 'action', icon: ShieldCheck, label: 'Owner Approval', color: 'text-[#FEED01]', defaults: { icon: 'approval', title: 'Request Approval', description: 'Ask owner via WhatsApp before proceeding.' } },
];

// ─────────────────────── CANVAS COMPONENT ───────────────────────

export default function SteeringCanvas({ onSave, initialState, isLoading }: CanvasProps) {
  const idCounter = useRef(10);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState?.nodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState?.edges || defaultEdges);
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#FEED01', strokeWidth: 3 }, animated: true }, eds)),
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
        if (icon === 'knowledge' && !tools.includes('knowledge')) tools.push('knowledge');
        if (icon === 'transfer' && !tools.includes('handoff')) tools.push('handoff');
        if (icon === 'schedule' && !tools.includes('scheduler')) tools.push('scheduler');
        if (icon === 'approval' && !tools.includes('hitl')) tools.push('hitl');
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
        <div className="bg-black/80 backdrop-blur-xl border-2 border-[#FEED01]/20 p-4 rounded-xl max-w-xs shadow-2xl">
          <h3 className="text-[#FEED01] font-sketch font-bold mb-1 text-lg">Logic Matrix</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-3 font-sketch">
            Design your organic conversation flows. Map intents to actions like Org Memory, Specialist Handoff, or Autonomous Scheduling.
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
            className="w-full px-4 py-2 bg-[#FEED01] hover:bg-[#FEED01]/90 text-black text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 font-sketch"
          >
            <Plus className="w-5 h-5" /> Ingest Skill
          </button>
        </div>

        {/* Node Palette Dropdown */}
        {showPalette && (
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {toolPalette.map((item, idx) => (
              <button
                key={idx}
                onClick={() => addNode(item)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FEED01]/10 transition text-left border-b border-white/5 last:border-b-0 group"
              >
                <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm text-white font-sketch group-hover:text-[#FEED01]">{item.label}</span>
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
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-sketch font-bold text-base shadow-2xl transition-all ${
            saved 
              ? 'bg-emerald-500 text-black' 
              : 'bg-[#FEED01] text-black hover:scale-105 active:scale-95'
          } disabled:opacity-50`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {isLoading ? 'Syncing Matrix...' : saved ? 'Matrix Synced!' : 'Sync Matrix'}
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
        <Background gap={32} size={1} color="rgba(255,255,255,0.03)" variant={'dots' as any} />
      </ReactFlow>
    </div>
  );
}
