"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
    ChevronRight, Target, Brain, Code2, BarChart2, Smartphone,
    Book, IdCard, LayoutDashboard, PenTool, Lightbulb, Users,
    Trophy, Layers, Zap, Headphones, BadgeCheck
} from "lucide-react"
import Navigation from "./Navigation"
import Footer from "./Footer"
import GradientText from "./GradientText"
import SpotlightCard from "./SpotlightCard"
import LogoLoop, { LogoItem } from "./LogoLoop"
import TextMarquee from "./TextMarquee"
import DecryptedText from "./DecryptedText"
import dynamic from "next/dynamic"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const Antigravity = dynamic(() => import('./Antigravity'), { ssr: false })

// ============================================================================
// CARD COMPONENT (for the scroll-animated card stack)
// ============================================================================
interface CardData {
    icon: React.ReactNode
    title: string
    description: string
    bgClass: string
    borderClass: string
    textClass: string
}

const cardData: CardData[] = [
    {
        icon: <Brain size={32} />,
        title: "AI Implementation",
        description: "Automate workflows and reduce operational costs with custom AI solutions tailored to your business.",
        bgClass: "bg-indigo-950/95",
        borderClass: "border-indigo-500/40",
        textClass: "text-indigo-100"
    },
    {
        icon: <Code2 size={32} />,
        title: "Modern Web Tech",
        description: "Blazing fast, SEO-optimized websites built on Next.js and React that convert visitors to customers.",
        bgClass: "bg-purple-950/95",
        borderClass: "border-purple-500/40",
        textClass: "text-purple-100"
    },
    {
        icon: <Target size={32} />,
        title: "Strategic Growth",
        description: "Data-driven strategies to scale your digital presence and dominate your market effectively.",
        bgClass: "bg-blue-950/95",
        borderClass: "border-blue-500/40",
        textClass: "text-blue-100"
    }
]

// ============================================================================
// SERVICES DATA (from services page)
// ============================================================================
const services = [
    { icon: <Code2 className="w-8 h-8" />, title: "Web/App Development", desc: "Custom web and mobile applications built with React, Next.js, and Node.js." },
    { icon: <Brain className="w-8 h-8" />, title: "AI Applications", desc: "Cutting-edge AI solutions including chatbots and predictive analytics." },
    { icon: <Smartphone className="w-8 h-8" />, title: "Brand Strategy", desc: "Comprehensive brand strategy to establish your unique market position." },
    { icon: <LayoutDashboard className="w-8 h-8" />, title: "UI/UX Design", desc: "User-centered design combining beautiful interfaces with intuitive experiences." },
    { icon: <PenTool className="w-8 h-8" />, title: "Prototyping", desc: "Interactive prototypes that bring your ideas to life before development." },
    { icon: <BarChart2 className="w-8 h-8" />, title: "SEO Strategies", desc: "Data-driven SEO to improve rankings and drive organic traffic." },
    { icon: <IdCard className="w-8 h-8" />, title: "Identity Design", desc: "Memorable brand identities including logos and visual elements." },
    { icon: <BadgeCheck className="w-8 h-8" />, title: "Financial Services", desc: "Accounting, taxation, GST, ROC compliance, and business advisory by experienced professionals.", href: "/financial-services" },
]

// ============================================================================
// WHY CHOOSE US DATA (from about page)
// ============================================================================
const whyChooseUs = [
    { icon: Brain, title: "AI & Automation Experts", desc: "Deep knowledge of AI technologies and automation frameworks." },
    { icon: Users, title: "Client-Centric", desc: "We prioritize your business goals and work collaboratively." },
    { icon: Trophy, title: "Proven Track Record", desc: "50+ clients and 100+ successful projects across industries." },
    { icon: Zap, title: "Cutting-Edge Tech", desc: "Latest tools and frameworks to build future-proof solutions." },
]

// ============================================================================
// PARTNER / CLIENT LOGOS FOR LOGO LOOP
// ============================================================================
const partnerLogos: LogoItem[] = [
    { src: "/logo1.webp", alt: "Partner 1", title: "Partner 1" },
    { src: "/logo2.webp", alt: "Partner 2", title: "Partner 2" },
    { src: "/logo3.webp", alt: "Partner 3", title: "Partner 3" },
    { src: "/logo4.webp", alt: "Partner 4", title: "Partner 4" },
    { src: "/logo5.webp", alt: "Partner 5", title: "Partner 5" },
    { src: "/logo6.webp", alt: "Partner 6", title: "Partner 6" },
    { src: "/logo7.webp", alt: "Partner 7", title: "Partner 7" },
    { src: "/logo8.webp", alt: "Partner 8", title: "Partner 8" },
    { src: "/logo9.webp", alt: "Partner 9", title: "Partner 9" },
    { src: "/logo10.webp", alt: "Partner 10", title: "Partner 10" },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function UnifiedLandingPage() {
    const [isVisible, setIsVisible] = useState(false)

    const cardSectionRef = useRef<HTMLDivElement>(null)
    const cardsContainerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    // Refs for scroll animations
    const purposeSectionRef = useRef<HTMLDivElement>(null)
    const servicesSectionRef = useRef<HTMLDivElement>(null)
    const whyChooseSectionRef = useRef<HTMLDivElement>(null)

    // Initial visibility
    useEffect(() => {
        setIsVisible(true)
    }, [])

    // ============================================================================
    // SCROLL REVEAL ANIMATIONS - APPLE STYLE
    // ============================================================================
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Purpose Section Animation - Enhanced with scrub
            if (purposeSectionRef.current) {
                const purposeCards = purposeSectionRef.current.querySelectorAll('.purpose-card')
                const purposeTitle = purposeSectionRef.current.querySelector('.section-title')

                gsap.set(purposeTitle, { opacity: 0, y: 80 })
                gsap.set(purposeCards, { opacity: 0, y: 100, scale: 0.85 })

                // Title animation with scrub
                gsap.to(purposeTitle, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: purposeSectionRef.current,
                        start: "top 85%",
                        end: "top 55%",
                        scrub: 1
                    }
                })

                // Cards with staggered parallax effect
                purposeCards.forEach((card, index) => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: purposeSectionRef.current,
                            start: `top ${75 - index * 10}%`,
                            end: `top ${40 - index * 10}%`,
                            scrub: 0.5
                        }
                    })
                })
            }

            // Services Section Animation - Enhanced with scrub
            if (servicesSectionRef.current) {
                const serviceCards = servicesSectionRef.current.querySelectorAll('.service-card')
                const servicesTitle = servicesSectionRef.current.querySelector('.section-title')

                gsap.set(servicesTitle, { opacity: 0, y: 80 })
                gsap.set(serviceCards, { opacity: 0, y: 80, scale: 0.85 })

                // Title animation with scrub
                gsap.to(servicesTitle, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: servicesSectionRef.current,
                        start: "top 85%",
                        end: "top 55%",
                        scrub: 1
                    }
                })

                // Cards with staggered wave effect
                serviceCards.forEach((card, index) => {
                    const row = Math.floor(index / 4)
                    const col = index % 4
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: servicesSectionRef.current,
                            start: `top ${75 - (row * 10) - (col * 3)}%`,
                            end: `top ${40 - (row * 10) - (col * 3)}%`,
                            scrub: 0.5
                        }
                    })
                })
            }

            // Why Choose Section Animation - Enhanced with scrub
            if (whyChooseSectionRef.current) {
                const whyCards = whyChooseSectionRef.current.querySelectorAll('.why-card')
                const whyTitle = whyChooseSectionRef.current.querySelector('.section-title')

                // Initial state
                gsap.set(whyTitle, { opacity: 0, y: 80 })
                gsap.set(whyCards, { opacity: 0, y: 100, scale: 0.8 })

                // Title animation
                gsap.to(whyTitle, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: whyChooseSectionRef.current,
                        start: "top 85%",
                        end: "top 50%",
                        scrub: 1
                    }
                })

                // Cards with staggered parallax effect
                whyCards.forEach((card, index) => {
                    gsap.to(card, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: whyChooseSectionRef.current,
                            start: `top ${80 - index * 5}%`,
                            end: `top ${40 - index * 5}%`,
                            scrub: 0.5
                        }
                    })
                })
            }
        })

        return () => ctx.revert()
    }, [])

    // ============================================================================
    // CARD SWAP SCROLL ANIMATION
    // ============================================================================
    useEffect(() => {
        if (!cardSectionRef.current || !cardsContainerRef.current) return

        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
        if (cards.length < 2) return

        const total = cards.length

        // Initial positioning - stack cards
        cards.forEach((card, i) => {
            gsap.set(card, {
                x: i * 30,
                y: -i * 20,
                z: -i * 50,
                zIndex: total - i,
                transformOrigin: "center center",
            })
        })

        // Create scroll-triggered timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cardSectionRef.current,
                start: "top top",
                end: `+=${total * 80}%`,
                scrub: 2,
                pin: true,
                anticipatePin: 1,
                // markers: true, // Debug
            }
        })

        // Animation: Each card drops off and remaining cards shift forward
        let order = [...Array(total).keys()]

        for (let step = 0; step < total; step++) {
            const frontIdx = order[0]
            const frontCard = cards[frontIdx]

            // Drop front card down and fade
            tl.to(frontCard, {
                y: "+=600",
                opacity: 0,
                duration: 1,
                ease: "power2.inOut"
            })

            // Shift remaining cards forward
            const remaining = order.slice(1)
            remaining.forEach((cardIdx, newPos) => {
                const card = cards[cardIdx]
                tl.to(card, {
                    x: newPos * 30,
                    y: -newPos * 20,
                    z: -newPos * 50,
                    zIndex: total - newPos,
                    duration: 0.8,
                    ease: "power2.out"
                }, "<+=0.1")
            })

            // Update order
            order = [...remaining, frontIdx]
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            <Navigation />



            {/* ================================================================== */}
            {/* HERO SECTION - APPLE-LEVEL PREMIUM DESIGN */}
            {/* ================================================================== */}
            <section className="relative h-screen flex items-center pt-20 pb-8">
                <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">

                        {/* Left Content - Premium Typography */}
                        <div className={`space-y-4 lg:space-y-6 transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>

                            {/* Headline - Responsive and structured */}
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                                    <span className="block text-white">Intelligent AI Systems.</span>
                                    <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow bg-clip-text text-transparent">
                                        Memorable Websites.
                                    </span>
                                </h1>
                            </div>

                            {/* Subheadline - Refined messaging */}
                            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg font-light">
                                We automate businesses. We build websites people remember.
                            </p>

                            {/* CTAs - Premium styling */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                                <Link
                                    href="/contact"
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold text-base hover:bg-gray-100 transition-all duration-300 shadow-xl shadow-white/10"
                                >
                                    Get Started
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/portfolio"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white rounded-full font-medium text-base border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all duration-300"
                                >
                                    View Our Work
                                </Link>
                            </div>
                        </div>

                        {/* Right - Hero Visual */}
                        <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                            <div className="relative">
                                {/* Glow effect behind video */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-violet-500/20 rounded-3xl blur-2xl" />

                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                    <video
                                        src="/launch_hero.mp4"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>


            </section>

            {/* ================================================================== */}
            {/* PARTNER LOGOS SECTION */}
            {/* ================================================================== */}
            <section className="relative py-8">
                <div className="relative z-10 h-16 overflow-hidden">
                    <LogoLoop
                        logos={partnerLogos}
                        speed={60}
                        direction="left"
                        logoHeight={48}
                        gap={100}
                        pauseOnHover
                        fadeOut
                        fadeOutColor="#030712"
                        ariaLabel="Our clients and partners"
                    />
                </div>
            </section>

            {/* ================================================================== */}
            {/* CARD SWAP SECTION - FULL SCREEN PINNED */}
            {/* ================================================================== */}
            <section
                ref={cardSectionRef}
                className="relative min-h-screen lg:min-h-screen py-16 lg:py-0 flex items-start lg:items-center"
            >
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">

                        {/* Left: Text Content */}
                        <div className="space-y-6 lg:space-y-8">
                            <div>
                                <p className="text-indigo-400 font-medium mb-4 tracking-wide uppercase text-sm">What We Deliver</p>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                    Solutions Built for{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow">
                                        Business Leaders
                                    </span>
                                </h2>
                            </div>
                            <p className="text-lg lg:text-xl text-gray-400 leading-relaxed max-w-lg">
                                You need more than just a website. You need a digital engine that drives your business forward, automates operations, and scales with your ambitions.
                            </p>
                            <div className="hidden lg:flex items-center gap-3 text-gray-500">
                                <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center animate-bounce">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                                <span className="text-sm">Scroll to explore</span>
                            </div>
                        </div>

                        {/* Right: Card Stack */}
                        <div
                            ref={cardsContainerRef}
                            className="relative h-[320px] sm:h-[380px] lg:h-[450px] perspective-[1200px]"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {cardData.map((card, i) => (
                                <div
                                    key={i}
                                    ref={el => { cardRefs.current[i] = el }}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm sm:max-w-md h-64 sm:h-72 lg:h-80 rounded-2xl border ${card.borderClass} ${card.bgClass} backdrop-blur-xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between`}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/80">
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">{card.title}</h3>
                                        <p className={`${card.textClass} text-base sm:text-lg leading-relaxed`}>{card.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* MISSION & VISION (from About page) */}
            {/* ================================================================== */}
            <section ref={purposeSectionRef} className="relative py-24">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="section-title text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Purpose</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Transforming businesses through innovation and technology</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        <SpotlightCard className="purpose-card p-8 flex flex-col items-start h-full">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-950 flex items-center justify-center mb-6">
                                <Target className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                            <p className="text-gray-400 leading-relaxed">
                                To empower businesses worldwide with innovative AI automation solutions that drive growth, efficiency, and digital transformation. We make advanced technology accessible and practical for businesses of all sizes.
                            </p>
                        </SpotlightCard>

                        <SpotlightCard className="purpose-card p-8 flex flex-col items-start h-full">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-950 flex items-center justify-center mb-6">
                                <Lightbulb className="w-7 h-7 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
                            <p className="text-gray-400 leading-relaxed">
                                To be the world's most trusted AI automation partner, recognized for delivering exceptional digital solutions that transform how businesses operate and grow in the digital age.
                            </p>
                        </SpotlightCard>
                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* SERVICES GRID (from Services page) */}
            {/* ================================================================== */}
            <section ref={servicesSectionRef} className="relative py-24">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="section-title text-center mb-16">
                        <p className="text-indigo-400 font-medium mb-4 tracking-wide uppercase text-sm">Our Services</p>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Comprehensive digital solutions to build, launch, and scale your business</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, idx) => (
                            service.href ? (
                                <Link href={service.href} key={idx}>
                                    <SpotlightCard className="service-card p-6 h-full group hover:border-indigo-500/30 transition-colors cursor-pointer">
                                        <div className="flex flex-col items-center text-center h-full">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 flex items-center justify-center mb-5 text-indigo-400 group-hover:scale-110 transition-transform">
                                                {service.icon}
                                            </div>
                                            <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
                                            <span className="mt-3 text-xs text-indigo-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                Learn more <ChevronRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </SpotlightCard>
                                </Link>
                            ) : (
                                <SpotlightCard key={idx} className="service-card p-6 h-full group hover:border-indigo-500/30 transition-colors">
                                    <div className="flex flex-col items-center text-center h-full">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 flex items-center justify-center mb-5 text-indigo-400 group-hover:scale-110 transition-transform">
                                            {service.icon}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{service.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{service.desc}</p>
                                    </div>
                                </SpotlightCard>
                            )
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* WHY CHOOSE US (from About page) */}
            {/* ================================================================== */}
            <section ref={whyChooseSectionRef} className="relative py-24">
                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="section-title text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LaunchPixel</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">The expertise and commitment you need for digital success</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" style={{ perspective: '1000px' }}>
                        {whyChooseUs.map((item, idx) => (
                            <SpotlightCard key={idx} className="why-card p-6">
                                <div className="flex flex-col items-center text-center h-full">
                                    <div className="w-16 h-16 rounded-full bg-indigo-950 flex items-center justify-center mb-5">
                                        <item.icon className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-400">{item.desc}</p>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* MARQUEE SECTION - INSPIRED BY LANDO NORRIS */}
            {/* ================================================================== */}
            <section className="relative py-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/50 via-purple-950/50 to-pink-950/50" />
                <TextMarquee
                    texts={[
                        "AI Automation",
                        "Web Development",
                        "Digital Transformation",
                        "Brand Strategy",
                        "Custom Solutions",
                        "Modern Design",
                        "Future-Ready Tech",
                        "Innovation Partners"
                    ]}
                    speed={120}
                    className="text-4xl md:text-6xl font-bold text-white/10 relative z-10"
                    textClassName="tracking-tight"
                    separator={<span className="mx-12 text-indigo-500/30">◆</span>}
                />
            </section>

            {/* ================================================================== */}
            {/* CTA SECTION - ENHANCED */}
            {/* ================================================================== */}
            <section className="relative py-32 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-indigo-950/20 to-gray-950" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl animate-pulse" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Animated DecryptedText badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <DecryptedText
                                text="Ready to collaborate"
                                animateOn="view"
                                speed={40}
                                maxIterations={15}
                                sequential
                                revealDirection="start"
                                className="text-indigo-300"
                                encryptedClassName="text-indigo-500/60"
                                parentClassName="text-sm font-mono font-medium tracking-wide"
                            />
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                            <span className="block text-white">Let&apos;s Build</span>
                            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-[length:200%_auto] animate-gradient-flow bg-clip-text text-transparent">
                                Something Amazing
                            </span>
                        </h2>

                        <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-12 leading-relaxed max-w-2xl mx-auto font-light px-4">
                            Ready to transform your business with AI automation and cutting-edge digital solutions?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href="/contact"
                                className="group relative inline-flex items-center gap-3 px-10 py-5 overflow-hidden rounded-full font-semibold text-lg transition-all duration-500"
                            >
                                {/* Animated gradient background */}
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 transition-all duration-500 group-hover:scale-110" />
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

                                <span className="relative z-10 text-white">Start Your Project</span>
                                <ChevronRight size={20} className="relative z-10 text-white group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/portfolio"
                                className="inline-flex items-center gap-2 px-8 py-5 text-gray-300 hover:text-white transition-colors font-medium text-lg group"
                            >
                                View Our Work
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
