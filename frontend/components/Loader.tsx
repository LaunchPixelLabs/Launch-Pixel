"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Flame particle component for the rocket exhaust
function FlameParticle({ delay, offsetX }: { delay: number; offsetX: number }) {
    return (
        <div
            className="absolute w-3 h-3 rounded-sm animate-flame-shoot"
            style={{
                animationDelay: `${delay}s`,
                left: `${50 + offsetX}%`,
                bottom: '0',
                background: 'linear-gradient(to bottom, #fbbf24, #f97316, #ef4444)',
                boxShadow: '0 0 8px rgba(251, 191, 36, 0.8), 0 0 16px rgba(249, 115, 22, 0.5)',
            }}
        />
    );
}

// Core flame glow at the rocket base
function FlameCore() {
    return (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 animate-flame-flicker">
            {/* Inner bright core */}
            <div
                className="w-6 h-10 rounded-b-full"
                style={{
                    background: 'linear-gradient(to bottom, #fef08a, #fbbf24, #f97316)',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.9), 0 0 40px rgba(249, 115, 22, 0.7), 0 0 60px rgba(239, 68, 68, 0.5)',
                }}
            />
            {/* Outer glow */}
            <div
                className="absolute -inset-2 rounded-b-full opacity-60"
                style={{
                    background: 'radial-gradient(ellipse at center top, rgba(251, 191, 36, 0.8), transparent)',
                    filter: 'blur(4px)',
                }}
            />
        </div>
    );
}

interface LoaderProps {
    progress?: number;
}

export default function Loader({ progress = 0 }: LoaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center" />;
    }

    // Generate randomized flame particles
    const particles = Array.from({ length: 8 }, (_, i) => ({
        delay: (i * 0.08) % 0.6,
        offsetX: (Math.sin(i * 1.5) * 12),
    }));

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 overflow-hidden">
            {/* Background glow effect */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2), transparent 70%)',
                }}
            />

            <div className="relative">
                {/* Rocket with floating + thrust animation */}
                <div className="animate-rocket-float">
                    <div className="animate-rocket-thrust relative">
                        <Image
                            src="/rocket.webp"
                            alt="Loading..."
                            width={150}
                            height={150}
                            priority
                            style={{
                                filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))',
                            }}
                        />

                        {/* Flame exhaust container - positioned at rocket's bottom */}
                        <div
                            className="absolute"
                            style={{
                                // Position flames at the rocket's thruster area
                                // Rocket is rotated -45deg, so we need to offset appropriately
                                bottom: '15px',
                                left: '15px',
                                width: '40px',
                                height: '60px',
                                transform: 'rotate(45deg)',
                            }}
                        >
                            <FlameCore />
                            {particles.map((p, i) => (
                                <FlameParticle key={i} delay={p.delay} offsetX={p.offsetX} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Brand text with glow animation */}
            <div className="mt-12 text-center">
                <h2
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 animate-text-glow"
                    style={{
                        textShadow: '0 0 30px rgba(129, 140, 248, 0.5)',
                    }}
                >
                    LAUNCHPIXEL
                </h2>
                <p className="text-indigo-400/80 text-sm mt-2 tracking-widest uppercase">
                    {progress < 100 ? 'Preparing for liftoff...' : 'Ready for launch!'}
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-800 rounded-full mt-6 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>
            <p className="text-gray-500 text-xs mt-2">{Math.round(progress)}%</p>
        </div>
    );
}
