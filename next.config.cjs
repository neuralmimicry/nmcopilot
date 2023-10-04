/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
}

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const webpackConfig = {
  webpack: (config) => {
    if (config.resolve.plugins) {
      config.resolve.plugins.push(new TsconfigPathsPlugin());
    } else {
      config.resolve.plugins = [new TsconfigPathsPlugin()];
    }

    return config;
  },
};

(module.exports = nextConfig), webpackConfig;
