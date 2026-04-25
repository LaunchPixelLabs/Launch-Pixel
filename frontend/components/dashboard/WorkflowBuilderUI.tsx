'use client'

import React, { useState, useCallback } from 'react';
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
  Node,
  Panel,
  MarkerType
} from '@xyflow/react';
import { motion } from 'framer-motion';
import '@xyflow/react/dist/style.css';
import { Save, MessageSquare, ArrowRight, PhoneOff, PhoneForwarded } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Greeting Node\n"Hello, how can I help you?"' },
    position: { x: 250, y: 25 },
    style: { 
      background: 'rgba(24, 24, 27, 0.8)', 
      color: 'white', 
      border: '1px solid rgba(99, 102, 241, 0.4)', 
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.15)',
      backdropFilter: 'blur(10px)',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500'
    }
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowBuilderUI() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
      ...params, 
      animated: true, 
      style: { stroke: '#818cf8', strokeWidth: 2, filter: 'drop-shadow(0 0 5px #818cf8)' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }
    }, eds)),
    [setEdges],
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      data: { label: `New ${type} Node` },
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      style: { 
        background: 'rgba(24, 24, 27, 0.8)', 
        color: 'white', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '16px'
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full min-h-[600px] bg-[#09090b]/60 border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl backdrop-blur-xl"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'rgba(129, 140, 248, 0.5)', strokeWidth: 2 }
        }}
      >
        <Controls className="bg-zinc-900 border-zinc-800 fill-white !rounded-xl overflow-hidden shadow-xl" />
        <Background gap={16} size={1} color="rgba(255,255,255,0.05)" />
        
        <Panel position="top-left" className="bg-zinc-900/60 p-2 rounded-xl border border-white/10 flex gap-2 backdrop-blur-md shadow-lg">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addNode('Context')} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-white transition">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Context
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addNode('Condition')} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs text-white transition">
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" /> If / Then
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addNode('Transfer')} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded-lg text-xs transition border border-indigo-500/20">
            <PhoneForwarded className="w-3.5 h-3.5" /> Transfer Call
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => addNode('End')} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-300 hover:bg-red-500/20 rounded-lg text-xs transition border border-red-500/20">
            <PhoneOff className="w-3.5 h-3.5" /> End Call
          </motion.button>
        </Panel>

        <Panel position="top-right">
           <motion.button 
             whileHover={{ scale: 1.02 }} 
             whileTap={{ scale: 0.98 }}
             className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-indigo-500/20"
           >
              <Save className="w-4 h-4" /> Save Workflow
           </motion.button>
        </Panel>
      </ReactFlow>
    </motion.div>
  );
}
