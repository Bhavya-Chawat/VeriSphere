/**
 * @file layout.tsx
 * @package apps/web
 * @purpose Defines the root HTML shell, embeds Outfit modern Google Font, and sets global metadata.
 * @dependencies react, next/font, clsx
 * @security Ensure meta policies (e.g. Content-Security-Policy tags) are appended to headers in production.
 * @future_implementation Wrap children in TanStack Query Client Provider and Clerk Auth Provider wrappers.
 */

import React from "react";
import type { Metadata } from "next";
import "./globals.css"; // Imported for global styling reset

export const metadata: Metadata = {
  title: "VeriSphere | AI-Powered Skill & Profile Verification",
  description: "Verify candidate portfolios, github timelines, and academic credentials using forensic metadata analysis and Gemini 1.5 Flash.",
  keywords: ["AI recruitment", "candidate check", "github audit", "credentials forensics", "anti-plagiarism"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://verisphere.ai",
    title: "VeriSphere | AI Profile Verification",
    description: "Verify PDF modifications and Github timeline anomalies to source verified talent."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex flex-col justify-between">
        {/* Header Navigation Placeholder */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                VeriSphere
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <a href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</a>
              <a href="/candidates/verify" className="hover:text-emerald-400 transition-colors">New Verification</a>
              <a href="/history" className="hover:text-emerald-400 transition-colors">History</a>
              <a href="/settings" className="hover:text-emerald-400 transition-colors">Settings</a>
            </nav>
            <div className="flex items-center gap-4">
              {/* Clerk Sign-in/Sign-out placeholder */}
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xs font-bold text-emerald-400">
                VS
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VeriSphere. All rights reserved. Proof-of-concept AI Scaffolding.</p>
        </footer>
      </body>
    </html>
  );
}
