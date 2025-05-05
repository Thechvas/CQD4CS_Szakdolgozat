"use client";

import Image from "next/image";

export default function ImageWrapper({
  src,
  alt,
  width,
  height,
  className = "",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={`${width}px`}
        placeholder="blur"
        blurDataURL="/placeholder-image.jpg"
      />
    </div>
  );
}
