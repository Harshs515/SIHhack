import React from "react";

export default function AppLogo({
  size = 32,
  radius = 8,
  glow = true,
  alt = "TRINETRA",
}) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        objectFit: "cover",
        display: "block",
        flexShrink: 0,
        boxShadow: glow ? "0 0 14px rgba(0,229,255,0.35)" : "none",
      }}
    />
  );
}
