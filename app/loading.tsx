"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex items-center gap-3 text-xl font-black tracking-tight text-ink"
      >
        <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-primary text-white">H</span>
        <span className="opacity-50">Loading...</span>
      </motion.div>
    </div>
  );
}
