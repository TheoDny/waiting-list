"use client"

import { SignOutButton } from "@/components/layout/sign-out-button"
import { LanguageSelector } from "@/components/select/select-language"
import { SelectTheme } from "@/components/select/select-theme"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"

function isPublicWaitlistsActive(pathname: string) {
  if (pathname === "/waitlists") return true
  const parts = pathname.split("/").filter(Boolean)
  if (parts[0] !== "waitlists" || parts.length < 2) return false
  return parts[1] !== "mine" && parts[1] !== "joined"
}

function navLinkClassName(active: boolean) {
  return cn(
    "transition-colors",
    active
      ? "text-base font-semibold text-foreground"
      : "text-sm font-medium text-muted-foreground hover:text-foreground",
  )
}

export type AppHeaderBarProps = {
  isSuperAdmin: boolean
}

/**
 * Barre interne du header : navigation (état actif via `usePathname`) et actions compte.
 */
export function AppHeaderBar({ isSuperAdmin }: AppHeaderBarProps) {
  const pathname = usePathname()
  const t = useTranslations("Nav")

  return (
    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
      <nav className="flex flex-wrap items-center gap-4">
        <Link href="/waitlists" className={navLinkClassName(isPublicWaitlistsActive(pathname))}>
          {t("publicWaitlists")}
        </Link>
        <Link
          href="/waitlists/mine"
          className={navLinkClassName(pathname.startsWith("/waitlists/mine"))}
        >
          {t("myLists")}
        </Link>
        <Link
          href="/waitlists/joined"
          className={navLinkClassName(pathname.startsWith("/waitlists/joined"))}
        >
          {t("joined")}
        </Link>
        <Link href="/join" className={navLinkClassName(pathname.startsWith("/join"))}>
          {t("privateCode")}
        </Link>
        {isSuperAdmin ? (
          <Link
            href="/super/waitlists"
            className={navLinkClassName(pathname.startsWith("/super/waitlists"))}
          >
            {t("superAdmin")}
          </Link>
        ) : null}
      </nav>
      <div className="flex items-center gap-2">
        <Link 
          href="/profile" 
          className={navLinkClassName(pathname === "/profile" )}
          >
          {t("profile")}
        </Link>
        <LanguageSelector />
        <SelectTheme />
        <SignOutButton />
      </div>
    </div>
  )
}
