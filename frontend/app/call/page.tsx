"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Phone, PhoneIncoming, PhoneOutgoing, Upload, Settings, BarChart3, MessageCircle, Clock, Shield, Zap, Brain, Users, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import SplitTextReveal from "../../components/SplitTextReveal"
import MagneticButton from "../../components/MagneticButton"

const features = [
  {
    icon: PhoneOutgoing,
    title: "Outbound Sales Agent",
    description: "Proactively calls your leads, handles objections like a top closer, and books meetings on autopilot.",
    gradient: "from-zinc-700 to-zinc-900",
  },
  {
    icon: PhoneIncoming,
    title: "Inbound Receptionist",
    description: "Answers every call instantly — handles queries, books appointments, and never puts anyone on hold.",
    gradient: "from-zinc-800 to-black",
  },
  {
    icon: Brain,
    title: "Trained On Your Business",
    description: "Upload your docs, paste your website — the agent learns your products, pricing, and tone in minutes.",
    gradient: "from-zinc-700 to-zinc-800",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Alerts",
    description: "Instant WhatsApp notification the moment a booking is confirmed. You close the deal, agent does the rest.",
    gradient: "from-zinc-800 to-zinc-900",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Never miss a lead again. Your AI agent works nights, weekends, and holidays without a break.",
    gradient: "from-zinc-700 to-black",
  },
  {
    icon: Shield,
    title: "Human-Level Precision",
    description: "Natural conversation with empathy, humor, and objection handling that rivals your best salesperson.",
    gradient: "from-zinc-800 to-zinc-900",
  },
]

const steps = [
  {
    step: "01",
    title: "Train",
    description: "Upload PDFs, paste your website URL, or type in your product details. The agent absorbs everything about your business in minutes.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Configure",
    description: "Choose a voice, set the personality, and customize the sales script. Preview live before going live.",
    icon: Settings,
  },
  {
    step: "03",
    title: "Deploy",
    description: "Upload your contacts and start calling — or share your inbound number and let the agent handle every incoming lead.",
    icon: Phone,
  },
]

const stats = [
  { value: "80%", label: "Close Rate Efficiency" },
  { value: "24/7", label: "Always Available" },
  { value: "<2s", label: "Response Time" },
  { value: "100+", label: "Concurrent Calls" },
]

export default function CallPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mb-8 backdrop-blur-sm">
                <Phone className="w-4 h-4" />
                <span>Launch Pixel AI Agent</span>
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 font-display">
              <SplitTextReveal mode="words" as="span" stagger={0.04} duration={0.8}>
                Your AI Sales Team. Always On.
              </SplitTextReveal>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light text-balance leading-relaxed mb-10"
            >
              Two AI agents — one makes the calls, one answers them. Trained on your business. Closes deals. Sends you a WhatsApp the moment a booking lands.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <MagneticButton strength={0.4} className="w-full sm:w-auto">
                <Link
                  href="/call/dashboard"
                  className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium text-lg px-8 py-4"
                >
                  Get Started Free
                  <ArrowRight size={20} />
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2} className="w-full sm:w-auto">
                <a
                  href="https://wa.me/917004635011?text=Hi%20Launch%20Pixel!%20I%20want%20to%20see%20a%20demo%20of%20the%20AI%20Calling%20Agent."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium text-lg px-8 py-4"
                >
                  Watch Demo
                </a>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dual Agent Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mb-3">Two Agents, One Platform</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display">
              Outbound Hunter. Inbound Closer.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Outbound Agent Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-black backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-500 group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 to-zinc-400 rounded-t-2xl" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10">
                  <PhoneOutgoing className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Outbound Agent</h3>
                  <p className="text-sm text-gray-500">The Sales Hunter</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Proactively reaches out to your lead list. Opens conversations naturally, identifies pain points, presents your solution, handles every objection, and confidently confirms bookings — all without human intervention.
              </p>
              <ul className="space-y-3">
                {["Cold & warm lead outreach", "Objection handling with empathy", "Automated booking confirmation", "Batch calling (100+ per hour)", "Follow-up scheduling"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Inbound Agent Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative bg-black backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-500 group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 to-zinc-400 rounded-t-2xl" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10">
                  <PhoneIncoming className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Inbound Agent</h3>
                  <p className="text-sm text-gray-500">The Receptionist</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Answers every incoming call with human-level precision. Understands queries, provides accurate information from your knowledge base, books appointments, and notifies you instantly via WhatsApp.
              </p>
              <ul className="space-y-3">
                {["Instant call answering — zero hold time", "FAQ & query resolution", "Appointment booking & rescheduling", "Lead qualification & routing", "WhatsApp notification on every action"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mb-3">Capabilities</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display">
              Everything You Need. Nothing You Don't.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-black backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-500 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} bg-opacity-20 flex items-center justify-center mb-4 border border-white/5`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mb-3">Simple Setup</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display">
              Live In Under 10 Minutes.
            </h2>
          </div>

          <div className="space-y-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="flex flex-col md:flex-row items-start gap-6 bg-black backdrop-blur-sm rounded-2xl border border-white/10 p-6 sm:p-8"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white font-display">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="relative rounded-3xl border border-gray-800 overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="/cta-ambient.png" alt="" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/60" />
            </div>

            <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
              <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase mb-3">Ready?</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-display">
                Deploy Your AI Agent Today.
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto text-balance leading-relaxed">
                No credit card required. Upload your business docs, configure a voice, and make your first test call in under 10 minutes. It's that simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton strength={0.4} className="w-full sm:w-auto">
                  <Link
                    href="/call/dashboard"
                    className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium text-lg px-8 py-4"
                  >
                    Start Building Your Agent
                    <ArrowRight size={20} />
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.2} className="w-full sm:w-auto">
                  <Link
                    href="/call/pricing"
                    className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium px-8 py-4"
                  >
                    View Pricing Options
                  </Link>
                </MagneticButton>
                <MagneticButton strength={0.2} className="w-full sm:w-auto">
                  <a
                    href="https://wa.me/917004635011?text=Hi!%20I%20want%20to%20know%20more%20about%20the%20AI%20Calling%20Agent."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium"
                  >
                    Talk to a Human First
                  </a>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Launch Pixel AI Calling Agent",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Cloud",
            "description": "Autonomous AI calling agents for sales and customer support. Features inbound receptionist and outbound sales hunter. Trained on your business, powered by ElevenLabs voice AI.",
            "author": {
              "@type": "Organization",
              "name": "Launch Pixel"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free trial available"
            }
          })
        }}
      />

      <Footer />
    </div>
  )
}
