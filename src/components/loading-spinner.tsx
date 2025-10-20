'use client';

import { useLoading } from '@/context/loading-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from 'lucide-react';

export function LoadingSpinner() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
