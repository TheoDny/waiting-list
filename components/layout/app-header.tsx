import { AppHeaderBar } from "@/components/layout/app-header-bar"
import { getSession } from "@/lib/auth-server"
import { isSuperAdminUser } from "@/service/user.service"

export async function AppHeader() {
  const session = await getSession()
  const userId = session?.user?.id
  const isSuperAdmin = userId
    ? (await isSuperAdminUser(userId))
    : false

  return (
    <header className="border-b bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <AppHeaderBar isAuthenticated={Boolean(userId)} isSuperAdmin={isSuperAdmin} />
    </header>
  )
}
