/** @type {import(''next'').NextConfig} */

const nextConfig = {
  transpilePackages: [
    "@mui/material",
    "@mui/system",
    "@mui/icons-material",
    "@tabler/icons-react",
  ],
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@tabler/icons-react",
    ],
  },
  reactStrictMode: true,
  distDir: "build",
  output: "standalone",
  compress: true,
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;