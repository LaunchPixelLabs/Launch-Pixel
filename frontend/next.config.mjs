/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
  },
  // Note: webpackBuildWorker, parallelServerBuildTraces, parallelServerCompiles
  // removed — they crash Cloudflare Pages builds (SWC binary missing for linux/x64)
  // Performance optimizations
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: true,
  // Optimize for static export
  trailingSlash: false,
}

export default nextConfig
