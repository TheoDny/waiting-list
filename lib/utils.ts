import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function intlLocaleFor(nextIntlLocale: string): string {
  if (nextIntlLocale === "fr") return "fr-FR"
  return "en-US"
}

export function getSafeRedirectPath(raw: string | null | undefined): string {
  if (raw == null || typeof raw !== "string") return "waitlists"
  const trimmed = raw.trim()
  if (!trimmed.startsWith("/")) return "waitlists"
  if (trimmed.startsWith("//")) return "waitlists"
  if (trimmed.includes("://")) return "waitlists"
  return trimmed
}