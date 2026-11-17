import net from 'node:net'

// The browser must reach the API as http://localhost:<port>: the refresh
// cookie is Secure + SameSite=None, which Chromium only accepts over plain
// http on localhost, and CORS is configured for http://localhost:8080. When
// the tests run in a container next to the backend, LIVE_API_PROXY_TARGET
// (e.g. "app:8000") forwards that local port to the backend service.
export default async function globalSetup () {
  const target = process.env.LIVE_API_PROXY_TARGET
  if (!target) return
  const [host, port] = target.split(':')
  const listenPort = Number(new URL(process.env.LIVE_API_URL || 'http://localhost:8001').port)

  const server = net.createServer(client => {
    const upstream = net.connect(Number(port), host)
    client.pipe(upstream).pipe(client)
    const close = () => { client.destroy(); upstream.destroy() }
    client.on('error', close)
    upstream.on('error', close)
  })
  await new Promise(resolve => server.listen(listenPort, '127.0.0.1', resolve))
  return () => new Promise(resolve => server.close(resolve))
}
