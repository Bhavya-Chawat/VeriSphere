"use client";

import { motion } from "framer-motion";

const technologies = [
  "GitHub", "LinkedIn", "Coursera", "Credly", "AWS", "OpenAI", "Next.js", 
  "TypeScript", "Framer Motion", "Tailwind CSS", "React", "Node.js", "Vercel",
  // duplicate for seamless infinite scrolling
  "GitHub", "LinkedIn", "Coursera", "Credly", "AWS", "OpenAI", "Next.js", 
  "TypeScript", "Framer Motion", "Tailwind CSS", "React", "Node.js", "Vercel",
];

export function TechMarquee() {
  return (
    <div className="w-full py-10 border-y border-[var(--border)] overflow-hidden relative bg-[var(--bg-subtle)] flex items-center">
      {/* Gradient masks for smooth fading on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--bg-subtle)] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--bg-subtle)] to-transparent z-10" />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 30,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex whitespace-nowrap gap-16 pr-16 items-center"
      >
        {technologies.map((tech, i) => (
          <div 
            key={i} 
            className="text-xl md:text-2xl font-bold text-[var(--text-tertiary)] opacity-60 flex-shrink-0"
            style={{ fontFamily: "var(--font-geist-sans)" }}
          >
            {tech}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
