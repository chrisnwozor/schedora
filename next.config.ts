import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Creates a smaller production package for Docker and AWS.
  output: "standalone",
};

export default nextConfig;
