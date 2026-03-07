'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoaderProps {
    fullScreen?: boolean;
    text?: string;
    show?: boolean;
}

const ORBS = [
    { cx: 18, cy: 22, r: 2.5, delay: 0, dur: 3.2 },
    { cx: 82, cy: 14, r: 1.8, delay: 0.6, dur: 4.1 },
    { cx: 91, cy: 70, r: 2.2, delay: 1.2, dur: 3.7 },
    { cx: 12, cy: 78, r: 1.5, delay: 1.8, dur: 4.5 },
    { cx: 50, cy: 8, r: 1.2, delay: 0.9, dur: 3.9 },
    { cx: 94, cy: 42, r: 1.0, delay: 2.1, dur: 5.0 },
    { cx: 6, cy: 50, r: 1.0, delay: 2.7, dur: 4.3 },
];

const TICKS = Array.from({ length: 48 }, (_, i) => i);

function LoaderContent() {
    const r1 = 120, r2 = 100, r3 = 82;
    const c1 = 2 * Math.PI * r1;
    const c2 = 2 * Math.PI * r2;
    const c3 = 2 * Math.PI * r3;

    return (
        <div className="relative flex items-center justify-center select-none">
            {/* Ring assembly */}
            <div className="relative" style={{ width: 340, height: 340, zIndex: 1 }}>
                <svg viewBox="0 0 300 300" width="340" height="340"
                    className="absolute inset-0" style={{ overflow: "visible" }}>

                    {/* Tick marks */}
                    <g transform="translate(150,150)">
                        {TICKS.map((i) => {
                            const angle = (i / 48) * 360;
                            const rad = (angle * Math.PI) / 180;
                            const isMajor = i % 6 === 0;
                            const outerR = 144, innerR = isMajor ? 136 : 139;
                            return (
                                <motion.line
                                    key={i}
                                    x1={Math.cos(rad) * outerR} y1={Math.sin(rad) * outerR}
                                    x2={Math.cos(rad) * innerR} y2={Math.sin(rad) * innerR}
                                    stroke={isMajor ? "#f5b731" : "#1a2344"}
                                    strokeWidth={isMajor ? 2 : 1}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: isMajor ? 0.85 : 0.22 }}
                                    transition={{ delay: i * 0.018, duration: 0.5 }}
                                />
                            );
                        })}
                    </g>

                    {/* Ring 1 — gold sweep */}
                    <g transform="translate(150,150) rotate(-90)">
                        <circle r={r1} fill="none" stroke="#1a2344" strokeWidth="1" opacity="0.12" />
                        <motion.circle
                            r={r1} fill="none" stroke="#f5b731" strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeDasharray={c1}
                            animate={{
                                strokeDashoffset: [c1, c1 * 0.08, c1],
                                opacity: [0.45, 1, 0.45],
                            }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
                        />
                        {/* Leading dot on ring 1 */}
                        <motion.g animate={{ rotate: 360 }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "0 0" }}>
                            <circle cx={r1} cy="0" r="5.5" fill="#f5b731" />
                            <circle cx={r1} cy="0" r="9" fill="#f5b731" opacity="0.2" />
                        </motion.g>
                    </g>

                    {/* Ring 2 — navy arc */}
                    <g transform="translate(150,150) rotate(90)">
                        <circle r={r2} fill="none" stroke="#1a2344" strokeWidth="1" opacity="0.10" />
                        <motion.circle
                            r={r2} fill="none" stroke="#1a2344" strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={c2}
                            animate={{
                                strokeDashoffset: [c2, c2 * 0.25, c2],
                                opacity: [0.25, 0.65, 0.25],
                            }}
                            transition={{ duration: 4.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
                        />
                    </g>

                    {/* Ring 3 — thin inner spinner */}
                    <g transform="translate(150,150) rotate(-90)">
                        <circle r={r3} fill="none" stroke="#f5b731" strokeWidth="0.8" opacity="0.10" />
                        <motion.circle
                            r={r3} fill="none" stroke="#f5b731" strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeDasharray={`${c3 * 0.18} ${c3 * 0.82}`}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "0 0" }}
                            opacity="0.65"
                        />
                    </g>

                    {/* Floating orbs */}
                    {ORBS.map((orb, i) => (
                        <motion.circle
                            key={i}
                            cx={`${orb.cx}%`} cy={`${orb.cy}%`} r={orb.r}
                            fill="#f5b731"
                            animate={{ opacity: [0, 0.75, 0], scale: [0.4, 1, 0.4] }}
                            transition={{ duration: orb.dur, repeat: Infinity, delay: orb.delay, ease: "easeInOut" }}
                        />
                    ))}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1], opacity: [0.88, 1, 0.88] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10"
                    >
                        <img src="/logo.png" alt="Loading..." className="w-38 h-auto drop-shadow-2xl object-contain" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function Loader({ fullScreen = false, text, show = true }: LoaderProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (fullScreen) {
        return (
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeOut" } }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
                    >
                        {/* Custom background pattern */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                opacity: 0.25,
                                backgroundImage: `url("/assets/loader-pattern.png")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                mixBlendMode: 'multiply'
                            }}
                        />
                        <LoaderContent />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return <LoaderContent />;
}