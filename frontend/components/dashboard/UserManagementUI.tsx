'use client'
import React, { useEffect, useRef } from 'react'
import { Users, UserPlus, Shield, Mail, Activity, Lock } from 'lucide-react'
import gsap from 'gsap'
import { motion } from 'framer-motion'

interface UserManagementUIProps {
  currentUserEmail?: string;
}

export default function UserManagementUI({ currentUserEmail }: UserManagementUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { opacity: 0, x: 20 }, 
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [])

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 lg:p-12 backdrop-blur-3xl max-w-6xl mx-auto w-full relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -ml-48 -mb-48 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
               <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-sketch font-bold text-white tracking-tight">Team Collaboration</h2>
          </div>
          <p className="text-sm text-zinc-500 font-sketch">Manage team members and access permissions for your AI workspace.</p>
        </div>
        <button className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <UserPlus className="w-4 h-4" /> Invite Team Member
        </button>
      </div>

      <div className="w-full border border-white/5 rounded-[2rem] overflow-hidden bg-black/40 backdrop-blur-xl relative z-10">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-white/[0.02] text-zinc-500 uppercase text-[10px] font-bold tracking-[0.3em]">
            <tr>
               <th className="px-8 py-5">Member</th>
               <th className="px-8 py-5">Role</th>
               <th className="px-8 py-5">Status</th>
               <th className="px-8 py-5 text-right">Activity</th>
            </tr>
          </thead>
          <tbody ref={containerRef} className="divide-y divide-white/5">
            {/* Current user */}
            <tr className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border border-white/10 text-lg">
                      {(currentUserEmail || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-sketch font-bold text-lg">You</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5 tracking-tight">{currentUserEmail || 'node@matrix.internal'}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className="flex items-center gap-2 text-zinc-300 font-sketch">
                  <Shield className="w-4 h-4 text-[#FEED01]" /> 
                  <span className="text-xs font-bold uppercase tracking-widest text-[#FEED01]">Administrator</span>
                </span>
              </td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synchronized
                </span>
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex flex-col items-end">
                   <span className="text-xs text-white font-mono">ACTIVE_ONLINE</span>
                   <span className="text-[10px] text-zinc-600 font-mono mt-1 italic">Real-time status monitoring</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-10 flex items-center justify-between px-4 relative z-10">
         <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-zinc-600" />
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Total Members: 1</p>
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Lock className="w-3 h-3" /> Secure Workspace
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#FEED01] font-mono uppercase tracking-widest">
              <Mail className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
            </div>
         </div>
      </div>
    </div>
  )
}
