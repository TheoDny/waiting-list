"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()
  const t = useTranslations("Nav")
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        await authClient.signOut()
        router.push("/login")
        router.refresh()
      }}
    >
      {t("signOut")}
    </Button>
  )
}
