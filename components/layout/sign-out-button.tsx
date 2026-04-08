"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useConfirm } from "@/provider/ConfirmationProvider"
import { Logout01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export type SignOutButtonProps = {
  /** Bouton icône seulement (barre mobile). */
  compact?: boolean
}

export function SignOutButton({ compact = false }: SignOutButtonProps) {
  const router = useRouter()
  const tAuth = useTranslations("Auth")
  const label = tAuth("signOut")
  const { confirm } = useConfirm()

  return (
    <Button
      variant="outline"
      type="button"
      size={compact ? "icon-sm" : "default"}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      onClick={async () => {
        if (compact) {
          const ok = await confirm(tAuth("signOutConfirmTitle"), tAuth("signOutConfirmDescription"))
          if (!ok) return
        }
        await authClient.signOut()
        router.push("/")
        router.refresh()
      }}
    >
      {compact ? (
        <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} className="size-4" />
      ) : (
        label
      )}
    </Button>
  )
}
