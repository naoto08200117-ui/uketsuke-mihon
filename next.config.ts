import type { NextConfig } from "next";

// GitHub Pages（静的書き出し）用の設定。T01 で1回だけ作り、以後は変えない
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/uketsuke-mihon",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
