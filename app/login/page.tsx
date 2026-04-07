import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/auth-server"
import { getSafeRedirectPath } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams
  const session = await getSession()
  if (session?.user) {
    redirect("/waitlists")
  }
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl)

  const t = await getTranslations("Auth")
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("loginSubtitle")}</p>
      </div>
      <LoginForm callbackUrl={safeCallbackUrl} />
      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link href={`/register?callbackUrl=${safeCallbackUrl}`} className="text-primary font-medium underline-offset-4 hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  )
}
