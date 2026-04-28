"use client"

import React, { useRef, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface SplitTextRevealProps {
    children: string
    className?: string
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div"
    mode?: "words" | "chars" | "lines"
    stagger?: number
    duration?: number
    delay?: number
    scrub?: boolean | number
    start?: string
    end?: string
    once?: boolean
}

export default function SplitTextReveal({
    children,
    className = "",
    as: Tag = "div",
    mode = "words",
    stagger = 0.04,
    duration = 0.8,
    delay = 0,
    scrub = false,
    start = "top 85%",
    end = "top 50%",
    once = true,
}: SplitTextRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        gsap.registerPlugin(ScrollTrigger)

        const ctx = gsap.context(() => {
            const text = children
            el.innerHTML = ""

            if (mode === "words") {
                const words = text.split(/\s+/)
                words.forEach((word, i) => {
                    const wrapper = document.createElement("span")
                    wrapper.style.display = "inline-block"
                    wrapper.style.overflow = "hidden"
                    wrapper.style.verticalAlign = "top"

                    const inner = document.createElement("span")
                    inner.style.display = "inline-block"
                    inner.textContent = word
                    inner.className = "split-word"

                    wrapper.appendChild(inner)
                    el.appendChild(wrapper)

                    // Add space between words
                    if (i < words.length - 1) {
                        const space = document.createTextNode("\u00A0")
                        el.appendChild(space)
                    }
                })
            } else if (mode === "chars") {
                const chars = text.split("")
                chars.forEach((char) => {
                    const wrapper = document.createElement("span")
                    wrapper.style.display = "inline-block"
                    wrapper.style.overflow = "hidden"

                    const inner = document.createElement("span")
                    inner.style.display = "inline-block"
                    inner.textContent = char === " " ? "\u00A0" : char
                    inner.className = "split-char"

                    wrapper.appendChild(inner)
                    el.appendChild(wrapper)
                })
            } else {
                // lines mode — wrap entire text as one block
                const wrapper = document.createElement("span")
                wrapper.style.display = "inline-block"
                wrapper.style.overflow = "hidden"

                const inner = document.createElement("span")
                inner.style.display = "inline-block"
                inner.textContent = text
                inner.className = "split-line"

                wrapper.appendChild(inner)
                el.appendChild(wrapper)
            }

            const targets = el.querySelectorAll(".split-word, .split-char, .split-line")

            gsap.set(targets, {
                y: "110%",
                opacity: 0,
            })

            const animConfig: gsap.TweenVars = {
                y: "0%",
                opacity: 1,
                duration,
                stagger,
                ease: "power3.out",
                delay,
            }

            if (scrub) {
                gsap.to(targets, {
                    ...animConfig,
                    scrollTrigger: {
                        trigger: el,
                        start,
                        end,
                        scrub: typeof scrub === "number" ? scrub : 0.5,
                        once,
                    },
                })
            } else {
                gsap.to(targets, {
                    ...animConfig,
                    scrollTrigger: {
                        trigger: el,
                        start,
                        once,
                    },
                })
            }
        })

        return () => ctx.revert()
    }, [children, mode, stagger, duration, delay, scrub, start, end, once])

    return (
        <Tag
            ref={containerRef as any}
            className={className}
            aria-label={children}
        />
    )
}
