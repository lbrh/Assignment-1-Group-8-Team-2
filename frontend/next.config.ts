import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Hides the dev-only route indicator badge (bottom-left "N"). Compile/runtime errors
  // still surface normally.
  devIndicators: false,
};

export default nextConfig;
