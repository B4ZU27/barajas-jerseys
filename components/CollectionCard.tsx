import Link from 'next/link'
import Image from 'next/image'

interface CollectionCardProps {
  category: string
  label: string
  image?: string
}

export default function CollectionCard({ category, label, image }: CollectionCardProps) {
  return (
    <Link href={`/collections/${category}`} className="group relative block aspect-square overflow-hidden bg-black">
      {image && (
        <Image
          src={image}
          alt={label}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 45vw, (max-width: 1024px) 18vw, 16vw"
        />
      )}
      <div className={`absolute inset-0 transition-colors duration-300 ${image ? 'bg-black/40 group-hover:bg-black/55' : 'group-hover:bg-white/10'}`} />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg uppercase tracking-widest">
        {label}
      </span>
    </Link>
  )
}
