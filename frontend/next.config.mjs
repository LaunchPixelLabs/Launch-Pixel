/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Static export only for production build (Cloudflare Pages)
  ...(isProd && { output: 'export' }),

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    unoptimized: true,
    formats: ['image/webp'],
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
};

export default nextConfig;
