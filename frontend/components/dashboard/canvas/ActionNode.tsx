'use client';
import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Search, PhoneIncoming, Calendar, Clock, ShieldCheck, Zap, Trash2, MessageSquare } from 'lucide-react';

export const ActionNode = ({ data }: NodeProps) => {
  const iconMap: Record<string, React.ReactNode> = {
    knowledge: <Search className="w-5 h-5" />,
    transfer: <PhoneIncoming className="w-5 h-5" />,
    calendar: <Calendar className="w-5 h-5" />,
    schedule: <Clock className="w-5 h-5" />,
    approval: <ShieldCheck className="w-5 h-5" />,
    whatsapp_admin: <MessageSquare className="w-5 h-5" />,
    default: <Zap className="w-5 h-5" />,
  };
  
  const type = (data.icon as string) || 'default';

  return (
    <div className="bg-[#0c0c0e] border-2 border-white/20 rounded-2xl w-[280px] shadow-xl overflow-hidden group hover:border-[#FEED01] transition-all">
      <Handle type="target" position={Position.Top} className="w-5 h-5 !bg-[#FEED01] !border-4 !border-black shadow-lg -top-2.5" />
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-3">
          <div className="text-[#FEED01]">
            {iconMap[type]}
          </div>
          <span className="font-sketch text-white font-bold uppercase text-xs tracking-widest">{data.title as string}</span>
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
      <Handle type="source" position={Position.Bottom} className="w-5 h-5 !bg-white/20 !border-4 !border-black shadow-lg -bottom-2.5" />
    </div>
  );
};
