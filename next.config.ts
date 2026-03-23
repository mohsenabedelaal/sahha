import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  allowedDevOrigins: ["192.168.0.*", "localhost"],
};

export default withSerwist(nextConfig);
