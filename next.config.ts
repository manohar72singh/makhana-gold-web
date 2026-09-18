import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb", "@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

// Reload trigger: schema updated with isHotDeal and isBestSeller
export default nextConfig;

