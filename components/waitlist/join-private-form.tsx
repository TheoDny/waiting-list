"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { resolveJoinCodeAction } from "@/action/waiting-list.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export function JoinPrivateForm() {
  const router = useRouter()
  const t = useTranslations("WaitlistJoinPrivate")
  const tc = useTranslations("Common")
  const [code, setCode] = useState("")
  const { execute, isExecuting } = useAction(resolveJoinCodeAction, {
    onSuccess: ({ data }) => {
      if (!data?.waitlistId) {
        toast.error(t("unknownCode"))
        return
      }
      router.push(`/waitlists/${data.waitlistId}?code=${encodeURIComponent(code.trim().toUpperCase())}`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? tc("error"))
    },
  })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    execute({ code: code.trim() })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{tc("code")}</Label>
            <Input
              id="code"
              className="font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isExecuting}>
            {t("submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
