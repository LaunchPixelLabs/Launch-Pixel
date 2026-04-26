'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, Shield, Zap, CheckCircle2, ArrowUpRight, 
  Clock, BarChart3, Wallet, Download, ChevronRight, Activity, Loader2 
} from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Plan {
  name: string;
  price: string;
  agents: number;
  minutes: number;
  tokens: string;
  features: string[];
  current: boolean;
  color: string;
}

export default function BillingTab({ currentUser }: { currentUser: any }) {
  const [activePlan, setActivePlan] = useState<string>('Starter')
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any>({ agents: 0, minutes: 0, tokens: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchBilling = async () => {
      if (!currentUser) return;
      try {
        const idToken = await currentUser.getIdToken();
        const res = await fetch(`${API_BASE}/api/billing/subscription?userId=${currentUser.uid}`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await res.json();
        if (data.success) {
          setSubscription(data.subscription);
          setUsage(data.usage);
          setActivePlan(data.subscription.plan.name);
        }
      } catch (e) {
        console.error("Billing fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBilling();
  }, [currentUser, API_BASE]);
  
  const plans: Plan[] = [
    {
      name: 'Starter',
      price: '$0',
      agents: 1,
      minutes: 100,
      tokens: '100K',
      features: ['Basic Voice Agents', 'Web Chat Integration', 'Email Support'],
      current: activePlan === 'Starter',
      color: 'from-zinc-400 to-zinc-600'
    },
    {
      name: 'Growth',
      price: '$49',
      agents: 5,
      minutes: 1000,
      tokens: '1M',
      features: ['WhatsApp Integration', 'Advanced Analytics', 'Custom Voices', 'Priority Support'],
      current: activePlan === 'Growth',
      color: 'from-[#FEED01] to-amber-500'
    },
    {
      name: 'Scale',
      price: '$199',
      agents: 20,
      minutes: 5000,
      tokens: '5M',
      features: ['Dedicated Account Manager', 'Custom API Access', 'SLA Guarantee', 'White-labeling'],
      current: activePlan === 'Scale',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  const invoices = [
    { id: 'INV-001', date: '2026-04-01', amount: '$0.00', status: 'Paid' },
    { id: 'INV-002', date: '2026-03-01', amount: '$0.00', status: 'Paid' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Shield className="w-3 h-3" />
            Secure Billing
          </div>
          <h2 className="text-5xl font-black italic tracking-tighter text-white uppercase">Subscription</h2>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest max-w-lg leading-relaxed">
            Manage your plan, billing details, and usage limits across all active neural agents.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#0d0d0f] p-4 rounded-2xl border border-white/5 shadow-2xl">
          <div className="text-right">
            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Plan</p>
            <p className="text-xs font-black uppercase text-[#FEED01]">{activePlan}</p>
          </div>
          <div className="w-10 h-10 bg-[#FEED01]/10 rounded-xl flex items-center justify-center text-[#FEED01]">
            <Zap className="w-5 h-5 fill-[#FEED01]" />
          </div>
        </div>
      </div>

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Agent Slots', value: `${usage.agents} / ${subscription?.plan?.agentLimit || 1}`, sub: 'Active Agents', icon: Activity, color: 'text-[#FEED01]' },
          { label: 'Voice Minutes', value: `${usage.minutes} / ${subscription?.plan?.minuteLimit || 100}`, sub: 'Monthly Usage', icon: Clock, color: 'text-emerald-400' },
          { label: 'Neural Tokens', value: `${(usage.tokens / 1000).toFixed(1)}K / ${(subscription?.plan?.tokenLimit / 1000).toFixed(0)}K`, sub: 'Context Processing', icon: BarChart3, color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0d0d0f] border border-white/5 rounded-[2rem] p-8 space-y-6 group hover:border-white/10 transition-all">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-zinc-800" /> : <BarChart3 className="w-4 h-4 text-zinc-800" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase">{stat.value}</h4>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-2">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div 
            key={plan.name} 
            className={`relative bg-[#0d0d0f] border rounded-[2.5rem] p-10 flex flex-col transition-all duration-500 group overflow-hidden ${
              plan.current ? 'border-[#FEED01]/40 shadow-[0_0_80px_rgba(254,237,1,0.05)]' : 'border-white/5 hover:border-white/10'
            }`}
          >
            {plan.current && (
              <div className="absolute top-0 right-0 p-6">
                <div className="bg-[#FEED01] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full italic">
                  Active
                </div>
              </div>
            )}
            
            <div className={`w-12 h-1.5 rounded-full bg-gradient-to-r ${plan.color} mb-8`} />
            
            <div className="mb-10">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white italic tracking-tighter uppercase">{plan.price}</span>
                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">/ month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-12 flex-1">
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{plan.agents} Agent Slots</span>
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{plan.minutes} Voice Minutes</span>
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{plan.tokens} Neural Tokens</span>
              </li>
              {plan.features.map((feature, fi) => (
                <li key={fi} className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                  <CheckCircle2 className="w-4 h-4 text-zinc-700" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all italic ${
                plan.current 
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-[#FEED01] shadow-xl hover:shadow-[0_0_30px_rgba(254,237,1,0.2)]'
              }`}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : 'Select ' + plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Financial Records */}
      <div className="bg-[#0d0d0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Billing History</h3>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">Transaction artifacts & logs</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-widest transition-colors">
            Manage Payment Method
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 px-10">
                <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Invoice</th>
                <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Date</th>
                <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Amount</th>
                <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-[9px] font-black text-zinc-600 uppercase tracking-widest text-right">Artifact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-10 py-6 text-xs font-black text-zinc-400 uppercase tracking-widest">{inv.id}</td>
                  <td className="px-10 py-6 text-xs font-bold text-zinc-500 uppercase tracking-widest">{inv.date}</td>
                  <td className="px-10 py-6 text-xs font-black text-white uppercase tracking-widest">{inv.amount}</td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-2 bg-white/5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
