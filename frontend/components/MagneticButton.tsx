"use client"

import React, { useRef, useEffect, ReactNode } from "react"
import gsap from "gsap"

interface MagneticButtonProps {
    children: ReactNode
    className?: string
    strength?: number
    as?: "button" | "div" | "span"
    onClick?: () => void
}

export default function MagneticButton({
    children,
    className = "",
    strength = 0.35,
    as: Component = "div",
    onClick
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        // Only enable on pointer devices
        if (window.matchMedia("(pointer: coarse)").matches) return

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            const deltaX = (e.clientX - centerX) * strength
            const deltaY = (e.clientY - centerY) * strength

            gsap.to(el, {
                x: deltaX,
                y: deltaY,
                duration: 0.4,
                ease: "power2.out",
            })

            // Inner content moves opposite for a parallax depth feel
            if (innerRef.current) {
                gsap.to(innerRef.current, {
                    x: deltaX * 0.15,
                    y: deltaY * 0.15,
                    duration: 0.4,
                    ease: "power2.out",
                })
            }
        }

        const handleMouseLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.4)",
            })
            if (innerRef.current) {
                gsap.to(innerRef.current, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.4)",
                })
            }
        }

        el.addEventListener("mousemove", handleMouseMove)
        el.addEventListener("mouseleave", handleMouseLeave)

        return () => {
            el.removeEventListener("mousemove", handleMouseMove)
            el.removeEventListener("mouseleave", handleMouseLeave)
        }
    }, [strength])

    return (
        <div ref={ref} className={`inline-block ${className}`} onClick={onClick} style={{ willChange: 'transform' }}>
            <div ref={innerRef}>
                {children}
            </div>
        </div>
    )
}
