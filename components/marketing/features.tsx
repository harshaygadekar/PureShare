/**
 * Features Grid Component
 * Bento-style grid with 3D tilt effects and smooth animations
 * Think Linear's feature showcase
 */

'use client';

import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { FiLock, FiZap, FiClock, FiShield, FiLink, FiEye } from 'react-icons/fi';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const features = [
  {
    icon: FiLock,
    title: 'End-to-End Encryption',
    description: 'Your files are encrypted before upload. Only recipients with the link can access them.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: FiZap,
    title: 'Lightning Fast',
    description: 'Optimized infrastructure ensures rapid uploads and downloads, no matter the file size.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
  },
  {
    icon: FiClock,
    title: 'Auto-Expiring Links',
    description: 'Set custom expiration times. Links automatically become invalid after the time period.',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: FiShield,
    title: 'Password Protection',
    description: 'Add an extra layer of security with optional password protection for sensitive files.',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: FiLink,
    title: 'Simple Sharing',
    description: 'Generate a shareable link instantly. No accounts, no complexity, just share and go.',
    gradient: 'from-indigo-500/20 to-blue-500/20',
  },
  {
    icon: FiEye,
    title: 'Track Analytics',
    description: 'Monitor who accessed your files, when, and from where with detailed analytics.',
    gradient: 'from-red-500/20 to-pink-500/20',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  // Cleanup motion values on unmount
  useEffect(() => {
    return () => {
      x.set(0);
      y.set(0);
    };
  }, [x, y]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return; // Don't animate if reduced motion preferred

    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={prefersReducedMotion ? {} : {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative rounded-xl glass-card p-8 transition-all duration-300 hover:shadow-2xl"
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300`}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Content */}
      <div className="relative" style={{ transform: "translateZ(50px)" }}>
        {/* Icon with glow effect */}
        <motion.div
          className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl glass-subtle shadow-soft relative"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-accent/20 blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <feature.icon className="relative h-7 w-7 text-accent" />
        </motion.div>

        <h3 className="mb-3 text-xl font-semibold text-white">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/70">
          {feature.description}
        </p>
      </div>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
}

export function Features() {
  return (
    <Section id="features" className="relative">
      <Container>
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything you need
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Built with security and simplicity in mind. Share files without compromising on privacy or convenience.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: "1000px" }}>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
