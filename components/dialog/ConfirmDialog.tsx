"use client"

import type { ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useTranslations } from "next-intl"

type Props = {
  open: boolean
  title?: ReactNode
  description?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: Props) {
  const t = useTranslations("Common")
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title != null && title !== "" && (
            <AlertDialogTitle className="sm:text-left">{title}</AlertDialogTitle>
          )}
          {description != null && description !== "" && (
            <AlertDialogDescription className="sm:text-left">{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("confirm")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
