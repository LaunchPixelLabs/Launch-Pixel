'use client'
import React from 'react'
import { Shield, Zap } from 'lucide-react'

export default function BillingTab() {
  return (
    <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Billing & API Matrix</h3>
          <p className="text-sm text-zinc-400">Manage your agent's commercial status and API access.</p>
        </div>
        <button className="px-6 py-2 bg-[var(--lp-accent)] text-black font-bold rounded-xl text-sm hover:opacity-90 transition">
          Upgrade Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--lp-accent)] font-bold uppercase text-xs tracking-widest">
            <Shield className="w-4 h-4" />
            Current Status
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-2xl font-bold text-white">Growth Matrix</p>
              <p className="text-sm text-zinc-500">Active since April 2026</p>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold border border-green-500/30">
              HEALTHY
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-widest">
            <Zap className="w-4 h-4" />
            API Key Matrix
          </div>
          <div className="space-y-3">
            <label className="text-xs text-zinc-500 font-medium">YOUR MASTER KEY</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                readOnly 
                value="lp_live_xxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-300 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-white/[0.02] text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
            <tr>
              <th className="px-6 py-3">Metric</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Usage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="px-6 py-4 text-white">Matrix Calls</td>
              <td className="px-6 py-4"><span className="text-green-400">● Live</span></td>
              <td className="px-6 py-4">1,242 calls</td>
            </tr>
            <tr>
              <td className="px-6 py-4 text-white">Neural Tokens</td>
              <td className="px-6 py-4"><span className="text-green-400">● Live</span></td>
              <td className="px-6 py-4">42.5M</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
