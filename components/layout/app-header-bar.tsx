"use client"

import { SignOutButton } from "@/components/layout/sign-out-button"
import { LanguageSelector } from "@/components/select/select-language"
import { SelectTheme } from "@/components/select/select-theme"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { RANKING_ACTIVE_WINDOW_DAYS, REFRESH_COOLDOWN_DAYS } from "@/lib/waitlist-config"
import { HelpCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
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
 * Icône d’aide : survol pour expliquer le fonctionnement des listes et la logique de classement (alignée sur `sortMembersByRanking`).
 */
function WaitlistsHelpHover() {
  const t = useTranslations("Nav.helpWaitlists")

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={200}
        closeDelay={100}
        render={(props) => (
          <button
            type="button"
            {...props}
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              props.className,
            )}
            aria-label={t("ariaLabel")}
          >
            <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
          </button>
        )}
      />
      <HoverCardContent side="bottom" align="end" className="w-80 max-w-[min(20rem,calc(100vw-2rem))] space-y-3">
        <p className="font-semibold text-foreground">{t("title")}</p>
        <div className="space-y-2 text-muted-foreground">
          <p className="font-medium text-foreground">{t("howTitle")}</p>
          <p>{t("howP1")}</p>
          <p>{t("howP2", { cooldownDays: REFRESH_COOLDOWN_DAYS })}</p>
        </div>
        <div className="space-y-2 border-t border-border pt-3 text-muted-foreground">
          <p className="font-medium text-foreground">{t("rankTitle")}</p>
          <p>{t("rankIntro")}</p>
          <p>{t("rankActive", { activeDays: RANKING_ACTIVE_WINDOW_DAYS })}</p>
          <p>{t("rankInactive")}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
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
          <>
            <Link
              href="/super/waitlists"
              className={navLinkClassName(pathname === "/super/waitlists")}
            >
              {t("superAdmin")}
            </Link>
            <Link
              href="/super/waitlists/private"
              className={navLinkClassName(pathname.startsWith("/super/waitlists/private"))}
            >
              {t("superAdminPrivate")}
            </Link>
          </>
        ) : null}
      </nav>
      <div className="flex items-center gap-2">
        <Link 
          href="/profile" 
          className={navLinkClassName(pathname === "/profile" )}
          >
          {t("profile")}
        </Link>
        <WaitlistsHelpHover />
        <LanguageSelector />
        <SelectTheme />
        <SignOutButton />
      </div>
    </div>
  )
}
