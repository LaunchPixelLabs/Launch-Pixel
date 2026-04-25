'use client';
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Split, Trash2 } from 'lucide-react';

export const KeywordNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-white/10 rounded-2xl w-[300px] shadow-2xl overflow-hidden group hover:border-[#FEED01]/50 transition-all">
    <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-[#FEED01] !border-4 !border-black shadow-lg -top-2.5" />
    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Split className="w-4 h-4 text-[#FEED01]" />
        <span className="font-sketch text-white font-bold uppercase text-xs tracking-widest">Intent Trigger</span>
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
    <Handle type="source" position={Position.Bottom} className="w-6 h-6 !bg-[#FEED01] !border-4 !border-black shadow-lg -bottom-3" />
  </div>
);
