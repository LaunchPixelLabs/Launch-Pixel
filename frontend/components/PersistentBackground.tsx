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
    const isHome = pathname === "/"

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div
            className="fixed inset-0 z-0 opacity-100 pointer-events-none transition-opacity duration-1000"
        >
            <Antigravity
                count={600}
                magnetRadius={25}
                ringRadius={15}
                waveSpeed={0.8}
                waveAmplitude={1.8}
                particleSize={1.5}
                lerpSpeed={0.08}
                color="#6366f1"
                autoAnimate
                particleVariance={1.5}
                rotationSpeed={0.02}
                depthFactor={1.5}
                pulseSpeed={4}
                particleShape="capsule"
                fieldStrength={15}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950/60 to-gray-950 pointer-events-none" />
        </div>
    )
}
