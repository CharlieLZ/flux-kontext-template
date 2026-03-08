#!/usr/bin/env node

const { execSync } = require('child_process')

function parsePorts(args) {
  const values = args.flatMap((value) => value.split(','))
  const ports = []

  for (const value of values) {
    const trimmed = value.trim()
    if (!trimmed) {
      continue
    }

    if (trimmed.includes('-')) {
      const [startRaw, endRaw] = trimmed.split('-')
      const start = Number(startRaw)
      const end = Number(endRaw)

      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        throw new Error(`Invalid port range: ${trimmed}`)
      }

      for (let port = start; port <= end; port += 1) {
        ports.push(port)
      }
      continue
    }

    const port = Number(trimmed)
    if (!Number.isInteger(port)) {
      throw new Error(`Invalid port: ${trimmed}`)
    }
    ports.push(port)
  }

  return [...new Set(ports)]
}

function run(command) {
  return execSync(command, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim()
}

function getPidsForPort(port) {
  if (process.platform === 'win32') {
    const output = run(`netstat -ano | findstr :${port}`)
    return output
      .split('\n')
      .map((line) => line.trim().split(/\s+/).pop())
      .filter(Boolean)
  }

  const output = run(`lsof -ti tcp:${port}`)
  return output.split('\n').map((line) => line.trim()).filter(Boolean)
}

function killPid(pid) {
  if (process.platform === 'win32') {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
    return
  }

  execSync(`kill -9 ${pid}`, { stdio: 'ignore' })
}

function main() {
  const args = process.argv.slice(2)
  const ports = args.length > 0 ? parsePorts(args) : [3000]

  for (const port of ports) {
    let pids = []

    try {
      pids = getPidsForPort(port)
    } catch {
      continue
    }

    for (const pid of pids) {
      try {
        killPid(pid)
        console.log(`Killed process ${pid} on port ${port}`)
      } catch (error) {
        console.warn(`Failed to kill process ${pid} on port ${port}: ${error.message}`)
      }
    }
  }
}

main()
