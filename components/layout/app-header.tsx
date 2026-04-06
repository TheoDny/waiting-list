import { SignOutButton } from "@/components/layout/sign-out-button"
import { LanguageSelector } from "@/components/select/select-language"
import { SelectTheme } from "@/components/select/select-theme"
import { buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/auth-server"
import { cn } from "@/lib/utils"
import { getUserById } from "@/service/user.service"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

const navClass = "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"

export async function AppHeader() {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }
  const dbUser = await getUserById(session.user.id)
  const t = await getTranslations("Nav")

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/waitlists" className="font-semibold">
            {t("publicWaitlists")}
          </Link>
          <Link href="/waitlists/mine" className={navClass}>
            {t("myLists")}
          </Link>
          <Link href="/waitlists/joined" className={navClass}>
            {t("joined")}
          </Link>
          <Link href="/join" className={navClass}>
            {t("privateCode")}
          </Link>
          {dbUser?.isSuperAdmin ? (
            <Link href="/super/waitlists" className={navClass}>
              {t("superAdmin")}
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/profile" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            {t("profile")}
          </Link>
          <LanguageSelector />
          <SelectTheme />
          <SignOutButton />
        </div>
      </div>
    </header>
  )
}
