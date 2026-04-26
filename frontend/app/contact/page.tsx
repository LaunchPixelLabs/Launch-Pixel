"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Send, Loader2, MessageCircle, Plus, Minus, Clock, Shield, Zap, ChevronRight, User, AtSign, FileText, MessageSquare } from "lucide-react"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

import SplitTextReveal from "../../components/SplitTextReveal"
import MagneticButton from "../../components/MagneticButton"

// FAQ Data
const faqData = [
  {
    question: "What can you actually build for us?",
    answer: "Pretty much everything digital. Custom websites, full-stack web apps, mobile applications, autonomous AI agents, brand identities, SEO strategies — we handle it end-to-end. The best way to figure out what's right for you is to just hop on a quick call with us. We'll listen to your goals and map out exactly what makes sense."
  },
  {
    question: "How long does a typical project take?",
    answer: "It depends on what we're building together. A polished marketing website usually takes 4–8 weeks. A full web application with custom features runs 2–4 months. Complex AI integrations or autonomous agent deployments can take 3–6 months depending on scope. We'll walk you through a realistic timeline during our free consultation — no surprises, no rushed deadlines."
  },
  {
    question: "Do you work with international clients?",
    answer: "Absolutely. We work with teams across India, the US, and Europe. We're fully remote-first and use Slack, Zoom, and async project boards to stay in sync across time zones. Most of our clients say it feels like we're sitting in the same room."
  },
  {
    question: "What does pricing look like?",
    answer: "Every project is different, so we don't do cookie-cutter pricing. Book a free consultation — we'll understand your needs and put together a transparent proposal with milestone-based billing. No hidden costs, no scope creep surprises. We want you to know exactly what you're paying for."
  },
  {
    question: "Do you stick around after launch?",
    answer: "Always. We offer ongoing maintenance packages, performance monitoring, and continuous improvement plans. We don't disappear after handoff — your growth is our growth. Think of us as your long-term technology partner."
  }
]

// Trust badges data
const trustBadges = [
  { icon: Shield, label: "100% Secure", sublabel: "Your data stays yours" },
  { icon: Zap, label: "Free Consultation", sublabel: "No strings attached" },
  { icon: Clock, label: "Realistic Timelines", sublabel: "No rushed deadlines" }
]

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/30 backdrop-blur-lg hover:border-indigo-500/30 transition-colors">
      <button
        onClick={onClick}
        className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left group"
      >
        <span className="text-base sm:text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
          {question}
        </span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-500 rotate-0' : 'bg-gray-800 rotate-0'}`}>
          {isOpen ? (
            <Minus size={18} className="text-white" />
          ) : (
            <Plus size={18} className="text-gray-400" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <div className="pt-0 border-t border-gray-800">
                <p className="pt-4 text-gray-400 text-sm sm:text-base leading-relaxed">
                  {answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// FAQ Section Component
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mt-16 sm:mt-20 md:mt-24">
      <div className="text-center mb-10 sm:mb-12">
        <p className="text-indigo-400 font-medium mb-3 tracking-wide uppercase text-sm">Got Questions?</p>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        {faqData.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => toggleFAQ(index)}
          />
        ))}
      </div>
    </div>
  )
}


export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setIsSuccess(true);
        window.history.replaceState({}, '', '/contact');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData.entries())

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setIsSuccess(true)
      } else {
        const errorData = await res.json()
        alert(errorData.message || 'Something went wrong.')
      }
    } catch (error) {
      alert('Failed to send message. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-40 relative z-10 min-h-screen">
          <div className="max-w-md w-full text-center p-8 rounded-2xl bg-indigo-900/20 backdrop-blur-sm border border-indigo-700/30">
            <h2 className="text-3xl font-bold text-white mb-4">Message Sent!</h2>
            <p className="text-gray-300 mb-8">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg mx-auto font-medium"
            >
              Send Another Message
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-36 md:pt-40 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Hero Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 font-display text-balance">
                <SplitTextReveal mode="words" as="span" stagger={0.05} duration={1}>
                  Let's Talk.
                </SplitTextReveal>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light text-balance leading-relaxed">
                Whether it's AI agents, a brand-new website, or a complete digital overhaul — let's start with a free, no-pressure chat. We'll share strategies tailored to your brand.
              </p>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-12"
          >
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full">
                <badge.icon className="w-5 h-5 text-indigo-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{badge.label}</p>
                  <p className="text-xs text-gray-500">{badge.sublabel}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form - Takes 3 columns */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    <Send className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Send a Message</h2>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours to schedule your free consultation</p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                        Subject *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="Project Inquiry"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Your Message *
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about your project, goals, and timeline..."
                      />
                    </div>
                  </div>

                  <MagneticButton strength={0.4} className="w-full">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-gradient w-full py-4 text-white rounded-full font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 border-none"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Initiating...
                        </>
                      ) : (
                        <>
                          Deploy Message
                          <ChevronRight size={20} />
                        </>
                      )}
                    </button>
                  </MagneticButton>
                </form>
              </div>
            </motion.div>

            {/* Contact Information - Takes 2 columns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Cards */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-5">Contact Information</h3>
                <div className="space-y-5">
                  <a href="mailto:contact@launchpixel.in" className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm text-white font-medium">contact@launchpixel.in</p>
                    </div>
                  </a>

                  <a href="tel:+917004635011" className="flex items-center gap-4 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-white font-medium">+91 80851 49514</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/917004635011"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#25D366]/70 uppercase tracking-wide">WhatsApp</p>
                      <p className="text-sm text-[#25D366] font-medium">Chat with us instantly</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Business Hours</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400">Monday - Friday</span>
                    <span className="text-white font-medium">9:00 AM - 6:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400">Saturday</span>
                    <span className="text-white font-medium">10:00 AM - 4:00 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Sunday</span>
                    <span className="text-gray-500">Closed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <FAQSection />

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 sm:mt-20 md:mt-24 text-center"
          >
            <div className="relative max-w-3xl mx-auto rounded-3xl border border-gray-800 overflow-hidden">
              {/* Subtle ambient background image */}
              <div className="absolute inset-0 z-0">
                <img src="/cta-ambient.png" alt="" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-gray-950/60" />
              </div>

              <div className="relative z-10 p-8 sm:p-12">
                <p className="text-indigo-400 text-sm font-medium tracking-wide uppercase mb-3">Free Consultation</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                  Let's Figure Out What's Best For You.
                </h2>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto text-balance leading-relaxed">
                  Book a free, no-commitment chat with our team. We'll learn about your brand, share honest strategies, and map out a realistic plan — no sales pitch, just a real conversation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <MagneticButton strength={0.2} className="w-full sm:w-auto">
                    <Link
                      href="/portfolio"
                      className="btn-ghost w-full sm:w-auto inline-flex items-center justify-center font-medium"
                    >
                      See Our Work
                    </Link>
                  </MagneticButton>
                  <MagneticButton strength={0.4} className="w-full sm:w-auto">
                    <a
                      href="https://wa.me/917004635011?text=Hi%20Launch%20Pixel!%20I'd%20like%20to%20book%20a%20free%20consultation."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium"
                    >
                      Book Free Consultation
                      <ChevronRight size={18} />
                    </a>
                  </MagneticButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Launch Pixel",
            "description": "Get in touch with Launch Pixel for autonomous AI agents and digital systems.",
            "url": "https://launchpixel.in/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "Launch Pixel",
              "email": "contact@launchpixel.in",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Deployments & Integrations",
                "email": "contact@launchpixel.in",
                "availableLanguage": ["English"]
              }
            }
          })
        }}
      />

      <Footer />
    </div>
  )
}
