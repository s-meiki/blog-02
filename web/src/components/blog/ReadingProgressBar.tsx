"use client";

import { useEffect, useState } from "react";

/**
 * Reading progress bar that shows scroll progress at the top of the viewport.
 */
export function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, scrollProgress)));
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 z-50 h-1 w-full bg-neutral-200/50 backdrop-blur-sm">
            <div
                className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600 transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="読み進め度"
            />
        </div>
    );
}
