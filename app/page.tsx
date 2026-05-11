import { notFound } from 'next/navigation'

// Root URL has no store — you need the storecode in the URL
// e.g. archivodecancha.com/barajas
export default function RootPage() {
  notFound()
}
