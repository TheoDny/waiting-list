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
  const tm = useTranslations("MemberStatus")
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
      router.refresh()
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
                <li key={log.id}>
                  <Card>
                    <CardContent className="py-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(log.createdAt).toLocaleString(intlLocale)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {t("byAdmin", { name: log.admin.name, email: log.admin.email })}
                      </p>
                      {log.payload != null ? (
                        <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-muted p-2 text-xs">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
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
            <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
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
