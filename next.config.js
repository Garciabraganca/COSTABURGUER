const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    // Permite uploads maiores (ex.: fotos enviadas de iOS/Android)
    bodyParser: {
      sizeLimit: '15mb',
    },
    responseLimit: '15mb',
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
