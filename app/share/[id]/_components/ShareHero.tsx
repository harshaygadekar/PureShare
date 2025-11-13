/**
 * Share Hero Component
 * Revolutionary header with animated orbs and stats
 * Matches the aesthetic of the landing page Hero
 */

'use client';

import { motion, type Variants } from 'framer-motion';
import { FiFile, FiHardDrive, FiClock } from 'react-icons/fi';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { formatBytes } from '@/lib/downloads/client-download';

interface ShareHeroProps {
  fileCount: number;
  totalSize: number;
  expiresAt: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diff = expires.getTime() - now.getTime();

  if (diff < 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function ShareHero({ fileCount, totalSize, expiresAt }: ShareHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-12 pt-24">
      {/* Animated background orbs (matching Hero component) */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[120px]"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
        <motion.div
          className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [-40, -20, -40],
                  y: [0, 20, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
        <motion.div
          className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[100px]"
          animate={
            prefersReducedMotion
              ? {}
              : {
                  x: [40, 20, 40],
                  y: [0, -20, 0],
                }
          }
          transition={
            prefersReducedMotion
              ? {}
              : {
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }
          }
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative mx-auto max-w-6xl px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="mb-4 text-center text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Shared Files
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-12 text-center text-lg text-secondary sm:text-xl"
        >
          Download individual files or get everything at once
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8"
        >
          {/* File Count */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-6 py-4 shadow-soft backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FiFile className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{fileCount}</div>
              <div className="text-sm text-secondary">{fileCount === 1 ? 'File' : 'Files'}</div>
            </div>
          </div>

          {/* Total Size */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-6 py-4 shadow-soft backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FiHardDrive className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{formatBytes(totalSize)}</div>
              <div className="text-sm text-secondary">Total Size</div>
            </div>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-6 py-4 shadow-soft backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-medium">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FiClock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{formatTimeRemaining(expiresAt)}</div>
              <div className="text-sm text-secondary">Remaining</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
