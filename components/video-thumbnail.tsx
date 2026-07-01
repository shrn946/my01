"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export function VideoThumbnail({ videoId, alt }: { videoId: string; alt: string }) {
  const isPlaceholder = !videoId || videoId.includes("-") || videoId.length !== 11;
  const [imgSrc, setImgSrc] = useState("/video-placeholder.jpg");

  // Keep state in sync with videoId prop changes during client-side rendering/pagination
  useEffect(() => {
    if (isPlaceholder) {
      setImgSrc("/video-placeholder.jpg");
    } else {
      setImgSrc(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
    }
  }, [videoId, isPlaceholder]);

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
        } else {
          setImgSrc("/video-placeholder.jpg");
        }
      }}
    />
  );
}
