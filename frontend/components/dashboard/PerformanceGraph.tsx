'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'

interface GraphData {
  name: string;
  revenue: number;
  calls: number;
}

interface PerformanceGraphProps {
  data?: GraphData[];
  stats?: {
    revenue: number;
    calls: number;
  };
}

const defaultData = [
  { name: 'Mon', revenue: 4200, calls: 32 },
  { name: 'Tue', revenue: 3800, calls: 28 },
  { name: 'Wed', revenue: 5100, calls: 45 },
  { name: 'Thu', revenue: 4900, calls: 38 },
  { name: 'Fri', revenue: 6200, calls: 52 },
  { name: 'Sat', revenue: 5800, calls: 48 },
  { name: 'Sun', revenue: 7400, calls: 65 },
]

export default function PerformanceGraph({ data = defaultData, stats }: PerformanceGraphProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#141418] border border-white/10 rounded-[3rem] p-10 mb-8 relative overflow-hidden group hover:border-[#FEED01]/30 transition-all duration-700 shadow-2xl"
    >
      {/* Background Decorative Mesh */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FEED01]/5 blur-[120px] rounded-full -mr-64 -mt-64 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-[#FEED01] transition-colors duration-500">Weekly Overview</h3>
            <div className="flex items-center gap-1.5 bg-[#FEED01]/10 px-2 py-0.5 rounded-full border border-[#FEED01]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FEED01] animate-ping" />
              <span className="text-[8px] font-black text-[#FEED01] uppercase tracking-widest">Live</span>
            </div>
          </div>
          <p className="text-[11px] font-medium text-zinc-400 ml-1">Revenue & calls this week</p>
        </div>
        
        <div className="flex items-center gap-8 bg-white/8 px-6 py-3 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEED01] shadow-[0_0_10px_rgba(254,237,1,0.5)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Revenue</span>
              <span className="text-xs font-bold text-white tracking-tight">${stats?.revenue?.toLocaleString() || '0'}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Calls</span>
              <span className="text-xs font-bold text-white tracking-tight">{stats?.calls?.toLocaleString() || '0'} Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FEED01" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#FEED01" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#3f3f46', fontSize: 10, fontWeight: 'bold' }} 
              dy={15}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
              contentStyle={{ 
                backgroundColor: '#0d0d12', 
                border: '1px solid rgba(254,237,1,0.2)', 
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              labelStyle={{ color: '#52525b', marginBottom: '8px', fontSize: '9px', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#FEED01" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRev)" 
              animationDuration={2500}
              animationEasing="ease-in-out"
            />
            <Area 
              type="monotone" 
              dataKey="calls" 
              stroke="#3b82f6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCalls)" 
              animationDuration={2500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
