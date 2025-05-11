/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('mjml');
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      html2canvas: 'html2canvas-pro',
    };

    return config;
  },
  // Copy the templates directory to the build output
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./templates/**/*'],
    },
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
      // Set timeout to 120 seconds (value is in milliseconds)
      responseTimeout: 120 * 1000,
    },
  },
};

module.exports = nextConfig;
