"use client";
import Image from "next/image";
import React from "react";

const Logo: React.FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className = "", width = 160, height = 56 }) => {
  return (
    <div className={"flex items-center " + className}>
      <Image
        src="/logo-dark-nobg.png"
        alt="The Memory Box"
        width={width}
        height={height}
        priority
      />
    </div>
  );
};

export default Logo;
