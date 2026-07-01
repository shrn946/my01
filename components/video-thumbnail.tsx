"use client";

import Image from "next/image";
import { useState } from "react";

export function VideoThumbnail({ videoId, alt }: { videoId: string; alt: string }) {
  // Use a local placeholder fallback if the ID is a placeholder/slug or if the image fails to load
  const isPlaceholder = videoId.includes("-") || videoId.length !== 11;
  const [imgSrc, setImgSrc] = useState(
    isPlaceholder
      ? "/video-placeholder.jpg"
      : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );

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
