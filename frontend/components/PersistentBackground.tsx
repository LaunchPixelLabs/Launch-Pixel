"use client"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const Antigravity = dynamic(() => import('./Antigravity'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-gray-950 opacity-100 transition-opacity duration-1000" />
})

export default function PersistentBackground() {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const isHome = pathname === "/"

    useEffect(() => {
        setMounted(true)
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div
            className="fixed inset-0 z-0 opacity-100 pointer-events-none transition-opacity duration-1000"
            style={{ willChange: "transform" }}
        >
            {!isMobile && (
                <Antigravity
                    count={400}
                magnetRadius={30}
                ringRadius={20}
                waveSpeed={0.5}
                waveAmplitude={1.2}
                particleSize={1.2}
                lerpSpeed={0.06}
                color="#818cf8"
                autoAnimate
                particleVariance={2.0}
                rotationSpeed={0.01}
                depthFactor={2.0}
                pulseSpeed={2}
                particleShape="sphere"
                fieldStrength={20}
            />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-[#09090b]/90 to-[#09090b] pointer-events-none" />
        </div>
    )
}
