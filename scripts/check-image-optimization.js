#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

async function main() {
  let sharp
  try {
    sharp = require('sharp')
  } catch (error) {
    console.error('sharp is not available:', error instanceof Error ? error.message : error)
    process.exit(1)
  }

  const packageJsonPath = path.join(__dirname, '..', 'node_modules', 'sharp', 'package.json')
  const version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version
  const [major, minor] = version.split('.').map(Number)
  if (major === 0 && minor < 35) {
    console.error(`sharp ${version} is below the required 0.35.x security line`)
    process.exit(1)
  }

  const input = path.join(__dirname, '..', 'public', 'logo.png')
  if (!fs.existsSync(input)) {
    console.error('missing public/logo.png for the image optimization smoke test')
    process.exit(1)
  }

  const output = await sharp(input).resize(64, 64, { fit: 'inside' }).png().toBuffer()
  if (output.length < 32) {
    console.error('image optimization produced an empty buffer')
    process.exit(1)
  }

  console.log(`sharp ${version} ok; resized logo.png to ${output.length} bytes`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
