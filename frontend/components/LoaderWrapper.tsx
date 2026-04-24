"use client";

import React, { useState, useEffect } from "react";
import Loader from "@/components/Loader";

export default function LoaderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Check if loader has already been shown this session
        const loaderShown = sessionStorage.getItem('launchpixel_loader_shown');

        if (!loaderShown) {
            // First visit this session - show the loader
            setLoading(true);

            const timer = setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem('launchpixel_loader_shown', 'true');
            }, 5000); // 5 seconds delay

            return () => clearTimeout(timer);
        }
    }, []);

    // Avoid hydration mismatch - render nothing until mounted
    if (!mounted) {
        return (
            <div style={{ opacity: 0, pointerEvents: 'none' }}>
                {children}
            </div>
        );
    }

    return (
        <>
            {loading && <Loader />}
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
