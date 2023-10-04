const path = require("path");

module.exports = {
  entry: "./src/index.tsx", // Entry point of your package
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"), // Output directory
    libraryTarget: "umd", // Enable Universal Module Definition
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"], // File extensions to resolve
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Apply loader to .ts and .tsx files
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.module\.css$/, // Apply loader to CSS module files
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
    ],
  },
};
