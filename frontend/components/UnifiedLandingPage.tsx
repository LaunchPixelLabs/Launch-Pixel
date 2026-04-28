"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
    ChevronRight, Target, Brain, Code2, BarChart2, Smartphone,
    Book, IdCard, LayoutDashboard, PenTool, Lightbulb, Users,
    Trophy, Layers, Zap, Headphones, BadgeCheck, ArrowRight
} from "lucide-react"
import Navigation from "./Navigation"
import Footer from "./Footer"
import SpotlightCard from "./SpotlightCard"
import LogoLoop, { LogoItem } from "./LogoLoop"
import TextMarquee from "./TextMarquee"
import DecryptedText from "./DecryptedText"
import MagneticButton from "./MagneticButton"
import SplitTextReveal from "./SplitTextReveal"
import ParallaxSection from "./ParallaxSection"
import dynamic from "next/dynamic"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

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
        title: "Algorithmic Precision",
        description: "We don't just 'use AI'. We engineer custom intelligence backbones that multiply your operational bandwidth and destroy inefficiency.",
        bgClass: "bg-[#050B14]/90",
        borderClass: "border-indigo-500/30",
        textClass: "text-indigo-100"
    },
    {
        icon: <Code2 size={32} />,
        title: "Digital Architecture",
        description: "Your competitors have websites. We build digital ecosystems. Blazing fast, meticulously crafted, and designed to monopolize attention.",
        bgClass: "bg-[#090514]/90",
        borderClass: "border-purple-500/30",
        textClass: "text-purple-100"
    },
    {
        icon: <Target size={32} />,
        title: "Calculated Dominance",
        description: "We don't guess. Every pixel, every endpoint, and every strategy is deployed with measured intent to scale your influence.",
        bgClass: "bg-[#050D14]/90",
        borderClass: "border-blue-500/30",
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
// WHY CHOOSE US DATA
// ============================================================================
const whyChooseUs = [
    { icon: Brain, title: "Deep Tech", desc: "We understand the math behind the magic." },
    { icon: Users, title: "Zero Fluff", desc: "Direct communication. Radical transparency." },
    { icon: Trophy, title: "Proven Scale", desc: "We've scaled systems for industry leaders." },
    { icon: Zap, title: "Velocity", desc: "Speed is an asset. We ship fast." },
]

// ============================================================================
// PARTNER / CLIENT LOGOS
// ============================================================================
const partnerLogos: LogoItem[] = [
    { src: "/logo1.webp", alt: "Partner 1", title: "Partner 1" },
    { src: "/logo2.webp", alt: "Partner 2", title: "Partner 2" },
    { src: "/logo3.webp", alt: "Partner 3", title: "Partner 3" },
    { src: "/logo4.webp", alt: "Partner 4", title: "Partner 4" },
    { src: "/logo7.webp", alt: "Partner 7", title: "Partner 7" },
    { src: "/logo8.webp", alt: "Partner 8", title: "Partner 8" },
    { src: "/logo9.webp", alt: "Partner 9", title: "Partner 9" },
    { src: "/logo10.webp", alt: "Partner 10", title: "Partner 10" },
]

export default function UnifiedLandingPage() {
    const heroRef = useRef<HTMLDivElement>(null)
    const cardSectionRef = useRef<HTMLDivElement>(null)
    const cardsContainerRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const servicesSectionRef = useRef<HTMLDivElement>(null)
    const whyChooseSectionRef = useRef<HTMLDivElement>(null)
    const statsRefs = useRef<(HTMLHeadingElement | null)[]>([])

    // ============================================================================
    // HERO CHOREOGRAPHY
    // ============================================================================
    useEffect(() => {
        if (!heroRef.current) return
        
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power4.out" } })
            
            // Start after the loader finishes
            tl.fromTo(".hero-badge", 
                { y: 30, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1, delay: 0.2 }
            )
            .fromTo(".hero-text-accent", 
                { backgroundPosition: "200% center" }, 
                { backgroundPosition: "0% center", duration: 2, ease: "power2.out" },
                "-=0.8"
            )
            .fromTo(".hero-subtext", 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1 },
                "-=1.5"
            )
            .fromTo(".hero-ctas", 
                { y: 20, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 1 },
                "-=1.2"
            )
            .fromTo(".hero-video-wrapper", 
                { scale: 0.95, opacity: 0, rotateX: 5 }, 
                { scale: 1, opacity: 1, rotateX: 0, duration: 1.5, ease: "expo.out" },
                "-=1"
            )
        }, heroRef)

        return () => ctx.revert()
    }, [])

    // ============================================================================
    // 3D CARD SWAP SCROLL ANIMATION
    // ============================================================================
    useEffect(() => {
        if (!cardSectionRef.current || !cardsContainerRef.current) return

        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
        if (cards.length < 2) return

        gsap.registerPlugin(ScrollTrigger)

        const total = cards.length

        // Advanced 3D Positioning
        cards.forEach((card, i) => {
            gsap.set(card, {
                x: i * 35,
                y: -i * 25,
                z: -i * 60,
                rotateX: i * 2,
                rotateY: -i * 2,
                zIndex: total - i,
                transformOrigin: "center right",
                opacity: 1 - (i * 0.15)
            })
        })

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: cardSectionRef.current,
                start: "top top",
                end: `+=${total * 90}%`,
                scrub: 1.5, // Smoother scrub
                pin: true,
                anticipatePin: 1,
            }
        })

        let order = [...Array(total).keys()]

        for (let step = 0; step < total; step++) {
            const frontIdx = order[0]
            const frontCard = cards[frontIdx]

            // 3D fold out and drop
            tl.to(frontCard, {
                y: "+=300",
                x: "-=100",
                rotateZ: -10,
                rotateY: -30,
                rotateX: 20,
                opacity: 0,
                duration: 1,
                ease: "power2.inOut"
            })

            // Shift remaining cards
            const remaining = order.slice(1)
            remaining.forEach((cardIdx, newPos) => {
                const card = cards[cardIdx]
                tl.to(card, {
                    x: newPos * 35,
                    y: -newPos * 25,
                    z: -newPos * 60,
                    rotateX: newPos * 2,
                    rotateY: -newPos * 2,
                    rotateZ: 0,
                    zIndex: total - newPos,
                    opacity: 1 - (newPos * 0.15),
                    duration: 0.8,
                    ease: "power3.out"
                }, "<+=0.15")
            })

            order = [...remaining, frontIdx]
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    // ============================================================================
    // SERVICES STAGGERED WAVE
    // ============================================================================
    useEffect(() => {
        if (!servicesSectionRef.current) return
        
        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            const cards = gsap.utils.toArray(".service-card") as HTMLElement[]
            
            gsap.set(cards, { opacity: 0, y: 50, rotateX: -10, transformPerspective: 1000 })
            
            ScrollTrigger.batch(cards, {
                interval: 0.1,
                batchMax: 4,
                onEnter: batch => gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    stagger: { each: 0.1, grid: "auto" },
                    duration: 1,
                    ease: "expo.out",
                    overwrite: true
                }),
                onLeaveBack: batch => gsap.to(batch, {
                    opacity: 0,
                    y: 50,
                    rotateX: -10,
                    duration: 0.8,
                    overwrite: true
                })
            })
        }, servicesSectionRef)
        
        return () => ctx.revert()
    }, [])

    // ============================================================================
    // STATS COUNTER ANIMATION
    // ============================================================================
    useEffect(() => {
        if (!whyChooseSectionRef.current) return
        
        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            const whyCards = gsap.utils.toArray('.why-card') as HTMLElement[]
            
            gsap.set(whyCards, { x: -30, opacity: 0 })
            
            gsap.to(whyCards, {
                x: 0,
                opacity: 1,
                stagger: 0.15,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: whyChooseSectionRef.current,
                    start: "top 75%",
                }
            })
        }, whyChooseSectionRef)
        
        return () => ctx.revert()
    }, [])

    return (
        <div className="min-h-screen text-white overflow-x-hidden selection:bg-indigo-500/30">
            <Navigation />

            {/* ================================================================== */}
            {/* HERO SECTION - HUMANIZED & CINEMATIC */}
            {/* ================================================================== */}
            <section ref={heroRef} className="relative min-h-[100dvh] flex items-center pt-24 pb-12 lg:pt-32 z-10 w-full font-sans">
                {/* Background glow injected through layout/PersistentBackground, giving pure focus here */}
                
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">

                        {/* Left Content - Master Typography */}
                        <div className="space-y-8 lg:space-y-10 relative z-20">
                            
                            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-md">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                <span className="text-sm font-medium tracking-wide text-indigo-300">Engineering the future</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.95] text-balance">
                                    <div className="overflow-hidden">
                                        <SplitTextReveal mode="words" as="span" stagger={0.05} duration={1}>
                                            Intelligent AI Systems.
                                        </SplitTextReveal>
                                    </div>
                                    <div className="overflow-hidden mt-2">
                                        <span className="hero-text-accent inline-block bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] bg-clip-text text-transparent pb-2">
                                            Memorable Experiences.
                                        </span>
                                    </div>
                                </h1>
                            </div>

                            <hr className="section-rule hero-subtext opacity-0" />

                                <p className="hero-subtext text-lg sm:text-xl text-gray-400 leading-relaxed max-w-xl font-light text-balance opacity-0">
                                From deep automation that accelerates your operations to stunning digital interfaces built to last. We focus on true utility and breathtaking design, minus the filler.
                            </p>

                            <div className="hero-ctas flex flex-col sm:flex-row gap-5 pt-4 opacity-0">
                                <MagneticButton strength={0.4}>
                                    <Link href="/contact" className="btn-gradient inline-flex items-center rounded-full group">
                                        Start a Project
                                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </MagneticButton>
                                <MagneticButton strength={0.2}>
                                    <Link href="/portfolio" className="btn-ghost inline-flex items-center rounded-full group">
                                        View Architecture
                                    </Link>
                                </MagneticButton>
                            </div>
                        </div>

                        {/* Right Content - Parallax Video Depth */}
                        <div className="hero-video-wrapper opacity-0 relative z-10 w-full max-w-[600px] mx-auto lg:max-w-none">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-gray-900 group aspect-[4/3] sm:aspect-video lg:aspect-[4/3]">
                                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 mix-blend-overlay" />
                                <video
                                    src="/launch_hero.mp4"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover scale-[1.02] transform transition-transform duration-[10s] group-hover:scale-100"
                                />
                                {/* Glassmorphism reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* PARTNER LOGOS SECTION */}
            {/* ================================================================== */}
            <section className="relative py-12 border-y border-white/5 bg-black/20 backdrop-blur-sm z-20">
                <div className="w-full overflow-hidden opacity-70 hover:opacity-100 transition-opacity duration-500">
                    <LogoLoop
                        logos={partnerLogos}
                        speed={40}
                        direction="left"
                        logoHeight={40}
                        gap={120}
                        pauseOnHover
                        fadeOut
                        fadeOutColor="var(--lp-bg)"
                    />
                </div>
            </section>

            {/* ================================================================== */}
            {/* CARD SWAP SECTION - 3D EVOLUTION */}
            {/* ================================================================== */}
            <section
                ref={cardSectionRef}
                className="relative min-h-screen py-24 flex items-center bg-transparent z-20"
            >
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">

                        <div className="space-y-8">
                            <SplitTextReveal mode="lines" as="p" className="text-indigo-400 font-semibold tracking-widest uppercase text-sm" scrub={true}>
                                The methodology
                            </SplitTextReveal>
                            
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight font-display text-balance">
                                <SplitTextReveal mode="words" stagger={0.1} scrub={true}>
                                    Built for those who refuse to settle.
                                </SplitTextReveal>
                            </h2>
                            
                            <SplitTextReveal mode="lines" as="p" className="text-xl text-gray-400 leading-relaxed font-light text-balance" delay={0.2} scrub={true}>
                                Standard agencies build brochures. We engineer digital engines that drive revenue, streamline ops, and visually destroy the competition.
                            </SplitTextReveal>
                            
                            <div className="flex items-center gap-4 text-gray-500 pt-4 opacity-50">
                                <div className="w-10 h-10 rounded-full border border-gray-700/50 flex items-center justify-center animate-bounce shadow-inner bg-black/20">
                                    <ChevronRight size={18} className="rotate-90 text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium tracking-wide uppercase">Scroll</span>
                            </div>
                        </div>

                        {/* Card Stack — 3D Perspectived */}
                        <div
                            ref={cardsContainerRef}
                            className="relative h-[400px] sm:h-[480px] perspective-[1500px]"
                        >
                            {cardData.map((card, i) => (
                                <div
                                    key={i}
                                    ref={el => { cardRefs.current[i] = el }}
                                    className={`absolute top-1/2 right-0 -translate-y-1/2 w-full max-w-[500px] h-80 rounded-3xl border ${card.borderClass} ${card.bgClass} backdrop-blur-2xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] p-10 flex flex-col justify-between overflow-hidden group`}
                                >
                                    {/* Glass reflection line */}
                                    <div className="absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent w-1/2 transition-transform duration-1000 group-hover:translate-x-[250%]" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/90 shadow-lg">
                                            {card.icon}
                                        </div>
                                        <span className="text-7xl font-display font-black opacity-10 text-white leading-none">0{i + 1}</span>
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="text-3xl font-bold text-white mb-4 font-display">{card.title}</h3>
                                        <p className={`${card.textClass} text-lg font-light leading-relaxed opacity-90`}>{card.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* PURPOSE SECTION - ASYMMETRIC LAYOUT */}
            {/* ================================================================== */}
            <section className="relative py-32 z-20 overflow-hidden bg-gray-950/50">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    
                    <div className="mb-20 max-w-2xl">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-display">
                            <SplitTextReveal mode="words" start="top 90%">
                                Why we wake up at 6am.
                            </SplitTextReveal>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8">
                        {/* Mission - Larger */}
                        <ParallaxSection speed={0.05} direction="up" className="h-full">
                            <SpotlightCard hoverScale={false} className="p-12 h-full flex flex-col justify-center border-indigo-500/20 bg-[#070b14]/80 relative overflow-hidden">
                                <div className="absolute -top-6 -right-6 text-[8rem] font-black text-indigo-500/5 select-none leading-none">MI</div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-8">
                                        <Target className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-6 font-display">The Mission</h3>
                                    <p className="text-xl text-gray-400 leading-relaxed font-light">
                                        To forge digital weapons for ambitious companies. We strip away the noise of modern tech to leave you with automated efficiency, pristine design, and unignorable brand presence.
                                    </p>
                                </div>
                            </SpotlightCard>
                        </ParallaxSection>

                        {/* Vision */}
                        <ParallaxSection speed={0.1} direction="up" className="h-full">
                            <SpotlightCard hoverScale={false} className="p-10 h-full flex flex-col justify-center border-purple-500/20 bg-[#0b0714]/80 relative overflow-hidden">
                                <div className="absolute -bottom-6 -right-6 text-[8rem] font-black text-purple-500/5 select-none leading-none">VS</div>
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8">
                                        <Lightbulb className="w-8 h-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-6 font-display">The Vision</h3>
                                    <p className="text-lg text-gray-400 leading-relaxed font-light">
                                        To be the silent architect behind the world's most dominant brands — recognized by the seamlessness of our systems and the sheer gravity of our designs.
                                    </p>
                                </div>
                            </SpotlightCard>
                        </ParallaxSection>
                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* SERVICES GRID */}
            {/* ================================================================== */}
            <section ref={servicesSectionRef} className="relative py-32 z-20">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/10 pb-8">
                        <div>
                            <p className="text-indigo-400 font-semibold mb-4 tracking-widest uppercase text-sm">Capabilities</p>
                            <h2 className="text-4xl md:text-6xl font-bold font-display">The full arsenal.</h2>
                        </div>
                        <MagneticButton strength={0.2}>
                            <Link href="/contact" className="hidden md:inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                Let's deploy an asset <ArrowRight size={18} />
                            </Link>
                        </MagneticButton>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {/* WHY CHOOSE US */}
            {/* ================================================================== */}
            <section ref={whyChooseSectionRef} className="relative py-32 z-20 bg-gradient-to-b from-transparent to-black/50">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <div className="max-w-3xl mb-20">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 font-display">Real reasons, not marketing fluff.</h2>
                        <p className="text-xl text-gray-400 font-light text-balance">We don't do buzzwords. We do math, architecture, and extreme design.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyChooseUs.map((item, idx) => (
                            <div key={idx} className="why-card border-l border-white/10 pl-6 hover:border-indigo-500/50 transition-colors duration-500">
                                <item.icon className="w-8 h-8 text-indigo-400 mb-6" />
                                <h3 className="text-xl font-bold mb-3 font-display text-white">{item.title}</h3>
                                <p className="text-base text-gray-400 font-light leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================================================================== */}
            {/* DUAL MARQUEE */}
            {/* ================================================================== */}
            <section className="relative py-16 overflow-hidden z-20 border-y border-white/5 bg-[#030712]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
                <div className="flex flex-col gap-4 relative z-10 w-full transform -rotate-2 scale-110">
                    <TextMarquee
                        texts={[
                            "DESIGNED TO DOMINATE", "SYSTEMS FOR SCALE", "UNIGNORABLE PRESENCE", "AI ARCHITECTURE", "DIGITAL GRAVITY"
                        ]}
                        speed={100}
                        direction="left"
                        className="text-5xl md:text-7xl font-black font-display text-transparent"
                        textClassName="tracking-tighter uppercase"
                        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.15)" }}
                        separator={<span className="mx-16" />}
                    />
                    <TextMarquee
                        texts={[
                            "PRECISION ENGINEERING", "PURE AESTHETIC", "ALGORITHMIC LEVERAGE", "ZERO FLUFF", "CODE AS ART"
                        ]}
                        speed={120}
                        direction="right"
                        className="text-5xl md:text-7xl font-black font-display text-transparent"
                        textClassName="tracking-tighter uppercase"
                        style={{ WebkitTextStroke: "1px rgba(99,102,241,0.2)" }}
                        separator={<span className="mx-16" />}
                    />
                </div>
            </section>

            {/* ================================================================== */}
            {/* CTA SECTION - RADIAL LIGHT */}
            {/* ================================================================== */}
            <section className="relative py-40 overflow-hidden z-20">
                <div className="absolute inset-0 bg-gray-950" />
                
                {/* Massive abstract light source */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1000px] aspect-square rounded-full bg-indigo-600/10 blur-[100px] animate-pulse pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                        
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 mb-10 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                            <DecryptedText
                                text="System Ready"
                                animateOn="view"
                                speed={60}
                                maxIterations={20}
                                className="text-white/90 text-sm font-mono tracking-widest uppercase"
                            />
                        </div>

                        <h2 className="text-5xl sm:text-6xl md:text-[5rem] font-black mb-8 leading-[1.1] font-display text-balance">
                            <span>One conversation.</span><br/>
                            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-[length:200%_auto] animate-gradient-flow bg-clip-text text-transparent">
                                That's all it takes.
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl text-gray-400 mb-14 font-light max-w-2xl text-balance">
                            Ready to stop blending in? Claim your digital monopoly with systems and aesthetics that demand respect.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
                            <MagneticButton strength={0.4} className="w-full sm:w-auto">
                                <Link href="/contact" className="btn-gradient w-full sm:w-auto flex justify-center">
                                    Start a Project
                                </Link>
                            </MagneticButton>
                            <MagneticButton strength={0.2} className="w-full sm:w-auto">
                                <Link href="/portfolio" className="btn-ghost w-full sm:w-auto flex justify-center">
                                    Review Our Ledger
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
