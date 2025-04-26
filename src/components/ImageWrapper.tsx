"use client";

import Image from "next/image";

interface ImageWrapperProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export default function ImageWrapper({
  src,
  alt,
  width,
  height,
}: ImageWrapperProps) {
  return (
    <div className="relative" style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-md"
        sizes={`${width}px`}
        placeholder="blur"
        blurDataURL="/placeholder-image.jpg"
      />
    </div>
  );
}
