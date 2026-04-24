"use client"

import { useEffect, useRef } from "react"

interface TextMarqueeProps {
    texts: string[]
    speed?: number
    direction?: "left" | "right"
    className?: string
    textClassName?: string
    separator?: React.ReactNode
    pauseOnHover?: boolean
}

export default function TextMarquee({
    texts,
    speed = 40,
    direction = "left",
    className = "",
    textClassName = "",
    separator = <span className="mx-8 text-indigo-500">✦</span>,
    pauseOnHover = true
}: TextMarqueeProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!scrollerRef.current || !containerRef.current) return

        const scroller = scrollerRef.current
        const scrollerContent = Array.from(scroller.children)

        // Clone items for seamless loop
        scrollerContent.forEach((item) => {
            const clone = item.cloneNode(true)
            scroller.appendChild(clone)
        })

        // Set animation
        const scrollerWidth = scroller.scrollWidth / 2
        const duration = scrollerWidth / speed

        scroller.style.setProperty("--duration", `${duration}s`)
        scroller.style.setProperty("--direction", direction === "left" ? "normal" : "reverse")
    }, [speed, direction])

    return (
        <div
            ref={containerRef}
            className={`overflow-hidden ${className}`}
        >
            <div
                ref={scrollerRef}
                className={`flex whitespace-nowrap animate-marquee ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
                style={{
                    animation: `marquee var(--duration, 30s) linear infinite var(--direction, normal)`
                }}
            >
                {texts.map((text, idx) => (
                    <span key={idx} className={`inline-flex items-center ${textClassName}`}>
                        <span>{text}</span>
                        {separator}
                    </span>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee var(--duration, 30s) linear infinite var(--direction, normal);
                }
            `}</style>
        </div>
    )
}
