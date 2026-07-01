"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export function VideoThumbnail({ videoId, alt }: { videoId: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);

  // Keep state in sync with videoId prop changes during client-side rendering/pagination
  useEffect(() => {
    setImgSrc(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
  }, [videoId]);

  return (
    <Image 
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => {
        if (imgSrc.includes("maxresdefault")) {
          setImgSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
        }
      }}
    />
  );
}
