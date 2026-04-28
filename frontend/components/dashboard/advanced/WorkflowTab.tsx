'use client'
import React, { useState } from 'react'
import { WORKFLOW_TEMPLATES, WorkflowTemplateKey } from '@/lib/workflow-templates'
import { Layers, ChevronDown } from 'lucide-react'
import SteeringCanvas from '../../SteeringCanvas'

interface WorkflowTabProps {
  onCanvasSave?: (state: any) => void
  canvasState?: any
  isLoading: boolean
}

export default function WorkflowTab({
  onCanvasSave, canvasState, isLoading
}: WorkflowTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateKey | ''>('')
  const [activeState, setActiveState] = useState(canvasState)
  const [showDropdown, setShowDropdown] = useState(false)

  const loadTemplate = (key: WorkflowTemplateKey) => {
    const t = WORKFLOW_TEMPLATES[key]
    if (t) {
      setActiveState({ nodes: t.nodes, edges: t.edges })
      setSelectedTemplate(key)
      setShowDropdown(false)
    }
  }

  return (
    <div className="flex-1 p-6 lg:p-10 flex flex-col min-h-0 relative z-10">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-sketch font-bold text-white">Live Workflow Steering</h2>
          <p className="text-sm text-zinc-500 font-sketch mt-1 max-w-xl">
            Orchestrate business logic paths. Connect triggers to tools like Knowledge Base, Calendar, and Intelligent Transfers.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-zinc-300 hover:border-[#FEED01]/30 transition-all font-sketch"
            >
              <Layers className="w-4 h-4 text-[#FEED01]" />
              {selectedTemplate ? WORKFLOW_TEMPLATES[selectedTemplate].name : 'Load Template'}
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                {Object.entries(WORKFLOW_TEMPLATES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => loadTemplate(key as WorkflowTemplateKey)}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-[#FEED01] hover:text-black transition-all font-sketch"
                  >
                    {val.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Simulation Live
          </div>
        </div>
      </div>
      <div className="flex-1 w-full rounded-[2rem] overflow-hidden border border-white/5 relative bg-[#050505] shadow-inner">
         <SteeringCanvas 
           onSave={onCanvasSave} 
           initialState={activeState || canvasState}
           isLoading={isLoading}
         />
      </div>
    </div>
  )
}
