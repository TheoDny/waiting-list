import { getSession } from "@/lib/auth-server"
import { getUserById } from "@/service/user.service"
import { ProfileForm } from "@/components/profile/profile-form"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user?.id) {
    redirect("/login")
  }
  const user = await getUserById(session.user.id)
  if (!user) {
    redirect("/login")
  }
  const t = await getTranslations("Profile")
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
