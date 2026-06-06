"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  ShieldCheck, 
  FileText, 
  Cpu, 
  CheckCircle, 
  Lock, 
  Search, 
  Terminal, 
  Award, 
  MessageSquare, 
  ListChecks 
} from "lucide-react";
import { TrustGauge } from "@/components/ui/TrustGauge";
import { SkillPill } from "@/components/ui/SkillPill";
import { VeriSphereDashboardPreview } from "@/components/ui/VeriSphereDashboardPreview";
import { useRef, useState, useEffect } from "react";
import {
  fadeInUp as libFadeInUp,
  staggerContainer as libStaggerContainer,
  staggerItem,
  cardHover,
  viewportOnce,
} from "@/lib/motion-variants";

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 20
    }
  }
};

const heroTexts = [
  { p1: "Verify candidates,", p2: "not just resumes." },
  { p1: "Uncover the truth", p2: "behind every claim." },
  { p1: "Hire talent with", p2: "forensic confidence." },
  { p1: "Validate technical skills", p2: "instantly." }
];

const CyclingTypewriter = ({ items, delay = 0 }: { items: { p1: string, p2: string }[], delay?: number }) => {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  const currentItem = items[loopNum % items.length];
  const currentFullText = currentItem.p1 + currentItem.p2;

  useEffect(() => {
    if (!hasStarted) return;

    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentFullText) {
      timeout = setTimeout(() => setIsDeleting(true), 3000); 
    } else if (isDeleting && displayText === "") {
      setLoopNum((prev) => prev + 1);
      setIsDeleting(false);
    } else {
      timeout = setTimeout(() => {
        setDisplayText(currentFullText.substring(0, displayText.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? 20 : 50); 
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentFullText, hasStarted]);

  const p1Length = currentItem.p1.length;
  const displayP1 = displayText.substring(0, p1Length);
  const displayP2 = displayText.substring(p1Length);

  return (
    <span className="inline-block relative w-full">
      <span className="invisible">
        <span className="block text-[var(--text-primary)]">{currentItem.p1}</span>
        <span className="block text-[var(--brand-navy)] italic">{currentItem.p2 || "\u00A0"}</span>
      </span>
      <span className="absolute inset-0">
        <span className="block text-[var(--text-primary)]">
          {displayP1 || "\u00A0"}
        </span>
        <span className="block text-[var(--brand-navy)] italic">
          {displayP2 || "\u00A0"}
        </span>
      </span>
    </span>
  );
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityParallax = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" ref={containerRef}>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 dot-pattern overflow-hidden">
        {/* Animated Background Blob */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--brand-blue)] rounded-full blur-[100px] -z-10 pointer-events-none"
        />

        <motion.div 
          style={{ y: yParallax, opacity: opacityParallax }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <motion.div 
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-6xl font-serif mb-6 leading-[1.1]">
              <CyclingTypewriter items={heroTexts} delay={0.2} />
            </h1>

            <motion.p 
              variants={heroItemVariants}
              className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed"
            >
              VeriSphere cross-references resume claims, GitHub activity, and certificate metadata into a single forensic trust report &mdash; in under 90 seconds.
            </motion.p>

            <motion.div 
              variants={heroItemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
            >
              <Link 
                href="/verify" 
                className="w-full sm:w-auto bg-[var(--brand-blue)] text-white font-medium px-8 py-4 rounded-xl hover:bg-blue-700 hover:shadow-[0_8px_30px_rgb(0,112,243,0.3)] transition-all hover:-translate-y-0.5 text-center text-sm whitespace-nowrap"
              >
                Start Verifying
              </Link>
              <a 
                href="#how-it-works" 
                className="w-full sm:w-auto bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] font-medium px-8 py-4 rounded-xl hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-all text-center text-sm shadow-sm"
              >
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Hero Visual Card */}
        <motion.div 
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.6 }}
          className="w-full mt-16"
        >
          <VeriSphereDashboardPreview />
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-[var(--bg-page)] px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-[var(--brand-blue)] text-sm font-bold uppercase tracking-widest block mb-4"
            >The Process</motion.span>
            <h2 className="text-4xl md:text-5xl font-serif text-[var(--text-primary)]">Three-layer verification,<br />one clear verdict.</h2>
          </motion.div>
          
          <motion.div 
            variants={libStaggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Animated dashed line */}
            <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-px bg-[var(--border-strong)] border-t border-dashed -z-10" />
            
            {[
              { Icon: FileText, num: '1', title: 'Upload', desc: "Drop the candidate's resume PDF and certificates. Add their GitHub username. That's all you need." },
              { Icon: Cpu, num: '2', title: 'Analyze', desc: 'VeriSphere extracts every claim, scans repositories, and inspects certificate metadata for signs of modification.' },
              { Icon: ShieldCheck, num: '3', title: 'Decide', desc: 'Receive a forensic trust report with a scored verdict, evidence trail, risk flags, and targeted interview questions.' },
            ].map((step) => (
              <motion.div 
                key={step.num}
                variants={staggerItem}
                whileHover={{ y: -8, boxShadow: 'var(--shadow-md)' }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 shadow-[var(--shadow-sm)] relative group cursor-default"
              >
                <div className="absolute -top-4 -right-4 text-9xl font-bold text-[var(--bg-muted)] opacity-50 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 -z-10 select-none">{step.num}</div>
                <div className="w-12 h-12 bg-[var(--brand-blue-light)] text-[var(--brand-blue)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300">
                  <step.Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust Score Feature */}
      <section className="py-24 bg-[var(--bg-page)] border-y border-[var(--border)] px-6 overflow-hidden relative">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[400px] -right-[400px] w-[800px] h-[800px] border-[1px] border-[var(--border)] rounded-full border-dashed opacity-50 pointer-events-none"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] border-[1px] border-[var(--border)] rounded-full border-dashed opacity-50 pointer-events-none"
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            variants={libStaggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.span variants={staggerItem} className="text-[var(--brand-navy)] text-sm font-bold uppercase tracking-widest block mb-4">Trust Scoring</motion.span>
            <motion.h2 variants={staggerItem} className="text-4xl font-serif text-[var(--text-primary)] mb-6">A number you can defend to your hiring committee.</motion.h2>
            <motion.p variants={staggerItem} className="text-lg text-[var(--text-secondary)] leading-relaxed">
              The Trust Score isn't an AI guess &mdash; it's a calculated metric from verified GitHub commits, validated skills, and certificate forensic analysis. Every point is sourced.
            </motion.p>
          </motion.div>
          <div className="flex justify-center md:justify-end">
            <motion.div 
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }} 
              viewport={viewportOnce}
              transition={{ type: "spring", stiffness: 80, damping: 20 }} 
              whileHover={{ scale: 1.04, rotate: 1 }}
              className="bg-[var(--bg-surface)] p-12 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-[var(--border)]"
            >
              <TrustGauge score={74} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 bg-[var(--bg-page)] px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl font-serif text-[var(--text-primary)] text-center mb-20"
          >
            Everything you need to verify a candidate.
          </motion.h2>

          <motion.div 
            variants={libStaggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { Icon: Search, title: 'Resume Forensics', desc: 'Extracts and maps every technical claim to evidence' },
              { Icon: Terminal, title: 'GitHub Intelligence', desc: 'Analyzes ownership, commit history, and language proof' },
              { Icon: Award, title: 'Certificate Validation', desc: 'PDF metadata forensics to detect tampering' },
              { Icon: Cpu, title: 'AI Reasoning', desc: 'Gemini synthesizes all evidence into a structured verdict' },
              { Icon: ListChecks, title: 'Audit Trail', desc: 'Full evidence chain with source citations' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={staggerItem}
                whileHover={{ y: -6, boxShadow: "var(--shadow-md)", borderColor: "var(--brand-blue-light)" }}
                transition={{ duration: 0.2 }}
                className="bg-[var(--bg-surface)] border border-[var(--border)] p-8 rounded-2xl transition-colors duration-300 group cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 4 }}
                  transition={{ duration: 0.25 }}
                  className="w-12 h-12 bg-[var(--brand-blue-light)] text-[var(--brand-blue)] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[var(--brand-blue)] group-hover:text-white transition-colors duration-300"
                >
                  <feature.Icon size={24} />
                </motion.div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-blue)] transition-colors">{feature.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-[#0F172A] py-32 px-6 text-center overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full blur-[120px] pointer-events-none"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-[120px] pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring" }}
          className="max-w-3xl mx-auto relative z-10"
        >
          <h2 className="text-5xl font-serif text-white mb-6">Start your first verification free.</h2>
          <p className="text-slate-300 text-lg mb-10">No credit card. No setup. Results in 90 seconds.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/verify" className="inline-block bg-white text-[#0F172A] font-bold px-10 py-4 rounded-xl hover:bg-slate-100 transition-colors shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)]">
              Start Verifying &rarr;
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
