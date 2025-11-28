import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        unoptimized: true, // Required for static export on GitHub Pages
    },
    assetPrefix: isProd ? '/OleMap/' : '',
    basePath: isProd ? '/OleMap' : '',
    output: 'export',
};

export default nextConfig;
