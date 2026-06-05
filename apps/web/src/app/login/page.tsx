"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === "admin@verisphere.ai" && password === "password") {
      localStorage.setItem("verisphere_api_key", "demo-api-key-1234");
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Use admin@verisphere.ai / password");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--brand-blue)] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-16 h-16 bg-[var(--brand-blue)] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
          >
            <ShieldCheck className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Welcome to VeriSphere</h1>
          <p className="text-[var(--text-secondary)] mt-2">Secure identity & credential verification.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lg)] relative backdrop-blur-sm"
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-[var(--text-tertiary)] w-5 h-5" />
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocusedEmail(true)}
                  onBlur={() => setIsFocusedEmail(false)}
                  animate={{
                    boxShadow: isFocusedEmail ? "0 0 0 3px rgba(37,99,235,0.12), inset 0 0 0 1px var(--brand-blue)" : "none",
                    borderColor: isFocusedEmail ? "var(--brand-blue)" : "var(--border)",
                  }}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="admin@verisphere.ai"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-[var(--text-tertiary)] w-5 h-5" />
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocusedPassword(true)}
                  onBlur={() => setIsFocusedPassword(false)}
                  animate={{
                    boxShadow: isFocusedPassword ? "0 0 0 3px rgba(37,99,235,0.12), inset 0 0 0 1px var(--brand-blue)" : "none",
                    borderColor: isFocusedPassword ? "var(--brand-blue)" : "var(--border)",
                  }}
                  className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-primary)] outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-[var(--warning)] text-sm font-medium text-center"
              >
                {error}
              </motion.p>
            )}

            <div className="pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-[var(--brand-blue)] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                Sign In <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              Use <span className="font-mono text-[var(--text-secondary)]">admin@verisphere.ai</span> and <span className="font-mono text-[var(--text-secondary)]">password</span> to access the demo.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
