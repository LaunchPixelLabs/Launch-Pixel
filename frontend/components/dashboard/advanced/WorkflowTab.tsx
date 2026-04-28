'use client'
import React from 'react'
import SteeringCanvas from '../../SteeringCanvas'

interface WorkflowTabProps {
  onCanvasSave?: (state: any) => void
  canvasState?: any
  isLoading: boolean
}

export default function WorkflowTab({
  onCanvasSave, canvasState, isLoading
}: WorkflowTabProps) {
  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col min-h-0 relative z-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-sketch font-bold text-white">Live Workflow Steering</h2>
          <p className="text-sm text-zinc-500 font-sketch mt-1 max-w-xl">
            Orchestrate business logic paths. Connect triggers to tools like Knowledge Base, Calendar, and Intelligent Transfers.
          </p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             Simulation Live
           </div>
        </div>
      </div>
      <div className="flex-1 w-full rounded-[2rem] overflow-hidden border border-white/5 relative bg-[#050505] shadow-inner">
         <SteeringCanvas 
           onSave={onCanvasSave} 
           initialState={canvasState}
           isLoading={isLoading}
         />
      </div>
    </div>
  )
}
