const path = require('path');

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable Turbopack (default in Next.js 16)
  turbopack: {},

  experimental: {
    // Enable React Server Components
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Enable optimized package imports
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'd3',
      'framer-motion'
    ]
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  generateEtags: true,
  // Split chunks optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework chunk
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // UI components chunk
          ui: {
            name: 'ui',
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // Visualization libraries chunk
          viz: {
            name: 'viz',
            test: /[\\/]node_modules[\\/](d3|three|react-force-graph-3d)[\\/]/,
            priority: 25,
            reuseExistingChunk: true,
          },
          // Editor chunk
          editor: {
            name: 'editor',
            test: /[\\/]node_modules[\\/](@monaco-editor|monaco-editor)[\\/]/,
            priority: 20,
            reuseExistingChunk: true,
          },
          // Common chunk
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Enable new image optimization
    unoptimized: false,
    // Modern image formats
    formats: ['image/avif', 'image/webp'],
    // Production optimization
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  // Add performance optimisations
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
