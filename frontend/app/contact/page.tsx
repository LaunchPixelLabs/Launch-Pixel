"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, Phone, MapPin, Send, Loader2, MessageCircle, Plus, Minus, Clock, Shield, Zap, ChevronRight, User, AtSign, FileText, MessageSquare } from "lucide-react"
import Navigation from "../../components/Navigation"
import Footer from "../../components/Footer"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

const Antigravity = dynamic(() => import('../../components/Antigravity'), { ssr: false })

// FAQ Data
const faqData = [
  {
    question: "What services do you offer?",
    answer: "We specialize in AI automation, web development, mobile apps, brand strategy, UI/UX design, and SEO optimization. Our team delivers end-to-end solutions tailored to your business needs."
  },
  {
    question: "How long does a typical project take?",
    answer: "Project timelines vary based on complexity. Simple websites take 2-4 weeks, while complex AI applications may take 2-3 months. We'll provide a detailed timeline during our initial consultation."
  },
  {
    question: "Do you work with international clients?",
    answer: "Yes! We work with clients worldwide and offer remote services with flexible communication schedules. We use tools like Slack, Zoom, and project management platforms to ensure smooth collaboration across time zones."
  },
  {
    question: "What is your pricing structure?",
    answer: "We offer custom quotes based on project requirements. Contact us for a free consultation and detailed proposal. We're transparent about costs and provide milestone-based billing for larger projects."
  },
  {
    question: "Do you offer ongoing support after project completion?",
    answer: "Absolutely! We offer maintenance packages, technical support, and continuous improvement services. Your success is our priority, and we're here to help you grow long after launch."
  }
]

// Trust badges data
const trustBadges = [
  { icon: Shield, label: "100% Secure", sublabel: "Your data is safe" },
  { icon: Zap, label: "Fast Response", sublabel: "Within 24 hours" },
  { icon: Clock, label: "On-Time", sublabel: "Delivery guaranteed" }
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact`, {
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
      <div className="min-h-screen bg-gray-950">
        <Navigation />
        <div className="fixed inset-0 z-0">
          <Antigravity color="#5227FF" autoAnimate fieldStrength={10} />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
        </div>
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
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Antigravity Background */}
      <div className="fixed inset-0 z-0">
        <Antigravity
          count={300}
          magnetRadius={15}
          ringRadius={12}
          waveSpeed={0.5}
          waveAmplitude={1.2}
          particleSize={1.2}
          lerpSpeed={0.05}
          color="#5227FF"
          autoAnimate
          particleVariance={1}
          rotationSpeed={0}
          depthFactor={1}
          pulseSpeed={3}
          particleShape="box"
          fieldStrength={10}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/50 via-gray-950/80 to-gray-950 pointer-events-none" />
      </div>

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
              <p className="text-indigo-400 font-medium mb-4 tracking-wide uppercase text-sm">Let's Connect</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                <span className="text-white">Get in </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow">Touch</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                Ready to transform your business with AI automation? Let's discuss your project and create something amazing together.
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
                    <p className="text-sm text-gray-500">We'll get back to you within 24 hours</p>
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] text-white rounded-xl font-semibold text-base hover:bg-right transition-all duration-500 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ChevronRight size={20} />
                      </>
                    )}
                  </button>
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
            <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-900 via-indigo-950/30 to-gray-900 rounded-3xl border border-gray-800 p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join 50+ satisfied clients who have transformed their businesses with LaunchPixel's innovative solutions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/portfolio"
                  className="px-8 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all duration-300 border border-gray-700 font-medium"
                >
                  View Our Work
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                >
                  Explore Services
                  <ChevronRight size={18} />
                </Link>
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
            "name": "Contact LaunchPixel",
            "description": "Get in touch with LaunchPixel for AI automation and digital solutions",
            "url": "https://launchpixel.in/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "LaunchPixel",
              "email": "contact@launchpixel.in",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
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
