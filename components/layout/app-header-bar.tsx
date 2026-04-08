"use client"

import { AuthDialog } from "@/components/dialog/AuthDialog"
import { SignOutButton } from "@/components/layout/sign-out-button"
import { LanguageSelector } from "@/components/select/select-language"
import { SelectTheme } from "@/components/select/select-theme"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { RANKING_ACTIVE_WINDOW_DAYS, REFRESH_COOLDOWN_DAYS } from "@/lib/waitlist-config"
import { HelpCircleIcon, Menu01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo, useState } from "react"

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

function mobileNavLinkClassName(active: boolean) {
  return cn(
    "block rounded-xl px-4 py-3.5 text-base transition-colors",
    active
      ? "bg-accent font-semibold text-accent-foreground"
      : "text-foreground active:bg-muted",
  )
}

export type AppHeaderBarProps = {
  isAuthenticated: boolean
  isSuperAdmin: boolean
}

function WaitlistsHelpBody() {
  const t = useTranslations("Nav.helpWaitlists")

  return (
    <div className="space-y-3">
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
    </div>
  )
}

/**
 * Aide : survol (desktop) ou dialog (mobile / tactile).
 */
function WaitlistsHelp() {
  const t = useTranslations("Nav.helpWaitlists")
  const [open, setOpen] = useState(false)

  const triggerClass = cn(
    "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-8",
  )

  return (
    <>
      <div className="hidden md:block">
        <HoverCard>
          <HoverCardTrigger
            delay={200}
            closeDelay={100}
            render={(props) => (
              <button
                type="button"
                {...props}
                className={cn(triggerClass, props.className)}
                aria-label={t("ariaLabel")}
              >
                <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
              </button>
            )}
          />
          <HoverCardContent side="bottom" align="end" className="w-80 max-w-[min(20rem,calc(100vw-2rem))]">
            <WaitlistsHelpBody />
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="md:hidden">
        <button type="button" className={triggerClass} aria-label={t("ariaLabel")} onClick={() => setOpen(true)}>
          <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[min(90dvh,28rem)] gap-4 overflow-y-auto sm:max-w-md" showCloseButton>
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
            </DialogHeader>
            <WaitlistsHelpBody />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

type NavItem = { href: string; label: string; active: boolean }

/**
 * Barre interne du header : navigation (état actif via `usePathname`) et actions compte.
 */
export function AppHeaderBar({ isAuthenticated, isSuperAdmin }: AppHeaderBarProps) {
  const pathname = usePathname()
  const t = useTranslations("Nav")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Waiting List"

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        href: "/waitlists",
        label: t("publicWaitlists"),
        active: isPublicWaitlistsActive(pathname),
      },
    ]
    if (isAuthenticated) {
      items.push(
        {
          href: "/waitlists/mine",
          label: t("myLists"),
          active: pathname.startsWith("/waitlists/mine"),
        },
        {
          href: "/waitlists/joined",
          label: t("joined"),
          active: pathname.startsWith("/waitlists/joined"),
        },
        {
          href: "/join",
          label: t("privateCode"),
          active: pathname.startsWith("/join"),
        },
        {
          href: "/profile",
          label: t("profile"),
          active: pathname === "/profile",
        },
      )
      if (isSuperAdmin) {
        items.push(
          {
            href: "/super/waitlists",
            label: t("superAdmin"),
            active: pathname === "/super/waitlists",
          },
        )
      }
    }
    return items
  }, [pathname, isAuthenticated, isSuperAdmin, t])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
      {/* Mobile : marque + raccourcis + menu */}
      <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden">
        <Link
          href="/waitlists"
          className="truncate text-sm font-semibold text-foreground"
          onClick={closeMobileMenu}
        >
          {appName}
        </Link>
      </div>

      <div className="flex shrink-0 items-center gap-1 md:hidden">
        <WaitlistsHelp />
        <LanguageSelector showText={false} openOnHover={false} />
        <SelectTheme compact openOnHover={false} />
        {isAuthenticated ? <SignOutButton compact /> : <AuthDialog compact />}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="shrink-0"
                aria-label={t("openMenu")}
              />
            }
          >
            <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="size-4" />
          </DialogTrigger>
          <DialogContent
            className="flex max-h-[min(85dvh,32rem)] w-[min(calc(100vw-1.5rem),22rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
            showCloseButton
          >
            <DialogHeader className="border-b border-border px-4 py-4 text-left">
              <DialogTitle>{t("menuTitle")}</DialogTitle>
            </DialogHeader>
            <nav className="max-h-[min(70dvh,24rem)] overflow-y-auto p-2" aria-label={t("menuTitle")}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={mobileNavLinkClassName(item.active)}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop */}
      <nav className="hidden min-w-0 flex-1 flex-wrap items-center gap-4 md:flex">
        <Link href="/waitlists" className={navLinkClassName(isPublicWaitlistsActive(pathname))}>
          {t("publicWaitlists")}
        </Link>
        {isAuthenticated && (
          <>
            <Link href="/waitlists/mine" className={navLinkClassName(pathname.startsWith("/waitlists/mine"))}>
              {t("myLists")}
            </Link>
            <Link href="/waitlists/joined" className={navLinkClassName(pathname.startsWith("/waitlists/joined"))}>
              {t("joined")}
            </Link>
            <Link href="/join" className={navLinkClassName(pathname.startsWith("/join"))}>
              {t("privateCode")}
            </Link>
            {isSuperAdmin && (
              <Link href="/super/waitlists" className={navLinkClassName(pathname === "/super/waitlists")}>
                {t("superAdmin")}
              </Link>
            )}
          </>
        )}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        {isAuthenticated ? (
          <Link href="/profile" className={navLinkClassName(pathname === "/profile")}>
            {t("profile")}
          </Link>
        ) : null}
        <WaitlistsHelp />
        <LanguageSelector />
        <SelectTheme />
        {isAuthenticated ? <SignOutButton /> : <AuthDialog />}
      </div>
    </div>
  )
}
