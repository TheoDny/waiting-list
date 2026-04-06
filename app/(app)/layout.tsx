import { AppHeader } from "@/components/layout/app-header"
import { getSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"

export default async function AppSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session?.user) {
    redirect("/login")
  }
  return (
    <div className="bg-background min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
