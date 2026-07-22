import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard-topbar'
import { MobileHeader } from '@/components/mobile-header'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')
  if (profile.status === 'pending') redirect('/auth/pending')
  if (profile.status === 'rejected') redirect('/auth/login')
  if (profile.role === 'admin') redirect('/admin')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop uniquement */}
      <div className="hidden md:flex">
        <DashboardSidebar />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar — desktop uniquement */}
        <div className="hidden md:flex">
          <DashboardTopbar profile={profile} />
        </div>

        {/* Header mobile */}
        <MobileHeader profile={profile} />

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:p-6 mt-14 md:mt-0 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile uniquement */}
      <MobileBottomNav basePath="dashboard" />
    </div>
  )
}
