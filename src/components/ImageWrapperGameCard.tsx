"use client";

import Image from "next/image";

interface ImageWrapperProps {
  src: string;
  alt: string;
}

export default function ImageWrapper({ src, alt }: ImageWrapperProps) {
  return (
    <div className="relative w-full aspect-[2/3]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-t-2xl"
        sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 192px"
        placeholder="blur"
        blurDataURL="/placeholder-image.jpg"
      />
    </div>
  );
}
