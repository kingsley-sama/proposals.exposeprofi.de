/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Allow serving static HTML files
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/config.js',
        destination: '/api/config-js',
      },
    ];
  },
  
  // API configuration
  serverRuntimeConfig: {
    // Will only be available on the server side
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  },
  
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  },
  
  // Configure webpack for handling various file types
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Output configuration for Vercel
  output: 'standalone',
};

module.exports = nextConfig;
