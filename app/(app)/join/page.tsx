import { JoinPrivateForm } from "@/components/waitlist/join-private-form"
import { getTranslations } from "next-intl/server"

export default async function JoinPrivatePage() {
  const t = await getTranslations("WaitlistJoinPrivate")
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <JoinPrivateForm />
    </div>
  )
}
