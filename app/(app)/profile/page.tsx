import { ProfileForm } from "@/components/profile/profile-form"
import { Skeleton } from "@/components/ui/skeleton"
import { getSession } from "@/lib/auth-server"
import { getUserById } from "@/service/user.service"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"

function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-5 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

async function ProfilePageContent() {
  const session = await getSession()
  if (!session?.user?.id) {
    redirect("/")
  }
  const user = await getUserById(session.user.id)
  if (!user) {
    redirect("/")
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

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton />} >
      <ProfilePageContent />
    </Suspense>
  )
}
