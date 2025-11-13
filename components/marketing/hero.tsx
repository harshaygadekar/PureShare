/**
 * Hero Section
 * Revolutionary design with Framer Motion animations
 * Think Vision Pro meets Linear
 */

'use client';

import Link from 'next/link';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Container } from '@/components/layout/container';
import { FiArrowRight, FiLock, FiZap, FiShield } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* Animated background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[120px]"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]"
          animate={prefersReducedMotion ? {} : {
            x: [-40, -20, -40],
            y: [0, 20, 0],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]"
          animate={prefersReducedMotion ? {} : {
            x: [40, 20, 40],
            y: [0, -20, 0],
          }}
          transition={prefersReducedMotion ? {} : {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <Container>
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm text-secondary shadow-soft backdrop-blur-md"
              whileHover={{ scale: 1.05, borderColor: "var(--accent)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={prefersReducedMotion ? {} : { rotate: [0, 360] }}
                transition={prefersReducedMotion ? {} : { duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <FiZap className="h-4 w-4 text-accent" />
              </motion.div>
              <span>Secure. Fast. Simple.</span>
            </motion.div>
          </motion.div>

          {/* Headline with gradient animation */}
          <motion.h1
            variants={itemVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 text-6xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-[80px]"
          >
            Share files securely
            <br />
            <span className="bg-gradient-to-r from-accent via-accent to-accent bg-clip-text text-transparent animate-gradient">
              without the hassle
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mx-auto mb-10 max-w-2xl text-lg text-secondary sm:text-xl leading-relaxed"
          >
            Upload, share, and track your files with military-grade encryption.
            No signup required. Links expire automatically. Your privacy is guaranteed.
          </motion.p>

          {/* CTA Buttons with enhanced hover */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LiquidButton
                asChild
                size="lg"
                className="group relative h-12 px-8 text-base shadow-medium transition-all hover:shadow-strong overflow-hidden"
              >
                <Link href="/upload">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-accent/0 via-white/10 to-accent/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="relative z-10">Start Sharing</span>
                  <FiArrowRight className="relative z-10 ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </LiquidButton>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <LiquidButton
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base shadow-soft transition-all hover:bg-surface hover:shadow-medium"
              >
                <Link href="#features">See How It Works</Link>
              </LiquidButton>
            </motion.div>
          </motion.div>

          {/* Trust Indicators with stagger animation */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-tertiary"
          >
            {[
              { icon: FiLock, text: "End-to-end encrypted" },
              { icon: FiShield, text: "Zero knowledge" },
              { icon: FiZap, text: "Auto-expiring links" },
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, color: "var(--accent)" }}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
