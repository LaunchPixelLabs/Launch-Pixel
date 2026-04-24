"use client"
import React, { useRef } from "react"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    borderColor?: string
    spotlightColor?: string
    hoverScale?: boolean
}

export default function SpotlightCard({
    children,
    className = "",
    borderColor = "rgba(82, 39, 255, 0.2)",
    spotlightColor = "rgba(82, 39, 255, 0.45)",
    hoverScale = true,
    ...props
}: SpotlightCardProps) {
    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const card = e.currentTarget
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        card.style.setProperty("--mouse-x", `${x}px`)
        card.style.setProperty("--mouse-y", `${y}px`)
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden rounded-[20px] border transition-all duration-300 ${hoverScale ? 'hover:scale-105' : ''} ${className}`}
            style={
                {
                    "--mouse-x": "0px",
                    "--mouse-y": "0px",
                    "--spotlight-color": spotlightColor,
                    borderColor: borderColor,
                    background: "rgba(82, 39, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                } as React.CSSProperties
            }
            {...props}
        >
            {/* Spotlight effect */}
            <div
                className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background:
                        "radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 87.5%)",
                }}
            />

            {/* Content wrapper */}
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    )
}
