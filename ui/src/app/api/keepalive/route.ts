import { NextResponse } from 'next/server'

// Vercel Cron: her 10 dakikada Railway backend'i uyandırır
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? ''

  if (!backendUrl) {
    return NextResponse.json({ error: 'API_URL not set' }, { status: 500 })
  }

  try {
    const start = Date.now()
    const res = await fetch(`${backendUrl}/actuator/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000), // 10 sn timeout
    })
    const ms = Date.now() - start
    const status = res.ok ? 'ok' : 'degraded'
    return NextResponse.json({ status, ms, backend: backendUrl }, { status: 200 })
  } catch {
    return NextResponse.json({ status: 'unreachable', backend: backendUrl }, { status: 200 })
  }
}
