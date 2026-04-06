import Link from "next/link"
import { getSession } from "@/lib/auth-server"
import { LoginForm } from "@/components/auth/login-form"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const session = await getSession()
  if (session?.user) {
    redirect("/waitlists")
  }
  const t = await getTranslations("Auth")
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("loginSubtitle")}</p>
      </div>
      <LoginForm />
      <p className="text-muted-foreground text-center text-sm">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  )
}
