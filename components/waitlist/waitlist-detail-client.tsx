"use client"

import {
  joinWaitlistAction,
  leaveWaitlistAction,
  refreshWaitlistAction,
} from "@/action/waiting-list.action"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn, intlLocaleFor } from "@/lib/utils"
import { useConfirm } from "@/provider/ConfirmationProvider"
import type { WaitlistDetailForUi } from "@/service/waiting-list.service"
import { useLocale, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type MemberStatusKey = "PENDING" | "APPROVED" | "REFUSED"

function memberStatusKey(s: string): MemberStatusKey {
  if (s === "PENDING" || s === "APPROVED" || s === "REFUSED") return s
  return "PENDING"
}

type Props = {
  detail: WaitlistDetailForUi
  joinCode: string | null
  defaultDisplayName: string
}

export function WaitlistDetailClient({ detail, joinCode, defaultDisplayName }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const intlLocale = intlLocaleFor(locale)
  const { confirm } = useConfirm()
  const t = useTranslations("WaitlistDetail")
  const tc = useTranslations("Common")
  const tb = useTranslations("WaitlistBadge")
  const tm = useTranslations("MemberStatus")
  const [joinOpen, setJoinOpen] = useState(false)
  const [pseudo, setPseudo] = useState(defaultDisplayName)

  const { execute: executeJoin, isExecuting: joining } = useAction(joinWaitlistAction, {
    onSuccess: ({ data }) => {
      if (data?.member) {
        toast.success(t("toastJoined"))
        setJoinOpen(false)
        router.refresh()
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t("toastJoinError"))
    },
  })

  const { execute: executeLeave, isExecuting: leaving } = useAction(leaveWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastLeft"))
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? tc("error"))
    },
  })

  const { execute: executeRefresh, isExecuting: refreshing } = useAction(refreshWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastRefreshed"))
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? t("toastRefreshError"))
    },
  })

  async function onLeave() {
    const ok = await confirm(t("leaveConfirmTitle"), t("leaveConfirmDescription"))
    if (!ok) return
    executeLeave({ waitlistId: detail.waitlist.id })
  }

  const w = detail.waitlist
  const m = detail.myMembership

  const statusText = (code: string) => tm(memberStatusKey(code))

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{w.name}</h1>
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-2 text-sm">
            {w.isPublic ? (
              <Badge variant="outline">{tb("public")}</Badge>
            ) : (
              <Badge variant="secondary">{tb("private")}</Badge>
            )}
            {w.paused ? <Badge variant="destructive">{tb("pauseSignup")}</Badge> : null}
            {detail.isOwner || detail.isSuperAdmin ? (
              <Badge variant="outline">{tb("admin")}</Badge>
            ) : null}
          </div>
          {!w.isPublic && (detail.isOwner || detail.isSuperAdmin) && w.joinCode ? (
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              {t("accessCode")} <span className="text-foreground">{w.joinCode}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {detail.isOwner || detail.isSuperAdmin ? (
            <Link href={`/admin/waitlists/${w.id}`} className={cn(buttonVariants())}>
              {tc("administration")}
            </Link>
          ) : null}
        </div>
      </div>

      {m ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("yourSignup")}</CardTitle>
            <CardDescription>
              {t("statusLine", { status: statusText(m.status) })}
              {detail.myRank != null ? ` · ${tc("estimatedRank")}: ${detail.myRank}` : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {m.canRefresh ? (
              <Button type="button" disabled={refreshing} onClick={() => executeRefresh({ waitlistId: w.id })}>
                {tc("refresh")}
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                {t("refreshed")}
                {m.nextRefreshAt
                  ? t("nextRefresh", {
                      date: m.nextRefreshAt.toLocaleString(intlLocale),
                    })
                  : null}
              </p>
            )}
            <Button type="button" variant="outline" disabled={leaving} onClick={onLeave}>
              {t("leaveList")}
            </Button>
          </CardContent>
        </Card>
      ) : !w.paused ? (
        <>
          <Button type="button" onClick={() => setJoinOpen(true)}>
            {t("join")}
          </Button>
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("joinTitle", { name: w.name })}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="pseudo">{t("pseudoOnList")}</Label>
                <Input id="pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={80} />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  disabled={joining}
                  onClick={() =>
                    executeJoin({
                      waitlistId: w.id,
                      displayName: pseudo,
                      joinCode,
                    })
                  }
                >
                  {tc("confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">{t("signupPaused")}</p>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium">{t("ranking")}</h2>
        <Separator className="mb-4" />
        {detail.displayRows.length === 0 && detail.otherCount === 0 ? (
          <p className="text-muted-foreground text-sm">{t("noParticipants")}</p>
        ) : (
          <ul className="space-y-2">
            {detail.displayRows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
              >
                <span className={row.blurName ? "blur-sm select-none" : ""}>{row.displayName}</span>
                <span className="text-muted-foreground text-xs">
                  {row.joinedAt.toLocaleString(intlLocale)}
                </span>
                <span className="text-muted-foreground text-xs">{statusText(row.status)}</span>
              </li>
            ))}
            {detail.otherCount > 0
              ? Array.from({ length: Math.min(detail.otherCount, 10) }).map((_, i) => (
                  <li
                    key={`phantom-${i}`}
                    className="text-muted-foreground flex items-center justify-between rounded-xl border border-dashed px-3 py-2 text-sm"
                    aria-hidden
                  >
                    <span className="blur-sm select-none">········</span>
                    <span className="text-xs">···</span>
                  </li>
                ))
              : null}
          </ul>
        )}
      </div>
    </div>
  )
}
