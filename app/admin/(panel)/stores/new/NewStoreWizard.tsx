'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface League { id: string; slug: string; name: string }
interface Props {
  leagues: League[]
  tags: string[]
  counts: { all: number; byLeague: Record<string, number>; byTag: Record<string, number> }
}

type TemplateType = 'none' | 'all' | 'league' | 'tag'

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').trim()
}

export default function NewStoreWizard({ leagues, tags, counts }: Props) {
  const router = useRouter()
  const [step, setStep]   = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [createdPassword, setCreatedPassword] = useState('')

  // Step 1 — store info
  const [name, setName]           = useState('')
  const [slug, setSlug]           = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [showPrices, setShowPrices] = useState(false)

  // Step 2 — owner
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)

  // Step 3 — template
  const [templateType, setTemplateType] = useState<TemplateType>('none')
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([])
  const [selectedTags, setSelectedTags]       = useState<string[]>([])

  function handleNameChange(v: string) {
    setName(v)
    if (!slug || slug === slugify(name)) setSlug(slugify(v))
  }

  function toggleLeague(id: string) {
    setSelectedLeagues(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  function toggleTag(t: string) {
    setSelectedTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function productCount() {
    if (templateType === 'none') return 0
    if (templateType === 'all') return counts.all
    if (templateType === 'league') return selectedLeagues.reduce((s, id) => s + (counts.byLeague[id] ?? 0), 0)
    if (templateType === 'tag') return selectedTags.reduce((s, t) => s + (counts.byTag[t] ?? 0), 0)
    return 0
  }

  function validateStep1() {
    if (!name.trim()) return 'El nombre es requerido'
    if (!slug.trim()) return 'El storecode es requerido'
    if (!/^[a-z0-9-]+$/.test(slug)) return 'El storecode solo puede tener letras minúsculas, números y guiones'
    return ''
  }

  function validateStep2() {
    if (!email.trim()) return 'El email es requerido'
    if (!password) return 'La contraseña es requerida'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (password !== confirmPw) return 'Las contraseñas no coinciden'
    return ''
  }

  function next() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : ''
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  async function handleCreate() {
    setLoading(true)
    setError('')

    const template = templateType === 'none' ? { type: 'none' }
      : templateType === 'all' ? { type: 'all' }
      : templateType === 'league' ? { type: 'league', leagueIds: selectedLeagues }
      : { type: 'tag', tags: selectedTags }

    const res = await fetch('/api/admin/create-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, whatsapp, show_prices: showPrices, ownerEmail: email, ownerPhone: phone, ownerPassword: password, template }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error ?? 'Error al crear la tienda'); return }

    setCreatedPassword(password)
    setStep(5) // success screen
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 p-8 w-full max-w-md">
          <div className="w-8 h-8 bg-green-100 flex items-center justify-center mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-black uppercase tracking-widest mb-1">¡Tienda creada!</h2>
          <p className="text-xs text-gray-400 mb-6">Guarda esta contraseña — no se mostrará de nuevo.</p>

          <div className="mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Email del owner</p>
            <p className="text-sm font-mono bg-gray-50 border border-gray-200 px-3 py-2">{email}</p>
          </div>
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Contraseña</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono bg-yellow-50 border border-yellow-200 px-3 py-2 flex-1 select-all">{createdPassword}</p>
              <button
                onClick={() => navigator.clipboard.writeText(createdPassword)}
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-2 border border-gray-200 hover:border-black transition-colors"
              >
                Copiar
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-6">
            URL de la tienda: <span className="font-mono font-bold">/{slug}</span>
          </div>

          <button
            onClick={() => router.push('/admin/stores')}
            className="w-full py-3 text-sm font-black uppercase tracking-widest text-white bg-black hover:bg-gray-900 transition-colors"
          >
            Listo → Ver tiendas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
          Crear tienda
        </h1>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${step >= n ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                {n}
              </div>
              {n < 4 && <div className={`h-px w-8 ${step > n ? 'bg-black' : 'bg-gray-200'}`} />}
            </div>
          ))}
          <span className="text-[10px] text-gray-400 ml-2 uppercase tracking-widest">
            {step === 1 ? 'Info de la tienda' : step === 2 ? 'Cuenta del owner' : step === 3 ? 'Productos iniciales' : 'Confirmar'}
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 text-xs text-red-600 font-medium border border-red-200 bg-red-50 px-3 py-2">
            {error}
          </div>
        )}

        {/* STEP 1 — Store info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Nombre de la tienda *</label>
              <input type="text" value={name} onChange={e => handleNameChange(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="Barajas Jerseys" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Storecode (URL) *</label>
              <div className="flex items-center border border-gray-300 focus-within:border-black">
                <span className="px-3 py-2 text-sm text-gray-400 border-r border-gray-300 bg-gray-50 select-none">archivodecancha.com/</span>
                <input type="text" value={slug} onChange={e => setSlug(slugify(e.target.value))}
                  className="flex-1 px-3 py-2 text-sm font-mono focus:outline-none bg-white"
                  placeholder="barajas" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">WhatsApp de la tienda</label>
              <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="521234567890 (sin + ni espacios)" />
            </div>
            <div className="flex items-center justify-between border border-gray-200 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Mostrar precios</p>
                <p className="text-[10px] text-gray-400">Los clientes verán los precios en las tarjetas de producto</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrices(v => !v)}
                className={`w-10 h-5 relative transition-colors ${showPrices ? 'bg-black' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${showPrices ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Owner account */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Email del owner (login) *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="owner@email.com" autoFocus />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Teléfono / contacto personal</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="521234567890" />
              <p className="text-[10px] text-gray-400 mt-1">Solo para referencia interna, no se muestra al público.</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Contraseña inicial *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-black"
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Confirmar contraseña *</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black" />
            </div>
            <p className="text-[10px] text-gray-400 bg-yellow-50 border border-yellow-200 px-3 py-2">
              Al crear la tienda, la contraseña se mostrará una sola vez para que la copies y la compartas con el owner.
            </p>
          </div>
        )}

        {/* STEP 3 — Product template */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">Elige qué productos agregar a la tienda al crearla. El owner puede añadir o quitar más después.</p>

            {(['none', 'all', 'league', 'tag'] as TemplateType[]).map(type => (
              <label key={type} className={`flex items-start gap-3 border px-4 py-3 cursor-pointer transition-colors ${templateType === type ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}>
                <input type="radio" name="template" value={type} checked={templateType === type}
                  onChange={() => setTemplateType(type)} className="mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {type === 'none' && 'Sin productos — el owner los agrega manualmente'}
                    {type === 'all'  && `Todos los productos (${counts.all})`}
                    {type === 'league' && 'Por liga'}
                    {type === 'tag'    && 'Por tag'}
                  </p>
                </div>
              </label>
            ))}

            {templateType === 'league' && (
              <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                {leagues.map(l => (
                  <label key={l.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedLeagues.includes(l.id)}
                      onChange={() => toggleLeague(l.id)} />
                    <span className="text-xs">{l.name}</span>
                    <span className="text-[10px] text-gray-400">({counts.byLeague[l.id] ?? 0})</span>
                  </label>
                ))}
              </div>
            )}

            {templateType === 'tag' && (
              <div className="pl-4 flex flex-wrap gap-2 border-l-2 border-gray-200">
                {tags.map(t => (
                  <button key={t} type="button" onClick={() => toggleTag(t)}
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${selectedTags.includes(t) ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-black'}`}>
                    {t} ({counts.byTag[t] ?? 0})
                  </button>
                ))}
              </div>
            )}

            {templateType !== 'none' && (
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2">
                Se agregarán <strong>{productCount()}</strong> productos al precio del catálogo maestro.
              </p>
            )}
          </div>
        )}

        {/* STEP 4 — Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 divide-y divide-gray-100 text-xs">
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">Tienda</span><span className="font-bold">{name}</span></div>
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">Storecode</span><span className="font-mono font-bold">/{slug}</span></div>
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">WhatsApp</span><span>{whatsapp || '—'}</span></div>
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">Precios visibles</span><span>{showPrices ? 'Sí' : 'No'}</span></div>
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">Owner email</span><span>{email}</span></div>
              <div className="px-4 py-3 flex justify-between"><span className="text-gray-400 uppercase tracking-wider">Contacto owner</span><span>{phone || '—'}</span></div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-gray-400 uppercase tracking-wider">Productos iniciales</span>
                <span>{templateType === 'none' ? 'Ninguno' : `${productCount()} productos`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {step > 1 ? (
            <button onClick={() => { setError(''); setStep(s => s - 1) }}
              className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
              ← Atrás
            </button>
          ) : <div />}

          {step < 4 ? (
            <button onClick={next}
              className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-white"
              style={{ backgroundColor: 'var(--blue-primary)' }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={handleCreate} disabled={loading}
              className="text-xs font-bold uppercase tracking-wider px-6 py-3 text-white bg-black hover:bg-gray-900 disabled:opacity-50 transition-colors">
              {loading ? 'Creando…' : 'Crear tienda'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
