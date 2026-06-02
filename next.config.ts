import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Evita l'inferenza errata del workspace root in presenza di piu lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
  async redirects() {
    return [
      { source: "/soci", destination: "/tesserati", permanent: true },
      { source: "/soci/:path*", destination: "/tesserati/:path*", permanent: true },
      { source: "/membri", destination: "/operatori-partner", permanent: true },
      {
        source: "/membri/:path*",
        destination: "/operatori-partner/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
