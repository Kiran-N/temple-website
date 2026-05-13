/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Let Node.js load undici natively instead of bundling it through webpack
      // (undici uses private class fields that webpack can't parse)
      const prev = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [...prev, /^undici(\/.*)?$/];
    } else {
      // Browser has native fetch — exclude undici entirely from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig
