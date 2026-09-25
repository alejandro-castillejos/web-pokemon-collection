"use client";

import { useEffect, useState } from "react";

interface CardImageProps {
  src?: string;
  alt: string;
  name: string;
  number: string;
  quality?: "low" | "high";
  className?: string;
}

export default function CardImage({
  src,
  alt,
  name,
  number,
  quality = "low",
  className = "",
}: CardImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const imageUrl = src
    ? `${src}/${quality}.webp`
    : null;

  if (!imageUrl || hasError) {
    return (
      <div
        className={`flex aspect-[2.5/3.5] items-center justify-center bg-gradient-to-br from-zinc-100 via-white to-zinc-200 ${className}`}
      >
        <div className="px-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            Pokémon TCG
          </p>

          <p className="mt-2 text-lg font-bold text-zinc-700">
            {name}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            #{number}
          </p>

          <p className="mt-3 text-[10px] text-zinc-400">
            Imagen no disponible
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading={quality === "low" ? "lazy" : "eager"}
      onError={() => setHasError(true)}
    />
  );
}