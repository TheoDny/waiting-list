"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { authPost } from "@/lib/auth-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export function LoginForm() {
  const router = useRouter()
  const t = useTranslations("Auth")
  const tc = useTranslations("Common")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onPasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/waitlists",
      })
      if (error) {
        toast.error(error.message || t("toastLoginFailed"))
        return
      }
      toast.success(t("toastConnected"))
      router.push("/waitlists")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"))
    } finally {
      setLoading(false)
    }
  }

  async function onSendOtp() {
    setLoading(true)
    try {
      await authPost("/email-otp/send-verification-otp", {
        email: email.trim(),
        type: "sign-in",
      })
      setOtpSent(true)
      toast.success(t("toastCodeSent"))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"))
    } finally {
      setLoading(false)
    }
  }

  async function onOtpLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await authPost("/sign-in/email-otp", {
        email: email.trim(),
        otp: otp.trim(),
      })
      toast.success(t("toastConnected"))
      router.push("/waitlists")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="password">
          <TabsList className="w-full">
            <TabsTrigger value="password" className="flex-1">
              {t("tabPassword")}
            </TabsTrigger>
            <TabsTrigger value="otp" className="flex-1">
              {t("tabOtp")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="password" className="mt-4">
            <form onSubmit={onPasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{tc("email")}</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{tc("password")}</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {t("signIn")}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="otp" className="mt-4">
            <form onSubmit={onOtpLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-email">{tc("email")}</Label>
                <Input
                  id="otp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!otpSent ? (
                <Button type="button" className="w-full" disabled={loading} onClick={onSendOtp}>
                  {t("sendCode")}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp-code">{t("otpCode")}</Label>
                    <Input
                      id="otp-code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {t("verifyCode")}
                  </Button>
                </>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
