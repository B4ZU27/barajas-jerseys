import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const BASE_DIR = path.resolve(process.cwd(), '..', 'DATA', 'DB_jerseys')

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params

  // Prevenir path traversal: resolver y verificar que sigue dentro de BASE_DIR
  const filePath = path.resolve(BASE_DIR, ...segments)
  if (!filePath.startsWith(BASE_DIR + path.sep) && filePath !== BASE_DIR) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ext = segments[segments.length - 1].split('.').pop()?.toLowerCase() ?? ''
  const mime: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
    mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
  }
  if (!mime[ext]) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const data = await readFile(filePath)
    return new NextResponse(data, {
      headers: {
        'Content-Type': mime[ext],
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
