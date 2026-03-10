const { execSync } = require('child_process')

let commitHash = 'unknown'
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
}

module.exports = nextConfig
