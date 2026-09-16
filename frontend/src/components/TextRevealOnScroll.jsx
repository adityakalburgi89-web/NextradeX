import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Native React + Framer Motion Text Reveal on Scroll Component
 * Recreates the Framer Framer-Motion "Text-Reveal-on-Scroll" effect cleanly.
 */
export default function TextRevealOnScroll({ text, className = "" }) {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  const words = text.split(" ");

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap gap-x-2 gap-y-1 ${className}`}>
      {words.map((word, idx) => {
        const start = idx / words.length;
        const end = start + 1 / words.length;
        // Opacity transforms smoothly per word as page scrolls
        const opacity = useTransform(scrollYProgress, [start, end], [0.18, 1.0]);
        // Color transition from subtle muted grey to high-contrast carbon/white
        const color = useTransform(scrollYProgress, [start, end], ["rgba(150,150,150,0.3)", "rgba(24,25,37,1)"]);

        return (
          <motion.span
            key={`${word}-${idx}`}
            style={{ opacity, color }}
            className="transition-all duration-75 inline-block"
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}
