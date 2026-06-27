"use client";



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
      <div 
        className="flex-1 relative overflow-hidden bg-slate-950"
      >
        {image ? (
          <>
            <div
              className="absolute inset-0 w-full h-full bg-no-repeat bg-top cover-image-scroll print-cover-image"
              style={{ 
                backgroundImage: `url('${image}')`,
                backgroundSize: "100% auto"
              }}
            />
            {/* Scroll Bar Track */}
            <div className="absolute right-1 top-2 bottom-2 w-1.5 rounded-full bg-slate-800/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 overflow-hidden z-20">
                <div className="w-full h-1/4 bg-blue-500 rounded-full scrollbar-thumb" />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm font-medium">
            No {label} image
          </div>
        )}
      </div>
    </div>
  );
}
