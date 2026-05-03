'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos de inactividad

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']

export default function AutoSignOut() {
  const router  = useRouter()
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/admin/login')
        router.refresh()
      }, TIMEOUT_MS)
    }

    // Arrancar el timer y resetear en cada evento de actividad
    reset()
    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }))

    return () => {
      if (timer.current) clearTimeout(timer.current)
      EVENTS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [router])

  return null
}
