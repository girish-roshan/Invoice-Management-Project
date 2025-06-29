/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Explicitly expose environment variables to the browser
  env: {
    // Only expose non-sensitive environment variables to the browser
    APP_ENV: process.env.NODE_ENV || 'development',
  },
  // Enable server-side environment variables
  serverRuntimeConfig: {
    // Private config that is only available on the server side
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Enable both client and server environment variables
  publicRuntimeConfig: {
    // Config that is available on both server and client
    apiUrl: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api' 
      : 'https://yourdomain.com/api',
  },
}

module.exports = nextConfig
