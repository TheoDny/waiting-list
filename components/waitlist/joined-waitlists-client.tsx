"use client"

import { leaveWaitlistAction, refreshWaitlistAction } from "@/action/waiting-list.action"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, intlLocaleFor } from "@/lib/utils"
import { useConfirm } from "@/provider/ConfirmationProvider"
import type { JoinedWaitlistSummary } from "@/service/waiting-list.service"
import { useLocale, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { WaitlistMemberStatus } from "../../generated/prisma/enums"

export function JoinedWaitlistsClient({ rows }: { rows: JoinedWaitlistSummary[] }) {
  const router = useRouter()
  const locale = useLocale()
  const intlLocale = intlLocaleFor(locale)
  const { confirm } = useConfirm()
  const t = useTranslations("WaitlistJoined")
  const tc = useTranslations("Common")
  const tm = useTranslations("MemberStatus")

  const { execute: execRefresh, isExecuting: refreshing } = useAction(refreshWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastRefreshed"))
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  const { execute: execLeave, isExecuting: leaving } = useAction(leaveWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastLeft"))
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  async function onLeave(waitlistId: string) {
    const ok = await confirm(t("leaveConfirmTitle"), "")
    if (!ok) return
    execLeave({ waitlistId })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <ul className="grid gap-3">
        {rows.map(({ membership, waitlist, rank, canRefresh, nextRefreshAt, refreshedRecently }) => (
          <li key={membership.id}>
            <Card>
              <CardHeader className="gap-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{waitlist.name}</CardTitle>
                  <Badge variant={membership.status === WaitlistMemberStatus.APPROVED ? "default" : "secondary"}>
                    {tm(membership.status as "PENDING" | "APPROVED" | "REFUSED")}
                  </Badge>
                </div>
                <CardDescription>
                  {t("pseudoLine", {
                    name: membership.displayName,
                    date: membership.joinedAt.toLocaleDateString(intlLocale),
                  })}
                  {rank != null &&
                  (membership.status === WaitlistMemberStatus.PENDING ||
                    membership.status === WaitlistMemberStatus.APPROVED)
                    ? t("rankApprox", { rank })
                    : null}
                  {refreshedRecently ? t("refreshedWithinTen") : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link
                  href={`/waitlists/${waitlist.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {tc("viewList")}
                </Link>
                {canRefresh ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={refreshing}
                    onClick={() => execRefresh({ waitlistId: waitlist.id })}
                  >
                    {t("refreshSelf")}
                  </Button>
                ) : (
                  <span className="text-muted-foreground self-center text-xs">
                    {t("refreshedShort")}
                    {nextRefreshAt
                      ? t("nextRefreshLine", { date: nextRefreshAt.toLocaleString(intlLocale) })
                      : null}
                  </span>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={leaving}
                  onClick={() => onLeave(waitlist.id)}
                >
                  {tc("leave")}
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="text-muted-foreground text-sm">{t("empty")}</p> : null}
    </div>
  )
}
