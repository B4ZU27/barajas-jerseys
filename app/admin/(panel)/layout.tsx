import AdminSidebar from '@/components/AdminSidebar'
import AutoSignOut from '@/components/AutoSignOut'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AutoSignOut />
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
