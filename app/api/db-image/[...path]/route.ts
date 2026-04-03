import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/db-image/[category]/[club]/[slug]/[filename]
 * Sirve imágenes locales desde DATA/DB_jerseys — solo para uso en desarrollo.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.join(process.cwd(), '..', 'DATA', 'DB_jerseys', ...segments)

  try {
    const data = await readFile(filePath)
    const ext = segments[segments.length - 1].split('.').pop()?.toLowerCase() ?? ''
    const mime: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png',  webp: 'image/webp',
    }
    return new NextResponse(data, {
      headers: {
        'Content-Type': mime[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
