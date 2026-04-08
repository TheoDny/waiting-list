"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()
  const tAuth = useTranslations("Auth")
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
    >
      {tAuth("signOut")}
    </Button>
  )
}
