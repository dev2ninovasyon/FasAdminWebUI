/** @type {import('next').NextConfig} */

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
  reactStrictMode: false,
  distDir: "build",
  output: "standalone",
};

module.exports = nextConfig;
