"use client";

import { motion } from "framer-motion";

export function ScrollableImage({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div 
      className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden bg-slate-900 group"
      whileHover="hover"
    >
      <div className="relative w-full h-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-full"
          style={{ height: "100%" }} 
          variants={{ hover: { y: "-100%" } }}
          initial={{ y: 0 }}
          transition={{ duration: 2.5, ease: "linear" }}
        >
          <img src={src} alt={alt} className="w-full object-cover object-top" />
        </motion.div>
      </div>
      
      {/* Scroll Bar Track */}
      <div className="absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-slate-700/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden">
          <motion.div
              className="w-full bg-primary rounded-full"
              variants={{
                  hover: { height: "20%", y: ["0%", "400%"] }
              }}
              transition={{ duration: 2.5, ease: "linear" }}
          />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
}
