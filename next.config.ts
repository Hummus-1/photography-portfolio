import type { NextConfig } from "next";

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
let r2Hostname = "";
if (r2PublicUrl) {
  try {
    const urlString = r2PublicUrl.startsWith("http") ? r2PublicUrl : `https://${r2PublicUrl}`;
    const url = new URL(urlString);
    r2Hostname = url.hostname;
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_R2_PUBLIC_URL configuration:", e);
  }
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@img/sharp-linux-x64", "@img/sharp-libvips-linux-x64"],
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/@img/**/*", "./node_modules/sharp/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
