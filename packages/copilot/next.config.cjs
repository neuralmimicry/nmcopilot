/** @type {import("next").NextConfig} */
const withTM = require("next-transpile-modules")(["common-utils"]);
const nextConfig = withTM({
  reactStrictMode: true,
  swcMinify: false,
});

// Dynamic import for ES modules
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const webpackConfig = {
  webpack: (config) => {
    if (!config.resolve.plugins) {
      config.resolve.plugins = [];
    }
    config.resolve.plugins.push(new TsconfigPathsPlugin());
    return config;
  },
};

// Combine and export the Next.js and Webpack configurations.
const combinedConfig = {
  ...nextConfig,
  ...webpackConfig,
};

export default combinedConfig;
