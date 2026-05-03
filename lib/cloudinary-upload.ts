/**
 * Sube un archivo directo a Cloudinary usando upload firmado.
 * El secreto nunca sale del servidor — solo firma en /api/admin/cloudinary-signature.
 */
export async function uploadFile(file: File): Promise<string> {
  // 1. Pedir firma al servidor — el servidor define folder y parámetros
  const sigRes = await fetch('/api/admin/cloudinary-signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!sigRes.ok) throw new Error('Error obteniendo firma de Cloudinary')
  const { signature, timestamp, folder, apiKey, cloudName } = await sigRes.json()

  // 2. Subir directo a Cloudinary (browser → Cloudinary)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('timestamp', String(timestamp))
  fd.append('folder', folder)
  fd.append('signature', signature)
  fd.append('api_key', apiKey)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: fd }
  )
  if (!uploadRes.ok) {
    const err = await uploadRes.json()
    throw new Error(err.error?.message ?? 'Error subiendo archivo a Cloudinary')
  }

  const data = await uploadRes.json()
  return data.secure_url as string
}

/**
 * Sube múltiples archivos con callback de progreso.
 * onProgress(done, total) se llama después de cada archivo subido.
 */
export async function uploadFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<string[]> {
  const urls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const url = await uploadFile(files[i])
    urls.push(url)
    onProgress?.(i + 1, files.length)
  }
  return urls
}
