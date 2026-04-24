"use client";

import React, { useState, useEffect } from "react";
import Loader from "@/components/Loader";

export default function GlobalLoader({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setMounted(true);

        // Check if loader has already been shown this session
        const loaderShown = sessionStorage.getItem('launchpixel_loader_shown');

        if (loaderShown) {
            // Loader already shown this session - skip it
            setLoading(false);
            setProgress(100);
            return;
        }

        // Start loading sequence
        const startTime = Date.now();
        const minLoadTime = 2000; // Minimum 2 seconds to show branding

        // Simulate progress while resources load
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev; // Cap at 90% until ready
                return prev + Math.random() * 15;
            });
        }, 200);

        // Check for actual page readiness
        const checkReady = () => {
            const elapsed = Date.now() - startTime;

            // Check if browser has finished loading critical resources
            const isDocumentReady = document.readyState === 'complete';
            const fontsLoaded = document.fonts?.status === 'loaded';
            const hasMinTime = elapsed >= minLoadTime;

            if (isDocumentReady && fontsLoaded && hasMinTime) {
                clearInterval(progressInterval);
                setProgress(100);

                // Small delay after 100% for visual effect
                setTimeout(() => {
                    setLoading(false);
                    sessionStorage.setItem('launchpixel_loader_shown', 'true');
                }, 300);
            } else {
                // Keep checking
                requestAnimationFrame(checkReady);
            }
        };

        // Start checking readiness
        requestAnimationFrame(checkReady);

        // Fallback timeout - never show loader for more than 6 seconds
        const fallbackTimer = setTimeout(() => {
            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem('launchpixel_loader_shown', 'true');
            }, 300);
        }, 6000);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(fallbackTimer);
        };
    }, []);

    // Avoid hydration mismatch - render nothing until mounted
    if (!mounted) {
        return (
            <div style={{ opacity: 0, pointerEvents: 'none', minHeight: '100vh' }}>
                {children}
            </div>
        );
    }

    return (
        <>
            {loading && <Loader progress={progress} />}
            <div
                style={{
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.5s ease-in-out",
                    pointerEvents: loading ? "none" : "auto",
                }}
            >
                {children}
            </div>
        </>
    );
}
