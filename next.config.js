// Netlify, Next.js ciktisini .next klasorunde bekler. IIS/standalone dagitimi icin
// mevcut build + standalone davranisi korunur.
const isNetlifyBuild = process.env.NETLIFY_BUILD === "true";

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
  reactStrictMode: true,
  ...(isNetlifyBuild ? {} : { distDir: "build", output: "standalone" }),
  compress: true,
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;
