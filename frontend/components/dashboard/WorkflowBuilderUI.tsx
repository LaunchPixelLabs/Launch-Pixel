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
  MarkerType
} from '@xyflow/react';
import { 
  Play, Split, Search, PhoneIncoming, Calendar, Bot, 
  Trash2, Plus, Save, Loader2, CheckCircle, Database,
  Clock, ShieldCheck, Zap, Activity, Brain, Network, Cpu
} from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────── CUSTOM NODES (Enterprise Style) ───────────────────────

const PromptNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e]/90 border-2 border-[#FEED01] rounded-[2rem] w-[360px] shadow-[0_0_40px_rgba(254,237,1,0.1)] overflow-hidden backdrop-blur-xl">
    <div className="bg-[#FEED01] px-6 py-4 border-b border-black/10 flex items-center gap-4">
      <div className="p-2 bg-black rounded-xl">
        <Bot className="w-5 h-5 text-[#FEED01]" />
      </div>
      <span className="font-sketch text-lg font-black text-black tracking-tight uppercase">Initial Engagement</span>
    </div>
    <div className="p-6 space-y-4 bg-black/20">
      <p className="text-[10px] text-[#FEED01] font-bold uppercase tracking-[0.3em] font-sketch opacity-70">Voice Output Protocol</p>
      <textarea 
        className="w-full bg-black/40 border border-[#FEED01]/10 rounded-2xl p-5 text-sm text-white focus:outline-none focus:border-[#FEED01]/50 min-h-[120px] resize-none font-mono leading-relaxed shadow-inner transition-all"
        defaultValue={data.label as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
    </div>
    <Handle type="source" position={Position.Bottom} className="w-5 h-5 bg-[#FEED01] border-4 border-black shadow-[0_0_15px_#FEED01]" />
  </div>
);

const KeywordNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e]/90 border-2 border-white/10 rounded-[1.5rem] w-[300px] shadow-2xl overflow-hidden group hover:border-[#FEED01]/50 transition-all backdrop-blur-xl">
    <Handle type="target" position={Position.Top} className="w-4 h-4 bg-[#FEED01] border-4 border-black shadow-[0_0_10px_#FEED01]" />
    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
      <div className="flex items-center gap-3">
        <Split className="w-4 h-4 text-[#FEED01]" />
        <span className="font-sketch text-xs font-bold text-white uppercase tracking-widest">Intent Router</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    <div className="p-6 space-y-4">
      <input 
        className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-3 text-sm text-[#FEED01] focus:outline-none focus:border-[#FEED01]/50 text-center font-mono shadow-inner transition-all"
        defaultValue={data.keyword as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
        placeholder="keyword1|keyword2"
      />
      <div className="flex justify-center">
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] font-mono">Branch Detection</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-[#FEED01] border-4 border-black shadow-[0_0_10px_#FEED01]" />
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
    <div className="bg-[#0c0c0e]/90 border-2 border-white/10 rounded-[1.5rem] w-[280px] shadow-2xl overflow-hidden group hover:border-[#FEED01] transition-all backdrop-blur-xl">
      <Handle type="target" position={Position.Top} className="w-4 h-4 bg-[#FEED01] border-4 border-black shadow-[0_0_10px_#FEED01]" />
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#FEED01]/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-950 rounded-lg text-[#FEED01]">
            {iconMap[type]}
          </div>
          <span className="font-sketch text-xs font-bold text-white uppercase tracking-widest">{data.title as string}</span>
        </div>
        {data.onDelete && (
          <button onClick={() => (data.onDelete as () => void)()} className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="p-6">
        <p className="text-xs text-zinc-400 leading-relaxed font-sketch opacity-80">{data.description as string}</p>
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
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#FEED01' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#FEED01', strokeWidth: 3 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#FEED01' } },
  { id: 'e2-4', source: '2', target: '4', style: { stroke: '#FEED01', strokeWidth: 2, strokeDasharray: '5,5' }, animated: true },
  { id: 'e3-5', source: '3', target: '5', style: { stroke: '#FEED01', strokeWidth: 2, strokeDasharray: '5,5' }, animated: true },
];

const toolPalette = [
  { type: 'keyword', icon: Split, label: 'Keyword Router', color: 'text-[#FEED01]', defaults: { keyword: 'your keyword' } },
  { type: 'action', icon: Search, label: 'Org Knowledge', color: 'text-[#FEED01]', defaults: { icon: 'knowledge', title: 'Knowledge Retrieval', description: 'Search shared organizational knowledge.' } },
  { type: 'action', icon: PhoneIncoming, label: 'Specialist Handoff', color: 'text-[#FEED01]', defaults: { icon: 'transfer', title: 'Specialist Handoff', description: 'Forward to a human expert.' } },
  { type: 'action', icon: Clock, label: 'Schedule Action', color: 'text-[#FEED01]', defaults: { icon: 'schedule', title: 'Schedule Follow-up', description: 'Set a delayed agent action.' } },
  { type: 'action', icon: ShieldCheck, label: 'Owner Approval', color: 'text-[#FEED01]', defaults: { icon: 'approval', title: 'Request Approval', description: 'Ask owner via WhatsApp before proceeding.' } },
];

// ─────────────────────── MAIN WORKFLOW COMPONENT ───────────────────────

export default function WorkflowBuilderUI() {
  const idCounter = useRef(10);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(defaultNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(defaultEdges as any);
  const [saved, setSaved] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
      ...params, 
      style: { stroke: '#FEED01', strokeWidth: 3 }, 
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#FEED01' }
    }, eds)),
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

  const nodesWithCallbacks = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onDelete: n.id === '1' ? undefined : () => deleteNode(n.id),
      },
    }));
  }, [nodes, deleteNode]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full h-full min-h-[800px] bg-[#050505] rounded-[3rem] overflow-hidden relative border border-white/5 shadow-3xl">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(254,237,1,0.05),_transparent)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      {/* Control Panel - Top Left */}
      <Panel position="top-left" className="m-8 space-y-4 z-20">
        <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] max-w-xs shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#FEED01] font-bold text-[9px] uppercase tracking-[0.4em]">
                <Brain className="w-4 h-4" />
                Workflow Orchestrator
              </div>
              <h4 className="text-2xl font-sketch text-white tracking-tight">Logic Flow</h4>
           </div>

           <p className="text-xs text-zinc-500 font-sketch leading-relaxed mb-6 opacity-80">
             Design your organic conversation flows. Map intents to actions like Org Memory, Specialist Handoff, or Autonomous Scheduling.
           </p>

           <div className="space-y-2">
              <button 
                onClick={() => setShowPalette(!showPalette)}
                className="w-full h-14 bg-[#FEED01] hover:bg-[#FEED01]/90 text-black text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_0_20px_rgba(254,237,1,0.2)]"
              >
                <Plus className="w-5 h-5" /> Ingest Module
              </button>
           </div>

           {/* Active Tools Indicator */}
           <div className="flex gap-2 flex-wrap pt-4 border-t border-white/5">
            {enabledTools.map(t => (
              <span key={t} className="px-3 py-1 text-[8px] font-bold uppercase rounded-full bg-[#FEED01]/10 text-[#FEED01] border border-[#FEED01]/20 tracking-widest">
                {t}
              </span>
            ))}
            {enabledTools.length === 0 && (
              <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">No Active Synapses</span>
            )}
          </div>
        </div>

        {/* Node Palette Dropdown */}
        <AnimatePresence>
          {showPalette && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl p-2 min-w-[240px]"
            >
              {toolPalette.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => addNode(item)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FEED01]/10 rounded-2xl transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-zinc-950 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold group-hover:text-white uppercase tracking-widest">{item.label}</span>
                  </div>
                  <Plus className="w-3 h-3 text-zinc-700 group-hover:text-[#FEED01]" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      {/* Save Button - Top Right */}
      <Panel position="top-right" className="m-8 z-20">
        <button
          onClick={handleSave}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-3xl transition-all ${
            saved 
              ? 'bg-emerald-500 text-black' 
              : 'bg-[#FEED01] text-black hover:scale-105 active:scale-95'
          }`}
        >
          {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? 'Workflow Saved!' : 'Save Logic'}
        </button>
      </Panel>

      {/* Bottom Telemetry */}
      <Panel position="bottom-center" className="mb-10 z-20">
         <div className="flex items-center gap-8 px-10 py-4 bg-zinc-950/80 border border-white/5 rounded-3xl backdrop-blur-3xl shadow-3xl">
            <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-[0.2em]">Flow Status: Stable</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{nodes.length} Segments</span>
               </div>
               <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{edges.length} Synapses</span>
               </div>
               <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-[#FEED01]" />
                  <span className="text-[9px] font-mono text-[#FEED01] uppercase tracking-widest">{enabledTools.length} Modules</span>
               </div>
            </div>
         </div>
      </Panel>

      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect as any}
        fitView
        colorMode="dark"
        minZoom={0.2}
        maxZoom={1.5}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Controls 
          position="bottom-right"
          className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl !m-8"
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-left"
          className="!bg-black/40 !border !border-white/5 !rounded-[2rem] !backdrop-blur-3xl !m-8 !w-[200px] !h-[140px]"
          maskColor="rgba(0,0,0,0.7)"
          nodeColor={(n) => {
            if (n.type === 'prompt') return '#FEED01';
            if (n.type === 'keyword') return '#3f3f46';
            return '#FEED01';
          }}
          zoomable
          pannable
        />
        <Background 
          gap={40} 
          size={1} 
          color="rgba(254,237,1,0.03)" 
          variant={'lines' as any} 
        />
      </ReactFlow>
    </div>
  );
}

function Panel({ children, position, className }: { children: React.ReactNode, position: string, className?: string }) {
  const positionClasses: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  };
  return (
    <div className={`absolute ${positionClasses[position]} ${className}`}>
      {children}
    </div>
  )
}
