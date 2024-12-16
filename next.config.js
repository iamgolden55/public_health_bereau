// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better development practices
  reactStrictMode: true,

  // Enable experimental features we need for modern web APIs
  experimental: {
    // Enable server actions for form handling and API routes
    serverActions: true,
    // Enable modern image optimization
    optimizeImages: true,
    // Enable modern CSS features
    modernBuild: true
  },

  // Configure image domains for avatar hosting and medical images
  images: {
    domains: [
      'localhost',
      '127.0.0.1',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Configure webpack for optimal bundling
  webpack: (config, { dev, isServer }) => {
    // Add SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    // Optimize packages in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;