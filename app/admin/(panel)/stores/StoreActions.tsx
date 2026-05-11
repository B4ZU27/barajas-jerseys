'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StoreActions({ storeId, storeName }: { storeId: string; storeName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading]       = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await fetch('/api/admin/delete-store', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    })
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-500">¿Seguro? Esto borra la tienda y el acceso del owner.</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[10px] font-bold uppercase text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {loading ? 'Borrando…' : 'Confirmar'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[10px] text-gray-400 hover:text-black"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-[10px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors"
    >
      Eliminar
    </button>
  )
}
