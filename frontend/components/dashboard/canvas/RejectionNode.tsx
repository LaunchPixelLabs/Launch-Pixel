'use client';
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ShieldAlert, Trash2 } from 'lucide-react';

export const RejectionNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-rose-500/40 rounded-2xl w-[300px] shadow-[0_0_30px_rgba(244,63,94,0.1)] overflow-hidden group hover:border-rose-500 transition-all">
    <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-rose-500 !border-4 !border-black shadow-lg -top-2.5" />
    <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-rose-500/10">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-rose-500" />
        <span className="font-sketch text-rose-500 font-bold uppercase text-xs tracking-widest">Rejection Shield</span>
      </div>
      {data.onDelete && (
        <button onClick={() => (data.onDelete as () => void)()} className="text-zinc-600 hover:text-red-400 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="p-5 space-y-4">
       <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Counter-Logic For:</p>
       <input 
        className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 font-sketch"
        defaultValue={(data.trigger as string) || 'not interested|too expensive'}
        onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
      />
      <textarea 
        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-zinc-400 focus:outline-none focus:border-rose-500 min-h-[60px] resize-none font-sketch italic"
        defaultValue={(data.response as string) || 'I understand. However, most our clients felt the same until...'}
        onChange={(e) => { if (data.onResponseChange) (data.onResponseChange as (v: string) => void)(e.target.value); }}
      />
    </div>
    <Handle type="source" position={Position.Bottom} className="w-6 h-6 !bg-rose-500 !border-4 !border-black shadow-lg -bottom-3" />
  </div>
);
