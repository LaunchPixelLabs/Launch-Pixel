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
  Clock, ShieldCheck, Zap, MessageSquare, ShieldAlert,
  ArrowRightCircle, Target, Users
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import '@xyflow/react/dist/style.css';

import { EntryNode } from './dashboard/canvas/EntryNode';
import { ResponseNode } from './dashboard/canvas/ResponseNode';
import { RejectionNode } from './dashboard/canvas/RejectionNode';
import { KeywordNode } from './dashboard/canvas/KeywordNode';
import { ActionNode } from './dashboard/canvas/ActionNode';

import '@xyflow/react/dist/style.css';

// ─────────────────────── TYPES ───────────────────────
interface CanvasProps {
  onSave?: (state: { nodes: any[]; edges: any[]; enabledTools: string[] }) => void;
  initialState?: { nodes: any[]; edges: any[] } | null;
  isLoading?: boolean;
}

const nodeTypes = {
  entry: EntryNode,
  response: ResponseNode,
  rejection: RejectionNode,
  keyword: KeywordNode,
  action: ActionNode,
};

// ─────────────────────── DEFAULT STATE ───────────────────────

const defaultNodes = [
  { 
    id: '1', type: 'entry', position: { x: 350, y: 50 }, 
    data: { type: 'inbound' } 
  },
  { 
    id: '2', type: 'response', position: { x: 320, y: 250 }, 
    data: { label: 'Greeting: Welcome to LaunchPixel. How can I help your business today?' } 
  },
  { 
    id: '3', type: 'keyword', position: { x: 50, y: 550 }, 
    data: { keyword: 'pricing|cost|how much' } 
  },
  { 
    id: '4', type: 'keyword', position: { x: 600, y: 550 }, 
    data: { keyword: 'human|agent|manager' } 
  },
];

const defaultEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 } },
];

// ─────────────────────── TOOL PALETTE ───────────────────────
const toolPalette = [
  { type: 'response', icon: MessageSquare, label: 'Script Response', color: 'text-white', defaults: { label: 'New agent dialogue step...' } },
  { type: 'rejection', icon: ShieldAlert, label: 'Rejection Shield', color: 'text-rose-500', defaults: { trigger: 'no|not interested', response: 'Counter-argument...' } },
  { type: 'keyword', icon: Split, label: 'Intent Trigger', color: 'text-[#FEED01]', defaults: { keyword: 'your keyword' } },
  { type: 'action', icon: Search, label: 'Org Knowledge', color: 'text-[#FEED01]', defaults: { icon: 'knowledge', title: 'Knowledge Retrieval', description: 'Search shared organizational knowledge.' } },
  { type: 'action', icon: PhoneIncoming, label: 'Specialist Handoff', color: 'text-[#FEED01]', defaults: { icon: 'transfer', title: 'Specialist Handoff', description: 'Forward to a human expert.' } },
  { type: 'action', icon: Clock, label: 'Schedule Action', color: 'text-[#FEED01]', defaults: { icon: 'schedule', title: 'Schedule Follow-up', description: 'Set a delayed agent action.' } },
];

// ─────────────────────── CANVAS COMPONENT ───────────────────────

export default function SteeringCanvas({ onSave, initialState, isLoading }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialState?.nodes || defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialState?.edges || defaultEdges);
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  // Sync state when initialState changes
  React.useEffect(() => {
    if (initialState) {
      setNodes(initialState.nodes || defaultNodes);
      setEdges(initialState.edges || defaultEdges);
    } else {
      setNodes(defaultNodes);
      setEdges(defaultEdges);
    }
  }, [initialState, setNodes, setEdges]);

  const idCounter = useRef(Date.now());

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, style: { stroke: '#FEED01', strokeWidth: 4 }, animated: true }, eds)),
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

  // Derive which tools are enabled
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

  // Add callbacks to node data
  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onDelete: n.id === '1' ? undefined : () => deleteNode(n.id),
      },
    }));
  }, [nodes, deleteNode]);

  const handleSave = useCallback(() => {
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
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="bg-black/80 backdrop-blur-3xl border-2 border-[#FEED01]/30 p-5 rounded-2xl max-w-xs shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3 mb-2">
            <Bot className="w-6 h-6 text-[#FEED01]" />
            <h3 className="text-white font-sketch font-black text-xl uppercase tracking-tighter italic">Sketch Matrix</h3>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed mb-4 font-sketch">
            Orchestrate your agent's neural pathways. Handle objections, branch intents, and script responses for 100% conversion.
          </p>
          
          <button 
            onClick={() => setShowPalette(!showPalette)}
            className="w-full px-4 py-3 bg-[#FEED01] hover:bg-[#FEED01]/90 text-black text-sm font-black uppercase rounded-xl transition-all flex items-center justify-center gap-3 font-sketch shadow-[0_0_20px_rgba(254,237,1,0.2)] hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 stroke-[3px]" /> Ingest Neural Link
          </button>
        </div>

        {showPalette && (
          <div className="bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl p-1 w-64">
            {toolPalette.map((item, idx) => (
              <button
                key={idx}
                onClick={() => addNode(item)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FEED01] hover:text-black transition-all text-left rounded-xl group"
              >
                <item.icon className={`w-4 h-4 ${item.color} group-hover:text-black transition-colors`} />
                <div className="flex flex-col">
                  <span className="text-xs text-white font-sketch font-bold group-hover:text-black">{item.label}</span>
                  <span className="text-[9px] text-zinc-500 group-hover:text-black/60 font-sketch">Add logic block</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Indicators - Top Middle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex gap-2 p-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
          {['Logic', 'Voice', 'Tools', 'Knowledge'].map(cat => (
             <div key={cat} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2 hover:bg-white/5 transition-all">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                {cat}
             </div>
          ))}
        </div>
      </div>

      {/* Sync Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-sketch font-black uppercase text-sm shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all ${
            saved 
              ? 'bg-emerald-500 text-black' 
              : 'bg-[#FEED01] text-black hover:scale-105 active:scale-95'
          } disabled:opacity-50`}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Zap className="w-5 h-5 fill-current" />}
          {isLoading ? 'Syncing...' : saved ? 'Synced' : 'Sync Matrix'}
        </button>
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
        minZoom={0.2}
        maxZoom={1.5}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Controls 
          position="bottom-right"
          className="!bg-zinc-900 !border !border-white/10 !rounded-2xl !overflow-hidden !shadow-2xl"
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-left"
          className="!bg-black/60 !border !border-white/10 !rounded-[2rem] !backdrop-blur-3xl !shadow-2xl"
          maskColor="rgba(0,0,0,0.8)"
          nodeColor={(n) => {
            if (n.type === 'entry') return '#FEED01';
            if (n.type === 'rejection') return '#f43f5e';
            return '#27272a';
          }}
          zoomable
          pannable
        />
        <Background 
          gap={40} 
          size={1} 
          color="rgba(254,237,1,0.05)" 
          variant={'lines' as any} 
        />
      </ReactFlow>
    </div>
  );
}
