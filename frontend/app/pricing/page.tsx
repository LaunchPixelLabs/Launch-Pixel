'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Zap, Shield, Globe, Cpu, Phone, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  cta, 
  popular = false, 
  tier = 'starter' 
}: { 
  title: string, 
  price: string, 
  description: string, 
  features: string[], 
  cta: string, 
  popular?: boolean,
  tier?: string
}) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`relative p-8 rounded-3xl border ${popular ? 'border-[var(--lp-accent)] bg-white/5' : 'border-white/10 bg-black/40'} backdrop-blur-xl flex flex-col h-full overflow-hidden group`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-[var(--lp-accent)] text-black text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          <span className="text-zinc-500 text-sm">one-time</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
            <div className="mt-1 w-4 h-4 rounded-full bg-[var(--lp-accent)]/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-[var(--lp-accent)]" />
            </div>
            {feature}
          </li>
        ))}
      </ul>

      <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
        popular 
          ? 'bg-[var(--lp-accent)] text-black hover:opacity-90 shadow-[0_0_20px_rgba(var(--lp-accent-rgb),0.3)]' 
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}>
        {cta}
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Decorative Gradient */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[var(--lp-accent)]/10 blur-[80px] rounded-full group-hover:bg-[var(--lp-accent)]/20 transition-all" />
    </motion.div>
  )
}

export default function PricingPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.from('.pricing-card', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out'
      })
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--lp-accent)]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[var(--lp-accent)] text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Pricing Plans
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Invest in Your <span className="text-gradient">Sales Monster</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            Premium, high-performance AI agents designed to dominate your market. 
            One-time payment. Infinite scalability.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          <div className="pricing-card">
            <PricingTier 
              title="Starter Matrix"
              price="$20,000"
              description="Perfect for small businesses scaling their first outbound operations."
              features={[
                "2 High-Performance AI Agents",
                "Advanced Voice Synthesis (11Labs)",
                "Basic Workflow Steering",
                "Knowledge Base (Up to 10 sources)",
                "Standard API Access",
                "Email Support",
                "Twilio Integration"
              ]}
              cta="Deploy Starter Matrix"
              tier="starter"
            />
          </div>

          <div className="pricing-card">
            <PricingTier 
              title="Growth Matrix"
              price="$40,000"
              popular={true}
              description="Our most popular choice for aggressive scaling and complex workflows."
              features={[
                "5 High-Performance AI Agents",
                "Premium Voice Matrix (Ultra-low latency)",
                "Advanced Canvas Workflow Builder",
                "Full Sketch Integration (All Plugins)",
                "Unlimited Knowledge Base Sources",
                "Priority API Key Management",
                "Priority 24/7 Support",
                "Custom Tool Integration"
              ]}
              cta="Deploy Growth Matrix"
              tier="growth"
            />
          </div>

          <div className="pricing-card">
            <PricingTier 
              title="Enterprise Engine"
              price="Custom"
              description="Bespoke AI infrastructure for global enterprises and high-volume operations."
              features={[
                "Unlimited AI Agents",
                "Dedicated GPU Clusters",
                "Custom LLM Fine-tuning",
                "White-label API & Dashboard",
                "Dedicated Solution Architect",
                "On-premise Deployment Option",
                "SLA Guarantees",
                "Custom Compliance Matrix"
              ]}
              cta="Contact Sales"
              tier="enterprise"
            />
          </div>
        </div>

        {/* Comparison Section Preview */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h4 className="text-white font-bold">Ultra Latency</h4>
              <p className="text-zinc-500 text-sm">Average 500ms response time globally.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="text-white font-bold">Secure Matrix</h4>
              <p className="text-zinc-500 text-sm">Enterprise-grade prompt injection protection.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="text-white font-bold">Global Presence</h4>
              <p className="text-zinc-500 text-sm">Numbers and voices in 80+ countries.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-white font-bold">Tool Power</h4>
              <p className="text-zinc-500 text-sm">Full CanvasX Sketch plugin ecosystem.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .text-gradient {
          background: linear-gradient(to right, var(--lp-accent), #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  )
}
