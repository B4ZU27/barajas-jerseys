'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function StoreLinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const url = origin ? `${origin}/${slug}` : `/${slug}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="border border-gray-200 bg-white p-6 max-w-lg">
      <h2 className="text-xs font-black uppercase tracking-widest mb-1">Tu link público</h2>
      <p className="text-[10px] text-gray-400 mb-4">Comparte este link con tus clientes.</p>
      <div className="flex items-center gap-2">
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 font-mono text-xs text-black bg-gray-50 border border-gray-200 px-3 py-2 truncate hover:underline"
        >
          {url}
        </a>
        <button
          onClick={handleCopy}
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-2 text-white transition-colors"
          style={{ backgroundColor: copied ? '#16a34a' : 'var(--blue-deep)' }}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </section>
  )
}

interface Store {
  slug: string
  whatsapp: string | null
  email: string | null
  show_prices: boolean
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function StoreSettingsForm({ store }: { store: Store }) {
  const router = useRouter()
  const [slug,       setSlug]       = useState(store.slug)
  const [whatsapp,   setWhatsapp]   = useState(store.whatsapp ?? '')
  const [email, setEmail] = useState(store.email ?? '')
  const [showPrices, setShowPrices] = useState(store.show_prices)
  const [saving,     setSaving]     = useState(false)
  const [message,    setMessage]    = useState<{ ok: boolean; text: string } | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/admin/my-store/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, whatsapp, email, show_prices: showPrices }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMessage({ ok: false, text: json.error ?? 'Error al guardar' })
    } else {
      setMessage({ ok: true, text: 'Cambios guardados.' })
      router.refresh()
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6 max-w-lg">
      <h2 className="text-xs font-black uppercase tracking-widest mb-5">Tu tienda</h2>

      {/* WhatsApp */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          WhatsApp (número)
        </label>
        <input
          type="text"
          value={whatsapp}
          onChange={e => setWhatsapp(e.target.value)}
          placeholder="521XXXXXXXXXX"
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          Email de contacto
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="contacto@tutienda.com"
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
        />
      </div>

      {/* Show prices */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPrices(!showPrices)}
          className={`relative w-10 h-5 rounded-full transition-colors ${showPrices ? 'bg-black' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showPrices ? 'translate-x-5' : ''}`}
          />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider">
          {showPrices ? 'Mostrar precios' : 'Ocultar precios'}
        </span>
      </div>

      {/* Storecode */}
      <div className="mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          Código de tienda (storecode)
        </label>
        <input
          type="text"
          value={slug}
          onChange={e => setSlug(slugify(e.target.value))}
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black font-mono"
        />
      </div>

      {/* Storecode warning */}
      {slug !== store.slug && (
        <div className="mb-4 border border-red-300 bg-red-50 p-3 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
            ⚠ Cambiar el código romperá el enlace actual de tu tienda. Los clientes con el link anterior recibirán un error 404.
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
            ⚠ Tu nuevo usuario de acceso al panel será: <span className="font-mono">{slug}</span>
          </p>
        </div>
      )}

      {message && (
        <p className={`text-[10px] font-bold mb-3 ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 text-white disabled:opacity-50"
        style={{ backgroundColor: 'var(--blue-deep)' }}
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </section>
  )
}

export function PasswordForm() {
  const [current,  setCurrent]  = useState('')
  const [next,     setNext]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [message,  setMessage]  = useState<{ ok: boolean; text: string } | null>(null)
  const [showPw,   setShowPw]   = useState(false)

  const handleSave = async () => {
    if (next !== confirm) {
      setMessage({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    setSaving(true)
    setMessage(null)
    const res = await fetch('/api/admin/my-store/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) {
      setMessage({ ok: false, text: json.error ?? 'Error al cambiar contraseña' })
    } else {
      setMessage({ ok: true, text: 'Contraseña actualizada.' })
      setCurrent(''); setNext(''); setConfirm('')
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6 max-w-lg">
      <h2 className="text-xs font-black uppercase tracking-widest mb-5">Cambiar contraseña</h2>

      <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          Contraseña actual
        </label>
        <input
          type={showPw ? 'text' : 'password'}
          value={current}
          onChange={e => setCurrent(e.target.value)}
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
        />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          Nueva contraseña
        </label>
        <input
          type={showPw ? 'text' : 'password'}
          value={next}
          onChange={e => setNext(e.target.value)}
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
        />
      </div>

      <div className="mb-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
          Confirmar nueva contraseña
        </label>
        <input
          type={showPw ? 'text' : 'password'}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          className="w-full border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-black"
        />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          id="show-pw"
          type="checkbox"
          checked={showPw}
          onChange={e => setShowPw(e.target.checked)}
          className="w-3 h-3"
        />
        <label htmlFor="show-pw" className="text-[10px] font-bold uppercase tracking-wider text-gray-500 cursor-pointer">
          Mostrar contraseñas
        </label>
      </div>

      {message && (
        <p className={`text-[10px] font-bold mb-3 ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || !current || !next || !confirm}
        className="text-xs font-bold uppercase tracking-wider px-4 py-2 text-white disabled:opacity-50"
        style={{ backgroundColor: 'var(--blue-deep)' }}
      >
        {saving ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </section>
  )
}
