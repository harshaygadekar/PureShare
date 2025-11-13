/**
 * File Grid Component
 * Responsive grid with stagger animations
 */

'use client';

import { motion } from 'framer-motion';
import { FileCard } from './FileCard';
import type { FileMetadata } from '@/types/api';

interface FileGridProps {
  files: FileMetadata[];
  shareId: string;
  onPreview?: (file: FileMetadata) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function FileGrid({ files, shareId, onPreview }: FileGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {files.map((file) => (
        <FileCard key={file.id} file={file} shareId={shareId} onPreview={onPreview} />
      ))}
    </motion.div>
  );
}
