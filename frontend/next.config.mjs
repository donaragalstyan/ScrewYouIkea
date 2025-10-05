/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker and canvas issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      }
    }
    
    // Prevent PDF.js from being bundled on the server side
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('pdfjs-dist')
    }
    
    return config
  },
}

export default nextConfig
