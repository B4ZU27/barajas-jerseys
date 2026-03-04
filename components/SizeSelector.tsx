'use client'

import { useState } from 'react'

interface SizeSelectorProps {
  sizes: string[]
  onChange?: (size: string) => void
}

export default function SizeSelector({ sizes, onChange }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(size: string) {
    setSelected(size)
    onChange?.(size)
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">
        Talla{' '}
        {selected && (
          <span className="text-black font-bold">— {selected}</span>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => handleSelect(size)}
            className={`
              min-w-[48px] h-12 px-3 border text-sm font-bold uppercase
              transition-colors duration-150
              ${selected === size
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
              }
            `}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  )
}
