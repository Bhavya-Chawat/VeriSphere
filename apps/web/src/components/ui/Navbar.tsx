"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme, mounted } = useTheme();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Verify Candidate", href: "/verify" },
    { name: "Sample Report", href: "/report/demo" },
    { name: "Dashboard", href: "/report/VSP-2024-00847" },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 h-[72px] flex items-center backdrop-blur-[16px] bg-[var(--bg-nav)] font-heading"
      animate={{
        borderBottomWidth: isScrolled ? 1 : 1,
        borderBottomColor: isScrolled ? "var(--border-strong)" : "var(--border)",
        boxShadow: isScrolled
          ? "0 1px 12px rgba(0,0,0,0.06), 0 0 0 1px var(--border-strong)"
          : "0 0 0 1px var(--border)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ borderBottomStyle: "solid" }}
    >
      <div className="w-full max-w-[1280px] mx-auto px-8 flex items-center justify-between">
        
        {/* Left Section: Logo & Subtitle */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <motion.div
            whileHover={{ scale: 1.08, y: -2, rotate: -2, boxShadow: "var(--shadow-sm)" }}
            whileTap={{ scale: 0.95, y: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-sm border border-[var(--border)] relative bg-white shrink-0"
          >
            <Image src="/logo.png" alt="VeriSphere Logo" width={48} height={48} className="object-contain w-full h-full scale-[2.2]" />
          </motion.div>
          <div className="flex flex-col">
            <div className="flex items-baseline leading-none">
              <span className="font-heading italic text-2xl text-[var(--brand-navy)] font-normal group-hover:text-[var(--brand-blue)] transition-colors duration-300">Veri</span>
              <span className="font-heading font-semibold text-xl text-[var(--brand-navy)] tracking-tight group-hover:text-[var(--brand-blue)] transition-colors duration-300">Sphere</span>
            </div>
            <span className="text-[11px] font-heading font-medium text-[var(--text-tertiary)] mt-1 tracking-wide uppercase">
              Candidate Verification Intelligence
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <div className="flex items-center gap-1" onMouseLeave={() => setHoveredPath(null)}>
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            const isHovered = hoveredPath === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredPath(link.href)}
                className={`relative px-4 py-2 text-[14px] font-heading rounded-full transition-colors duration-300 ${
                  active
                    ? "text-[var(--brand-blue)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                }`}
              >
                {/* Hover background pill */}
                {isHovered && (
                  <motion.span
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-[var(--bg-subtle)] rounded-full -z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}

                <span className="relative z-10">{link.name}</span>

                {/* Sliding active indicator */}
                {active && (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute bottom-[-16px] left-4 right-4 h-[3px] bg-[var(--brand-blue)] rounded-t-full z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Section: CTA & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle with icon flip animation */}
          <motion.button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] relative overflow-hidden"
            whileHover={{ scale: 1.08, backgroundColor: "var(--bg-subtle)", color: "var(--text-primary)" }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {!mounted ? (
                <span key="placeholder" className="w-[18px] h-[18px] opacity-0" />
              ) : theme === "dark" ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Sun size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <Moon size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2, boxShadow: "var(--shadow-sm)" }}
            whileTap={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Link
              href="/verify"
              className="inline-flex items-center gap-1.5 bg-[var(--brand-blue)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors duration-150"
            >
              <span>New Verification</span>
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
              >
                <ArrowRight size={15} strokeWidth={2.5} />
              </motion.span>
            </Link>
          </motion.div>
        </div>

      </div>
    </motion.nav>
  );
}
