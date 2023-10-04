import babel from "@rollup/plugin-babel";
import eslint from "@rollup/plugin-eslint";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import image from "@rollup/plugin-image";
import url from "@rollup/plugin-url";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";

const isProd = process.env.NODE_ENV === "production";

const config = {
  input: "src/pages/api/chat.ts",
  output: {
    dir: "dist",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    // 1. Linting
    eslint({
      exclude: ["styles/**"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      fix: true,
    }),

    // 2. TypeScript and Transpiling
    typescript(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
    }),

    // 3. PostCSS
    postcss({
      modules: true,
      extract: "bundle.css",
    }),

    // 4. JSON, Image, and URL processing
    json(),
    image(),
    url(),

    // 5. Resolve and CommonJS
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),

    // 6. Environment and Other Replacements
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    }),

    // 7. Production-only Plugins
    isProd && terser(),
  ],
};

export default config;
