"use client";

import Image from "next/image";
import { useState } from "react";

interface CardImageProps {
  src?: string;
  alt: string;
  name: string;
  number: string;
  quality?: "low" | "high";
  priority?: boolean;
  className?: string;
}

export default function CardImage({
  src,
  alt,
  name,
  number,
  quality = "low",
  priority = false,
  className = "",
}: CardImageProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const imageUrl = src ? `${src}/${quality}.webp` : null;
  const hasError = imageUrl !== null && failedImageUrl === imageUrl;

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex aspect-[2.5/3.5] items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-zinc-200 ${className}`}
      >
        <div className="px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Pokémon TCG
          </p>

          <p className="mt-2 text-lg font-bold text-zinc-700">{name}</p>

          <p className="mt-1 text-xs text-zinc-400">#{number}</p>

          <p className="mt-3 text-[10px] text-zinc-400">
            Imagen no disponible
          </p>
        </div>
      </div>
    );
  }

  const isDetailImage = quality === "high";

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={isDetailImage ? 734 : 250}
      height={isDetailImage ? 1024 : 350}
      sizes={
        isDetailImage
          ? "(max-width: 1024px) 90vw, 45vw"
          : "(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 220px"
      }
      quality={90}
      className={className}
      loading={isDetailImage || priority ? "eager" : "lazy"}
      fetchPriority={isDetailImage || priority ? "high" : "auto"}
      onError={() => setFailedImageUrl(imageUrl)}
    />
  );
}
