/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: { loader: "file-loader" },
    });
    return config;
  },
  turbopack: {},
};
export default nextConfig;
