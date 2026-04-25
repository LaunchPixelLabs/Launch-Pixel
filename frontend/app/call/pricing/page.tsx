"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Check, Phone, Users, Building2, Zap, Shield, BarChart3, Headphones, Crown, Sparkles, MessageCircle } from "lucide-react"
import Navigation from "../../../components/Navigation"
import Footer from "../../../components/Footer"

const plans = [
  {
    name: "Starter",
    description: "Ideal for small businesses starting with AI automation.",
    price: "19,999",
    period: "/mo",
    highlight: false,
    icon: Phone,
    gradient: "from-zinc-800 to-zinc-900",
    borderColor: "border-zinc-800 hover:border-zinc-700",
    features: [
      { text: "2 High-Performance AI Agents", included: true },
      { text: "1,000 minutes / month", included: true },
      { text: "5 concurrent calls", included: true },
      { text: "10 knowledge base docs", included: true },
      { text: "WhatsApp Live Monitoring", included: true },
      { text: "Real-time Sales Analytics", included: true },
      { text: "Priority Email Support", included: true },
      { text: "Voice Cloning", included: false },
      { text: "Custom API Infrastructure", included: false },
    ],
    cta: "Select Starter",
    ctaHref: "/call/auth",
  },
  {
    name: "Growth",
    description: "Power your entire sales team with a fleet of agents.",
    price: "39,999",
    period: "/mo",
    highlight: true,
    icon: Users,
    gradient: "from-zinc-700 to-zinc-800",
    borderColor: "border-[#FEED01]/50 hover:border-[#FEED01]",
    features: [
      { text: "5 High-Performance AI Agents", included: true },
      { text: "5,000 minutes / month", included: true },
      { text: "20 concurrent calls", included: true },
      { text: "Unlimited knowledge base", included: true },
      { text: "WhatsApp + Slack Integration", included: true },
      { text: "Special Perks (Expressive Mode)", included: true },
      { text: "Advanced Performance Reports", included: true },
      { text: "Priority 24/7 Support", included: true },
      { text: "Premium Voice Cloning", included: true },
      { text: "Custom API Infrastructure", included: false },
    ],
    cta: "Select Growth",
    ctaHref: "/call/auth",
  },
  {
    name: "Scale",
    description: "Unlimited power. Custom infrastructure. Enterprise-grade API.",
    price: "7,000+",
    period: "/agent/mo",
    highlight: false,
    icon: Building2,
    gradient: "from-zinc-900 to-black",
    borderColor: "border-zinc-800 hover:border-zinc-700",
    features: [
      { text: "Custom Fleet (10+ Agents)", included: true },
      { text: "Custom Minute Pools", included: true },
      { text: "Unlimited Concurrent Calls", included: true },
      { text: "Notion + Slack + CRM Sync", included: true },
      { text: "Dedicated Infrastructure API", included: true },
      { text: "White-Glove Onboarding", included: true },
      { text: "Dedicated Success Manager", included: true },
      { text: "Early Access to New Models", included: true },
      { text: "On-Premise Deployment Options", included: true },
    ],
    cta: "Talk to Sales",
    ctaHref: "https://wa.me/917004635011?text=Hi%20Launch%20Pixel!%20I%27m%20interested%20in%20scaling%20to%20a%20custom%20AI%20fleet.",
  },
]

const faqs = [
  {
    q: "What counts as a 'minute'?",
    a: "One minute of active call time — the clock starts when the contact picks up and stops when the call ends. Voicemail drops, failed connections, and setup time are not counted."
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Upgrades take effect immediately and are prorated. Downgrades apply from the next billing cycle."
  },
  {
    q: "What is voice cloning?",
    a: "Voice cloning lets you train the AI to speak in a custom voice — your founder's voice, your top salesperson, or a branded persona. Available on Teams and Enterprise plans."
  },
  {
    q: "Is there a free trial?",
    a: "We offer a 7-day trial with 50 minutes included on the Solopreneur plan. No credit card required to start."
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 sm:pt-40 pb-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Simple, transparent pricing
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 font-display tracking-tight"
          >
            Scale Your Sales.{" "}
            <span className="text-zinc-500">
              Pick Your Plan.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4"
          >
            Every plan includes the full AI Agent platform — outbound hunter, inbound closer, WhatsApp alerts, and real-time analytics.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative px-4 sm:px-6 pb-20">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * idx }}
                className={`relative bg-gray-900/60 backdrop-blur-xl rounded-2xl border ${plan.borderColor} p-8 flex flex-col transition-all duration-500 ${
                  plan.highlight ? "ring-1 ring-violet-500/30 scale-[1.02]" : ""
                }`}
              >
                {/* Popular Badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-white/10">
                      <Crown className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  {plan.price === "???" ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white font-display tracking-tight">
                        Let&apos;s Talk
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg text-gray-400">₹</span>
                      <span className="text-4xl font-bold text-white font-display">{plan.price}</span>
                      <span className="text-gray-400 text-sm">{plan.period}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 mt-0.5 flex-shrink-0 rounded-full border border-gray-700" />
                      )}
                      <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-600"}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.name === "Enterprise" ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition-all duration-300 bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`w-full py-3.5 rounded-xl font-medium text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                      plan.highlight
                        ? "bg-white hover:bg-zinc-200 text-black shadow-lg shadow-white/5"
                        : "bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span>No credit card for trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-400" />
              <span>Setup in under 10 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-zinc-400" />
              <span>Dedicated onboarding</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400">Everything you need to know before getting started.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-display">
              Still not sure? Talk to a human.
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              We&apos;ll personally walk you through the platform, answer every question, and help you pick the right plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/call/auth"
                className="btn-gradient inline-flex items-center justify-center gap-2 font-medium text-lg px-8 py-4"
              >
                Start Free Trial
                <ArrowRight size={20} />
              </Link>
              <a
                href="https://wa.me/917004635011?text=Hi%20Launch%20Pixel!%20I%20have%20questions%20about%20the%20AI%20Agent%20pricing."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center justify-center gap-2 font-medium px-8 py-4"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
