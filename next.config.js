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

    return config;
  },
  // Copy the templates directory to the build output
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./templates/**/*'],
    },
  },
};

module.exports = nextConfig;
