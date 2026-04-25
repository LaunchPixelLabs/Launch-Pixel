"use client"

import React, { useRef, useEffect, ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface ParallaxSectionProps {
    children: ReactNode
    className?: string
    speed?: number      // 0 = no parallax, 1 = full parallax
    direction?: "up" | "down"
    as?: "section" | "div"
}

export default function ParallaxSection({
    children,
    className = "",
    speed = 0.3,
    direction = "up",
    as: Tag = "section",
}: ParallaxSectionProps) {
    const ref = useRef<HTMLElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        const inner = innerRef.current
        if (!el || !inner) return

        // Skip on mobile for performance
        if (window.matchMedia("(max-width: 768px)").matches) return

        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            const yMove = 100 * speed * (direction === "up" ? 1 : -1)

            gsap.fromTo(
                inner,
                { y: -yMove },
                {
                    y: yMove,
                    ease: "none",
                    scrollTrigger: {
                        trigger: el,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true,
                    },
                }
            )
        })

        return () => ctx.revert()
    }, [speed, direction])

    return (
        <Tag ref={ref as any} className={`overflow-hidden ${className}`}>
            <div ref={innerRef} style={{ willChange: "transform" }}>
                {children}
            </div>
        </Tag>
    )
}
