"use client"

import {
  deleteWaitlistManageAction,
  listAdminLogsAction,
  listAdminMembersAction,
  setMemberStatusAction,
} from "@/action/waiting-list-manage.action"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, intlLocaleFor } from "@/lib/utils"
import { useConfirm } from "@/provider/ConfirmationProvider"
import { useLocale, useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { WaitlistMemberStatus } from "../../generated/prisma/enums"

const MEMBER_STATUSES = ["PENDING", "APPROVED", "REFUSED"] as const

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x)
}

function isMemberStatus(s: string): s is (typeof MEMBER_STATUSES)[number] {
  return (MEMBER_STATUSES as readonly string[]).includes(s)
}

/** Human-friendly relative time (e.g. "2 hours ago" / "il y a 2 heures"). */
function formatRelativeTime(date: Date, intlLocale: string): string {
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSec = Math.round(diffMs / 1000)
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: "auto" })
  const absSec = Math.abs(diffSec)
  if (absSec < 60) return rtf.format(diffSec, "second")
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute")
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 48) return rtf.format(diffHour, "hour")
  const diffDay = Math.round(diffHour / 24)
  if (Math.abs(diffDay) < 60) return rtf.format(diffDay, "day")
  const diffMonth = Math.round(diffDay / 30)
  if (Math.abs(diffMonth) < 24) return rtf.format(diffMonth, "month")
  return rtf.format(Math.round(diffMonth / 12), "year")
}

const WAITLIST_LOG_FIELD_ORDER = ["name", "isPublic", "visibilityMode", "paused"] as const

function waitlistUpdateFieldLabel(key: string, t: (key: string) => string): string {
  switch (key) {
    case "name":
      return t("logField_name")
    case "isPublic":
      return t("logField_isPublic")
    case "visibilityMode":
      return t("logField_visibilityMode")
    case "paused":
      return t("logField_paused")
    default:
      return humanizeUnknownField(key)
  }
}

function sortWaitlistFieldKeys(keys: string[]): string[] {
  return [...new Set(keys)].sort((a, b) => {
    const ia = WAITLIST_LOG_FIELD_ORDER.indexOf(a as (typeof WAITLIST_LOG_FIELD_ORDER)[number])
    const ib = WAITLIST_LOG_FIELD_ORDER.indexOf(b as (typeof WAITLIST_LOG_FIELD_ORDER)[number])
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

function humanizeUnknownField(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

type AdminMember = {
  id: string
  displayName: string
  rank: number
  joinedAt: Date
  user: { email: string }
  status: string
}

type AdminLog = {
  id: string
  action: string
  payload: unknown
  createdAt: Date
  admin: { id: string; name: string; email: string }
}

type Props = { waitlistId: string; waitlistName: string }

export function AdminWaitlistClient({ waitlistId, waitlistName }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const intlLocale = intlLocaleFor(locale)
  const { confirm } = useConfirm()
  const t = useTranslations("WaitlistAdmin")
  const tc = useTranslations("Common")
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REFUSED" | "LOGS">("PENDING")
  const [members, setMembers] = useState<AdminMember[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])

  const { execute: loadMembers, executeAsync: loadMembersAsync, isExecuting: loadingMembers } = useAction(
    listAdminMembersAction,
    {
      onSuccess: ({ data }) => {
        if (data?.members) setMembers(data.members as AdminMember[])
      },
      onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
    }
  )

  const { execute: loadLogs, executeAsync: loadLogsAsync, isExecuting: loadingLogs } = useAction(
    listAdminLogsAction,
    {
      onSuccess: ({ data }) => {
        if (data?.logs) setLogs(data.logs as AdminLog[])
      },
      onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
    }
  )

  const { execute: setStatus, isExecuting: setting } = useAction(setMemberStatusAction, {
    onSuccess: () => {
      toast.success(t("toastStatus"))
      if (tab !== "LOGS") loadMembers({ waitlistId, status: tab })
      void loadLogsAsync({ waitlistId })
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  const { execute: execDelete, isExecuting: deleting } = useAction(deleteWaitlistManageAction, {
    onSuccess: () => {
      toast.success(t("toastDeleted"))
      router.push("/waitlists/mine")
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  useEffect(() => {
    void loadMembersAsync({ waitlistId, status: "PENDING" })
  }, [waitlistId])

  function onTabChange(v: string) {
    const next = v as typeof tab
    setTab(next)
    if (next === "LOGS") {
      loadLogs({ waitlistId })
    } else {
      loadMembers({ waitlistId, status: next })
    }
  }

  async function changeStatus(memberId: string, next: (typeof WaitlistMemberStatus)[keyof typeof WaitlistMemberStatus]) {
    const title =
      next === WaitlistMemberStatus.APPROVED
        ? t("confirmApproveTitle")
        : next === WaitlistMemberStatus.REFUSED
          ? t("confirmRejectTitle")
          : t("confirmPendingTitle")
    const ok = await confirm(title, "")
    if (!ok) return
    setStatus({ waitlistId, memberId, nextStatus: next })
  }

  async function onDeleteList() {
    const ok = await confirm(t("deleteConfirmTitle"), "")
    if (!ok) return
    execDelete({ waitlistId })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title", { name: waitlistName })}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/waitlists/${waitlistId}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {tc("viewList")}
          </Link>
          <Button type="button" variant="destructive" size="sm" disabled={deleting} onClick={onDeleteList}>
            {t("deleteList")}
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList className="flex w-full flex-wrap gap-1">
          <TabsTrigger value="PENDING">{t("tabPending")}</TabsTrigger>
          <TabsTrigger value="APPROVED">{t("tabApproved")}</TabsTrigger>
          <TabsTrigger value="REFUSED">{t("tabRejected")}</TabsTrigger>
          <TabsTrigger value="LOGS">{t("tabLog")}</TabsTrigger>
        </TabsList>
        <TabsContent value="PENDING" className="mt-4 space-y-2">
          {loadingMembers ? (
            <p className="text-muted-foreground text-sm">{tc("loading")}</p>
          ) : (
            <MemberTable
              members={members}
              tab={tab}
              intlLocale={intlLocale}
              setting={setting}
              onStatus={changeStatus}
            />
          )}
        </TabsContent>
        <TabsContent value="APPROVED" className="mt-4 space-y-2">
          {loadingMembers ? (
            <p className="text-muted-foreground text-sm">{tc("loading")}</p>
          ) : (
            <MemberTable
              members={members}
              tab={tab}
              intlLocale={intlLocale}
              setting={setting}
              onStatus={changeStatus}
            />
          )}
        </TabsContent>
        <TabsContent value="REFUSED" className="mt-4 space-y-2">
          {loadingMembers ? (
            <p className="text-muted-foreground text-sm">{tc("loading")}</p>
          ) : (
            <MemberTable
              members={members}
              tab={tab}
              intlLocale={intlLocale}
              setting={setting}
              onStatus={changeStatus}
            />
          )}
        </TabsContent>
        <TabsContent value="LOGS" className="mt-4 space-y-2">
          {loadingLogs ? (
            <p className="text-muted-foreground text-sm">{tc("loading")}</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("emptyLog")}</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log) => (
                <AdminLogListItem key={log.id} log={log} intlLocale={intlLocale} />
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AdminLogListItem({ log, intlLocale }: { log: AdminLog; intlLocale: string }) {
  const t = useTranslations("WaitlistAdmin")
  const tm = useTranslations("MemberStatus")

  const created = new Date(log.createdAt)
  const absolute = created.toLocaleString(intlLocale, { dateStyle: "medium", timeStyle: "short" })
  const relative = formatRelativeTime(created, intlLocale)

  let title: string
  let summary: string | null = null

  if (log.action === "member_status" && isRecord(log.payload)) {
    title = t("logTitleMemberStatus")
    const fromRaw = log.payload.from
    const toRaw = log.payload.to
    const fromStr = typeof fromRaw === "string" && isMemberStatus(fromRaw) ? tm(fromRaw) : String(fromRaw ?? "—")
    const toStr = typeof toRaw === "string" && isMemberStatus(toRaw) ? tm(toRaw) : String(toRaw ?? "—")
    summary = t("logMemberStatusLine", { from: fromStr, to: toStr })
  } else if (log.action === "waitlist_update" && isRecord(log.payload)) {
    title = t("logTitleWaitlistUpdate")
    const fieldsRaw = log.payload.fields
    const keys = Array.isArray(fieldsRaw)
      ? fieldsRaw.filter((x): x is string => typeof x === "string")
      : []
    const ordered = sortWaitlistFieldKeys(keys)
    const labels = ordered.map((key) => waitlistUpdateFieldLabel(key, t))
    summary = labels.length > 0 ? t("logWaitlistFieldsLine", { fields: labels.join(", ") }) : null
  } else {
    title = t("logUnknownAction", { action: humanizeUnknownField(log.action) })
  }

  const rawJson =
    log.payload != null ? JSON.stringify(log.payload, null, 2) : null

  return (
    <li>
      <Card>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug">{title}</p>
              {summary ? <p className="text-muted-foreground text-sm leading-snug">{summary}</p> : null}
              <p className="text-muted-foreground text-xs">
                {t("byAdmin", { name: log.admin.name, email: log.admin.email })}
              </p>
            </div>
            <div className="text-muted-foreground shrink-0 text-right text-xs">
              <time dateTime={created.toISOString()} title={created.toISOString()}>
                {absolute}
              </time>
              <p className="text-muted-foreground/80 mt-0.5">{relative}</p>
            </div>
          </div>
          {rawJson ? (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                {t("logTechnicalDetails")}
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-muted p-2 font-mono text-[11px] leading-relaxed">
                {rawJson}
              </pre>
            </details>
          ) : null}
        </CardContent>
      </Card>
    </li>
  )
}

function MemberTable({
  members,
  tab,
  intlLocale,
  setting,
  onStatus,
}: {
  members: AdminMember[]
  tab: string
  intlLocale: string
  setting: boolean
  onStatus: (id: string, s: (typeof WaitlistMemberStatus)[keyof typeof WaitlistMemberStatus]) => void
}) {
  const t = useTranslations("WaitlistAdmin")
  const tm = useTranslations("MemberStatus")

  if (members.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("emptyTab")}</p>
  }
  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li key={m.id}>
          <Card>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  {m.displayName}{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    {t("rankShort", { rank: m.rank, email: m.user.email })}
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("enrolledOnAdmin", {
                    date: new Date(m.joinedAt).toLocaleString(intlLocale),
                    status: tm(m.status as "PENDING" | "APPROVED" | "REFUSED"),
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tab === "PENDING" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      disabled={setting}
                      onClick={() => onStatus(m.id, WaitlistMemberStatus.APPROVED)}
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={setting}
                      onClick={() => onStatus(m.id, WaitlistMemberStatus.REFUSED)}
                    >
                      {t("reject")}
                    </Button>
                  </>
                ) : null}
                {tab === "APPROVED" || tab === "REFUSED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={setting}
                    onClick={() => onStatus(m.id, WaitlistMemberStatus.PENDING)}
                  >
                    {t("setPending")}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
