"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"

export function PublicWaitlistSearch({
  initialQuery,
  actionBasePath = "/waitlists",
}: {
  initialQuery: string
  actionBasePath?: string
}) {
  const router = useRouter()
  const t = useTranslations("Common")
  const [q, setQ] = useState(initialQuery)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams()
      if (q.trim()) params.set("q", q.trim())
      const suffix = params.toString()
      router.push(suffix ? `${actionBasePath}?${suffix}` : actionBasePath)
    })
  }

  return (
    <form onSubmit={submit} className="flex max-w-md gap-2">
      <Input
        placeholder={t("searchPlaceholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        name="q"
      />
      <Button type="submit" disabled={pending}>
        {t("search")}
      </Button>
    </form>
  )
}
