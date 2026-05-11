import { redirect } from 'next/navigation'

export default function MyStorePage() {
  redirect('/admin/my-store/products')
}
