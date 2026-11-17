// Minimal Docker Engine API client over the unix socket (no docker CLI in
// the Playwright image): run a command in a container, read its logs. Used
// to read DEBUG-logged emails, reset rate limits in Redis, and put the
// database in states the UI can't (e.g. an unpaid order).
import http from 'node:http'

const SOCKET = process.env.DOCKER_SOCKET || '/var/run/docker.sock'

function call (method, path, body) {
  return new Promise((resolve, reject) => {
    const req = http.request({ socketPath: SOCKET, method, path, headers: { 'content-type': 'application/json' } }, res => {
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => {
        const buffer = Buffer.concat(chunks)
        if (res.statusCode >= 400) reject(new Error(`docker ${method} ${path}: ${res.statusCode} ${buffer.toString()}`))
        else resolve(buffer)
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

// Non-TTY output is multiplexed: 8-byte frame headers (stream, 0, 0, 0, size).
function demux (buffer) {
  let out = ''
  let offset = 0
  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32BE(offset + 4)
    out += buffer.subarray(offset + 8, offset + 8 + size).toString()
    offset += 8 + size
  }
  return out
}

export async function exec (container, cmd) {
  const created = JSON.parse((await call('POST', `/containers/${container}/exec`, { Cmd: cmd, AttachStdout: true, AttachStderr: true })).toString())
  const output = demux(await call('POST', `/exec/${created.Id}/start`, { Detach: false, Tty: false }))
  const info = JSON.parse((await call('GET', `/exec/${created.Id}/json`)).toString())
  if (info.ExitCode !== 0) throw new Error(`exec in ${container} exited ${info.ExitCode}: ${output}`)
  return output
}

export async function logs (container, { sinceSeconds = 600 } = {}) {
  const since = Math.floor(Date.now() / 1000) - sinceSeconds
  return demux(await call('GET', `/containers/${container}/logs?stdout=1&stderr=1&since=${since}`))
}
