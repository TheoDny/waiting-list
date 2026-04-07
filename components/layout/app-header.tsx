import { AppHeaderBar } from "@/components/layout/app-header-bar"
import { getSession } from "@/lib/auth-server"
import { getUserById } from "@/service/user.service"

export async function AppHeader() {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }
  const dbUser = await getUserById(session.user.id)

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <AppHeaderBar isSuperAdmin={Boolean(dbUser?.isSuperAdmin)} />
    </header>
  )
}
