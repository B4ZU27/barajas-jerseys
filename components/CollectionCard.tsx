import Link from 'next/link'
import Image from 'next/image'
import { Category } from '@/lib/products'

interface CollectionCardProps {
  category: Category
  label: string
  image: string
}

export default function CollectionCard({ category, label, image }: CollectionCardProps) {
  return (
    <Link href={`/collections/${category}`} className="group relative block aspect-square overflow-hidden">
      <Image
        src={image}
        alt={label}
        fill
        className="object-contain transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 45vw, (max-width: 1024px) 18vw, 16vw"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />
      <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg uppercase tracking-widest">
        {label}
      </span>
    </Link>
  )
}
