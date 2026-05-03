import { v2 as cloudinary } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'dsdg9rgi3',
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const { requireAuth } = await import('@/lib/api-auth')
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  // El servidor define los parámetros — el cliente no puede alterarlos
  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = {
    timestamp,
    folder:          'jerseys',
    allowed_formats: 'jpg,jpeg,png,webp,gif,mp4,mov,webm',
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    folder:    paramsToSign.folder,
    apiKey:    process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? 'dsdg9rgi3',
  })
}
