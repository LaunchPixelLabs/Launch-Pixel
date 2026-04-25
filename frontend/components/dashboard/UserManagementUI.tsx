'use client'
import React, { useEffect, useRef } from 'react'
import { Users, UserPlus, Shield, Mail } from 'lucide-react'
import gsap from 'gsap'

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
    <div className="flex flex-col h-full bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Users className="w-6 h-6 text-indigo-400" /> Team Workspace</h2>
          <p className="text-sm text-zinc-400">Manage team members and permissions for your AI agent workspace.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-zinc-200 font-semibold rounded-xl transition">
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-black/50">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/80 text-zinc-300 font-medium">
            <tr>
               <th className="px-6 py-4">User</th>
               <th className="px-6 py-4">Role</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4">Last Active</th>
            </tr>
          </thead>
          <tbody ref={containerRef} className="divide-y divide-white/5">
            {/* Current user — always shown */}
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lp-accent)] to-indigo-600 flex items-center justify-center text-white font-bold border border-white/10">
                    {(currentUserEmail || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">You</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{currentUserEmail || 'Not signed in'}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Owner
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 text-zinc-400">Just now</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center justify-between px-2">
         <p className="text-xs text-zinc-500">1 member</p>
         <div className="flex items-center gap-2 text-xs text-zinc-500">
           <Mail className="w-3.5 h-3.5" />
           <span>Invite teammates to collaborate on agent configurations</span>
         </div>
      </div>
    </div>
  )
}
