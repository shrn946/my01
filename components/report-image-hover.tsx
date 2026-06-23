"use client";

import { motion } from "framer-motion";

export function ReportImageHover({ image, label }: { image: string, label: string }) {
  return (
    <div className="w-full aspect-[16/10] rounded-xl border border-white/10 shadow-2xl bg-slate-900 overflow-hidden group flex flex-col relative ring-1 ring-white/5">
      {/* Browser Header */}
      <div className="h-8 bg-slate-800/80 border-b border-white/5 flex items-center px-4 shrink-0 backdrop-blur-md relative z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
      </div>
      
      {/* Image Container */}
      <motion.div 
        className="flex-1 relative overflow-hidden bg-slate-950"
        whileHover="hover"
      >
        {image ? (
          <>
            <motion.div
              className="absolute inset-0 w-full h-full bg-no-repeat bg-top"
              style={{ 
                backgroundImage: `url('${image}')`,
                backgroundSize: "100% auto"
              }}
              variants={{
                hover: { backgroundPosition: "50% 100%" }
              }}
              initial={{ backgroundPosition: "50% 0%" }}
              transition={{ duration: 6, ease: "linear" }}
            />
            {/* Scroll Bar Track */}
            <div className="absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-slate-800/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden z-20">
                <motion.div
                    className="w-full bg-blue-500 rounded-full"
                    variants={{
                        hover: { height: "25%", y: ["0%", "300%"] }
                    }}
                    transition={{ duration: 6, ease: "linear" }}
                />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm font-medium">
            No {label} image
          </div>
        )}
      </motion.div>
    </div>
  );
}
