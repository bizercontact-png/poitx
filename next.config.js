/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========== بهینه‌سازی تصاویر ==========
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // ========== کامپایلر SWC ==========
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    emotion: false,
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // ========== بهینه‌سازی باندل ==========
  webpack: (config, { dev, isServer }) => {
    // بهینه‌سازی برای production
    if (!dev && !isServer) {
      // Split chunks
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
          },
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|react-markdown)[\\/]/,
            name: 'ui',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },

  // ========== کامپوننت‌های پویا ==========
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
  },

  // ========== هدرهای امنیتی ==========
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // ========== ری‌رایت برای API ==========
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // ========== ریدایرکت‌ها ==========
  async redirects() {
    return [
      {
        source: '/',
        destination: '/j369',
        permanent: true,
      },
    ]
  },

  // ========== تنظیمات پیشرفته ==========
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  optimizeCss: true,
  staticPageGenerationTimeout: 120,
}

module.exports = nextConfig
