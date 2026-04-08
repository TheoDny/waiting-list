"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useConfirm } from "@/provider/ConfirmationProvider"
import {
  createWaitlistAction,
  deleteWaitlistAction,
  updateWaitlistAction,
} from "@/action/waiting-list.action"
import { WaitlistVisibilityMode } from "../../generated/prisma/enums"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { MAX_WAITLIST_DESCRIPTION_LENGTH } from "@/lib/waitlist-config"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { useState } from "react"

type Row = {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  paused: boolean
  visibilityMode: (typeof WaitlistVisibilityMode)[keyof typeof WaitlistVisibilityMode]
  joinCode: string | null
  _count: { members: number }
}

type Initial = {
  rows: Row[]
  limit: number | null
  superAdmin: boolean
}

export function MineWaitlistsClient({ initial }: { initial: Initial }) {
  const router = useRouter()
  const { confirm } = useConfirm()
  const t = useTranslations("WaitlistMine")
  const tc = useTranslations("Common")
  const tb = useTranslations("WaitlistBadge")
  const [createOpen, setCreateOpen] = useState(false)
  const [editRow, setEditRow] = useState<Row | null>(null)
  const [editPaused, setEditPaused] = useState(false)

  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formPublic, setFormPublic] = useState(true)
  const [formVis, setFormVis] = useState<(typeof WaitlistVisibilityMode)[keyof typeof WaitlistVisibilityMode]>(
    WaitlistVisibilityMode.VIEW_ALL
  )

  const { execute: execCreate, isExecuting: creating } = useAction(createWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastCreated"))
      setCreateOpen(false)
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  const { execute: execUpdate, isExecuting: updating } = useAction(updateWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastUpdated"))
      setEditRow(null)
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  const { execute: execDelete, isExecuting: deleting } = useAction(deleteWaitlistAction, {
    onSuccess: () => {
      toast.success(t("toastDeleted"))
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  const count = initial.rows.length
  const max = initial.limit
  const atCap = max != null && count >= max

  function openCreate() {
    setFormName("")
    setFormDescription("")
    setFormPublic(true)
    setFormVis(WaitlistVisibilityMode.VIEW_ALL)
    setCreateOpen(true)
  }

  function openEdit(row: Row) {
    setEditRow(row)
    setFormName(row.name)
    setFormDescription(row.description ?? "")
    setFormPublic(row.isPublic)
    setFormVis(row.visibilityMode)
    setEditPaused(row.paused)
  }

  async function onDelete(id: string) {
    const ok = await confirm(t("deleteTitle"), t("deleteDescription"))
    if (!ok) return
    execDelete({ waitlistId: id })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {initial.superAdmin
              ? t("limitSuper")
              : t("limitCount", {
                  count,
                  max: max != null ? t("limitMax", { max }) : "",
                })}
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={atCap && !initial.superAdmin}>
          {t("newList")}
        </Button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {initial.rows.map((w) => (
          <li key={w.id}>
            <Card>
              <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{w.name}</CardTitle>
                  {w.paused ? <Badge variant="secondary">{tb("pauseShort")}</Badge> : null}
                </div>
                <CardDescription>
                  {(w.isPublic ? tb("public") : tb("private")) +
                    " · " +
                    w._count.members +
                    " " +
                    tc("members")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(w)}>
                  {tc("edit")}
                </Button>
                <Link href={`/waitlists/${w.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {tc("view")}
                </Link>
                <Link
                  href={`/admin/waitlists/${w.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  {tc("admin")}
                </Link>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={() => onDelete(w.id)}
                >
                  {tc("delete")}
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {initial.rows.length === 0 ? <p className="text-muted-foreground text-sm">{t("empty")}</p> : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogCreateTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("uniqueName")}</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("descriptionLabel")}</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={4}
                maxLength={MAX_WAITLIST_DESCRIPTION_LENGTH}
                aria-describedby="waitlist-desc-hint-create"
              />
              <p id="waitlist-desc-hint-create" className="text-muted-foreground text-xs">
                {t("descriptionHint", { max: MAX_WAITLIST_DESCRIPTION_LENGTH })}
              </p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label>{t("publicList")}</Label>
              <Switch checked={formPublic} onCheckedChange={setFormPublic} />
            </div>
            <div className="space-y-2">
              <Label>{t("visibilityLabel")}</Label>
              <RadioGroup value={formVis} onValueChange={(v) => setFormVis(v as typeof formVis)}>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={WaitlistVisibilityMode.VIEW_ALL} />
                  {t("visibilityAll")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={WaitlistVisibilityMode.VIEW_YOURSELF} />
                  {t("visibilitySelf")}
                </label>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={creating || !formName.trim()}
              onClick={() =>
                execCreate({
                  name: formName.trim(),
                  description: formDescription,
                  isPublic: formPublic,
                  visibilityMode: formVis,
                })
              }
            >
              {tc("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogEditTitle")}</DialogTitle>
          </DialogHeader>
          {editRow ? (
            <>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{tc("name")}</Label>
                  <Input value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("descriptionLabel")}</Label>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                    maxLength={MAX_WAITLIST_DESCRIPTION_LENGTH}
                    aria-describedby="waitlist-desc-hint-edit"
                  />
                  <p id="waitlist-desc-hint-edit" className="text-muted-foreground text-xs">
                    {t("descriptionHint", { max: MAX_WAITLIST_DESCRIPTION_LENGTH })}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label>{t("publicList")}</Label>
                  <Switch checked={formPublic} onCheckedChange={setFormPublic} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label>{t("pauseSignup")}</Label>
                  <Switch checked={editPaused} onCheckedChange={setEditPaused} />
                </div>
                <div className="space-y-2">
                  <Label>{t("displayShort")}</Label>
                  <RadioGroup value={formVis} onValueChange={(v) => setFormVis(v as typeof formVis)}>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={WaitlistVisibilityMode.VIEW_ALL} />
                      {t("visibilityFull")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={WaitlistVisibilityMode.VIEW_YOURSELF} />
                      {t("visibilityPersonal")}
                    </label>
                  </RadioGroup>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  disabled={updating || !formName.trim()}
                  onClick={() =>
                    execUpdate({
                      waitlistId: editRow.id,
                      name: formName.trim(),
                      description: formDescription,
                      isPublic: formPublic,
                      visibilityMode: formVis,
                      paused: editPaused,
                    })
                  }
                >
                  {tc("save")}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
