"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { updateProfileNameAction } from "@/action/user.action"
import { authPost } from "@/lib/auth-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useState } from "react"

type User = {
  id: string
  name: string
  email: string
  emailVerified: boolean
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const t = useTranslations("Profile")
  const tc = useTranslations("Common")
  const [name, setName] = useState(user.name)
  const [newEmail, setNewEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [emailStep, setEmailStep] = useState<"idle" | "sent">("idle")
  const [emailLoading, setEmailLoading] = useState(false)

  const { execute: saveName, isExecuting: savingName } = useAction(updateProfileNameAction, {
    onSuccess: () => {
      toast.success(t("toastNameSaved"))
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  async function requestEmailChange() {
    setEmailLoading(true)
    try {
      await authPost("/email-otp/request-email-change", { newEmail: newEmail.trim() })
      setEmailStep("sent")
      toast.success(t("toastCodeSent"))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tc("error"))
    } finally {
      setEmailLoading(false)
    }
  }

  async function confirmEmailChange() {
    setEmailLoading(true)
    try {
      await authPost("/email-otp/change-email", {
        newEmail: newEmail.trim(),
        otp: emailOtp.trim(),
      })
      toast.success(t("toastEmailUpdated"))
      setEmailStep("idle")
      setNewEmail("")
      setEmailOtp("")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : tc("error"))
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">{tc("pseudo")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button type="button" disabled={savingName || !name.trim()} onClick={() => saveName({ name })}>
            {t("savePseudo")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <p className="text-muted-foreground text-sm">
            {t("currentEmail")} <span className="text-foreground font-medium">{user.email}</span>
            {user.emailVerified ? ` ${tc("verified")}` : ""}
          </p>
          <div className="space-y-2">
            <Label htmlFor="newEmail">{t("newEmail")}</Label>
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={emailStep === "sent"}
            />
          </div>
          {emailStep === "sent" ? (
            <div className="space-y-2">
              <Label htmlFor="emailOtp">{t("codeReceived")}</Label>
              <Input id="emailOtp" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
            </div>
          ) : null}
          {emailStep === "idle" ? (
            <Button
              type="button"
              variant="secondary"
              disabled={emailLoading || !newEmail.trim() || newEmail.trim().toLowerCase() === user.email.toLowerCase()}
              onClick={requestEmailChange}
            >
              {t("sendCode")}
            </Button>
          ) : (
            <Button type="button" disabled={emailLoading || !emailOtp.trim()} onClick={confirmEmailChange}>
              {t("confirmNewEmail")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
