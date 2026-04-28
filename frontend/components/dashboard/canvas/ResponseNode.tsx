'use client';
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare, Trash2 } from 'lucide-react';

export const ResponseNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-white/20 rounded-2xl w-[340px] shadow-2xl overflow-hidden group hover:border-[#FEED01] transition-all">
    <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-[#FEED01] !border-4 !border-black shadow-lg -top-2.5" />
    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-4 h-4 text-[#FEED01]" />
        <span className="font-sketch text-white font-bold uppercase text-xs tracking-widest">Script Response</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="text-zinc-600 hover:text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-5 space-y-4">
      <textarea 
        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#FEED01] min-h-[100px] resize-none font-sketch leading-relaxed"
        defaultValue={data.label as string}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
        placeholder="Enter agent script..."
      />
      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-1">
        <span>Emotional Tone: Warm</span>
        <span>Latent Delay: 1.2s</span>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-6 h-6 !bg-[#FEED01] !border-4 !border-black shadow-lg -bottom-3" />
  </div>
);
