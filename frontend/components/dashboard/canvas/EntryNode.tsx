'use client';
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Target } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const EntryNode = ({ data }: NodeProps) => (
  <div className="bg-[#0c0c0e] border-2 border-[#FEED01] rounded-2xl w-[280px] shadow-[0_0_40px_rgba(254,237,1,0.15)] overflow-hidden">
    <div className="bg-[#FEED01] px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Target className="w-5 h-5 text-black" />
        <span className="font-sketch text-sm font-black text-black uppercase tracking-tighter">Neural Entry</span>
      </div>
      <Badge variant="outline" className="bg-black/10 border-black/20 text-black text-[9px] font-bold">SOURCE</Badge>
    </div>
    <div className="p-5 space-y-3 bg-black/60">
      <div className="flex flex-col gap-1">
        <span className="text-[9px] text-[#FEED01] font-bold uppercase tracking-widest">Uplink Type</span>
        <select 
          className="bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none"
          defaultValue={data.type as string || 'inbound'}
          onChange={(e) => { if (data.onChange) (data.onChange as (v: string) => void)(e.target.value); }}
        >
          <option value="inbound">Inbound Reception</option>
          <option value="outreach">Outbound Outreach</option>
          <option value="whatsapp">WhatsApp Sequence</option>
        </select>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-6 h-6 !bg-[#FEED01] !border-4 !border-black shadow-lg -bottom-3" />
  </div>
);
