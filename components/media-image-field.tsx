"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ImageIcon, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaAsset = {
  id: string;
  url: string;
  alt?: string | null;
  fileName: string;
};

export function MediaImageField({
  label,
  name,
  defaultValue = "",
  media = [],
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string;
  media?: MediaAsset[];
  required?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="grid gap-4">
      <label className="grid gap-3 text-sm font-bold text-ink">
        <div className="flex items-center gap-2">
          <LinkIcon size={14} className="text-primary" />
          {label}
        </div>
        <input
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required={required}
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
          placeholder="/uploads/example.webp or https://example.com/image.jpg"
        />
      </label>

      {media.length ? (
        <details className="group rounded-[2rem] border border-black/5 bg-white p-2 shadow-soft transition-all open:shadow-premium">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 outline-none">
            <span className="flex items-center gap-2 text-sm font-bold text-ink group-open:text-primary transition-colors">
              <ImageIcon size={16} /> Choose from media library
            </span>
            <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-6 pt-0">
            <div className="grid max-h-[400px] gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-4">
              {media.map((asset) => {
                const selected = value === asset.url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setValue(asset.url)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl border transition-all",
                      selected ? "border-primary ring-4 ring-primary/10 shadow-lg" : "border-slate-100 hover:border-primary/50"
                    )}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                      <Image src={asset.url} alt={asset.alt ?? asset.fileName} fill className="object-cover transition duration-700 group-hover:scale-110" />
                      {selected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="block truncate text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {asset.fileName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </details>
      ) : (
        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex items-center gap-3">
           <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-800 text-xs font-bold">!</div>
           <p className="text-xs font-bold text-amber-800">Media library is empty. Upload images first or paste a URL.</p>
        </div>
      )}
    </div>
  );
}
