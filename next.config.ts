import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Evita l'inferenza errata del workspace root in presenza di piu lockfile.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
