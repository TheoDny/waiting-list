"use client"

import { updateProfileNameAction } from "@/action/user.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

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
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)

  const { execute: saveName, isExecuting: savingName } = useAction(updateProfileNameAction, {
    onSuccess: () => {
      toast.success(t("toastNameSaved"))
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? tc("error")),
  })

  async function requestEmailChange() {
    setEmailLoading(true)

    setEmailStep("sent")
    const { data, error } = await authClient.emailOtp.requestEmailChange({
      newEmail: newEmail.trim(),
    });
    setEmailLoading(false)

    if (error) {
      toast.error(error.message || tc("error"))
      return
    }

    toast.success(t("toastCodeSent"))
  }

  async function confirmEmailChange() {
    setEmailLoading(true)

    const { data, error } = await authClient.emailOtp.changeEmail({
      newEmail: newEmail.trim(),
      otp: emailOtp.trim(),
    });

    setEmailLoading(false)
    if (error) {
      toast.error(error.message || tc("error"))
      return
    }

    toast.success(t("toastEmailUpdated"))
    setEmailStep("idle")
    setNewEmail("")
    setEmailOtp("")
    router.refresh()
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"))
      return
    }
    setPasswordLoading(true)

    const { data, error } = await authClient.changePassword({
      newPassword: newPassword, // required
      currentPassword: currentPassword, // required
      revokeOtherSessions: true,
    });

    setPasswordLoading(false)
    if (error) {
      toast.error(error.message || tc("error"))
      return
    }

    toast.success(t("toastPasswordUpdated"))
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    router.refresh()
  }


  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="space-y-4">
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t("confirmNewPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={
              passwordLoading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            onClick={changePassword}
          >
            {t("savePassword")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
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
              <InputOTP
                id="emailOtp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={emailOtp}
                onChange={(value) => setEmailOtp(value)}
                maxLength={6}
                required
                className="w-full"
              >
                <InputOTPGroup className="w-full justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
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
