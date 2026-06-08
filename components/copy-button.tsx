"use client";

export function CopyButton({ text }: { text: string }) {
  return (
    <button 
      onClick={() => navigator.clipboard.writeText(text)} 
      className="text-[10px] font-black text-primary hover:underline"
    >
      COPY
    </button>
  );
}
