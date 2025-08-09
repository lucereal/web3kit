import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double initialization in dev
  transpilePackages: ["@rainbow-me/rainbowkit"],
};

export default nextConfig;
