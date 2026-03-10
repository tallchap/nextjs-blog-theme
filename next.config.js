const { execSync } = require('child_process')

let commitHash = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  : 'unknown'

if (commitHash === 'unknown') {
  try {
    commitHash = execSync('git rev-parse --short HEAD').toString().trim()
  } catch {}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_COMMIT_HASH: commitHash,
  },
}

module.exports = nextConfig
