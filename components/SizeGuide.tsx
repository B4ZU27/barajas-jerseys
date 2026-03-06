'use client'

import { useState } from 'react'
import sizingData from '@/data/sizing.json'

type Version = 'player' | 'fan'

const charts = sizingData.sizing_charts

export default function SizeGuide() {
  const [version, setVersion] = useState<Version>('player')

  const rows = version === 'player' ? charts.player_version : charts.fan_version

  return (
    <div className="border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setVersion('player')}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            version === 'player'
              ? 'bg-black text-white'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Jugador
        </button>
        <button
          onClick={() => setVersion('fan')}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            version === 'fan'
              ? 'bg-black text-white'
              : 'text-gray-400 hover:text-black'
          }`}
        >
          Aficionado
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-widest">
              <th className="px-3 py-2 text-left font-bold">Talla</th>
              <th className="px-3 py-2 text-center font-bold">Largo</th>
              <th className="px-3 py-2 text-center font-bold">Circunf.</th>
              <th className="px-3 py-2 text-center font-bold">Estatura</th>
              <th className="px-3 py-2 text-center font-bold">Peso kg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.size}
                className={`border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2 font-black">{row.size}</td>
                <td className="px-3 py-2 text-center">{row.garment_length_cm} cm</td>
                <td className="px-3 py-2 text-center">{row.circumference_cm} cm</td>
                <td className="px-3 py-2 text-center">{row.recommended_height_cm} cm</td>
                <td className="px-3 py-2 text-center">{row.recommended_weight_kg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
