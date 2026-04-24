"use client"
import { useEffect, useState, useRef } from "react"
import { ChevronRight, Sparkles, Zap, Target, Linkedin, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Navigation from "./Navigation"
import TestimonialsCarousel from "./TestimonialsCarousel"
import GlitchText from "./GlitchText"
import SpotlightCard from "./SpotlightCard"

export default function SimpleLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [clientCount, setClientCount] = useState(0)
  const [projectCount, setProjectCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)

            // Animated counters
            let clientTarget = 50
            let projectTarget = 100

            let clientInterval = setInterval(() => {
              setClientCount((prev) => {
                if (prev < clientTarget) return prev + 1
                clearInterval(clientInterval)
                return clientTarget
              })
            }, 90)

            let projectInterval = setInterval(() => {
              setProjectCount((prev) => {
                if (prev < projectTarget) return prev + 1
                clearInterval(projectInterval)
                return projectTarget
              })
            }, 50)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [hasAnimated])

  return (
    <div className="min-h-screen">
      <Navigation />


      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 sm:pt-24 md:pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div
              className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
                }`}
            >


              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight">
                Transform Your Business with{" "}
                <span className="inline-block whitespace-nowrap">
                  <GlitchText
                    speed={1}
                    enableShadows={true}
                    enableOnHover={false}
                    className="text-[clamp(2rem,7vw,4.2rem)] lg:text-[clamp(3rem,6vw,7.2rem)] !inline-block"
                  >
                    AI Automation
                  </GlitchText>
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed">
                LaunchPixel delivers cutting-edge AI automation, web development, and digital solutions
                that drive growth and innovation for businesses worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  href="/contact"
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-base sm:text-lg"
                >
                  Get Started
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/portfolio"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-800/50 backdrop-blur-lg text-white rounded-full hover:bg-gray-700/50 transition-all duration-300 border border-gray-700 flex items-center justify-center gap-2 font-medium text-base sm:text-lg"
                >
                  View Our Work
                </Link>
              </div>
            </div>

            {/* Right Content - Video */}
            <div
              className={`transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
                }`}
            >
              <div className="relative w-full h-full flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
                <div className="relative w-full">
                  <video
                    src="/launch_hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="rounded-2xl shadow-2xl border border-gray-800 w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="relative py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <SpotlightCard className="p-6 sm:p-8 md:p-10 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3 sm:mb-4">
                {clientCount}+
              </div>
              <div className="text-gray-300 text-base sm:text-lg md:text-xl font-medium">Happy Clients</div>
            </SpotlightCard>

            <SpotlightCard className="p-6 sm:p-8 md:p-10 text-center flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3 sm:mb-4">
                {projectCount}+
              </div>
              <div className="text-gray-300 text-base sm:text-lg md:text-xl font-medium">Projects Completed</div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">LaunchPixel</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              We combine innovation, expertise, and dedication to deliver exceptional results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <SpotlightCard className="p-6 sm:p-8 flex flex-col items-start h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-950 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">AI-Powered Solutions</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Leverage cutting-edge AI and machine learning to automate processes and drive intelligent decision-making.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 sm:p-8 flex flex-col items-start h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-950 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Fast Delivery</h3>
              <p className="text-sm sm:text-base text-gray-400">
                Rapid development cycles with agile methodology ensure your project launches on time, every time.
              </p>
            </SpotlightCard>

            <SpotlightCard className="p-6 sm:p-8 flex flex-col items-start h-full">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-950 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Results-Driven</h3>
              <p className="text-sm sm:text-base text-gray-400">
                We focus on measurable outcomes that directly impact your business growth and success.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <section className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-2xl border border-indigo-800/50 p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join 50+ satisfied clients who have revolutionized their operations with LaunchPixel's innovative solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/services"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all duration-300 font-medium text-base sm:text-lg"
              >
                Explore Services
              </Link>
              <Link
                href="/contact"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300 font-medium text-base sm:text-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-950/80 backdrop-blur-lg border-t border-gray-800 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3 sm:mb-4">
                LaunchPixel
              </h3>
              <p className="text-sm sm:text-base text-gray-400">
                Transforming ideas into powerful digital solutions through AI automation and innovation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Company</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="/about" className="hover:text-indigo-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/portfolio" className="hover:text-indigo-400 transition-colors">
                    Portfolio
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Services</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-gray-400 text-sm sm:text-base">
                <li>
                  <Link href="/services" className="hover:text-indigo-400 transition-colors">
                    All Services
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:text-indigo-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/hiring" className="hover:text-indigo-400 transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-white text-sm sm:text-base">Connect</h4>
              <div className="flex gap-3 sm:gap-4">
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <Github className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            © 2026 LaunchPixel. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LaunchPixel",
            "alternateName": "Launch Pixel",
            "url": "https://launchpixel.com",
            "logo": "https://launchpixel.com/logo.gif",
            "description": "Leading AI automation and digital solutions company",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5",
              "reviewCount": "50"
            }
          })
        }}
      />
    </div>
  )
}
