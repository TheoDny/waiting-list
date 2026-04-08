import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function intlLocaleFor(nextIntlLocale: string): string {
  if (nextIntlLocale === "fr") return "fr-FR"
  return "en-US"
}

export function getSafeRedirectPath(
  raw: string | null | undefined
): string | undefined {
  if (raw == null || typeof raw !== "string") return undefined

  const trimmed = raw.trim()
  if (trimmed === "") return undefined
  if (!trimmed.startsWith("/")) return undefined
  if (trimmed.startsWith("//")) return undefined
  if (trimmed.includes("://")) return undefined
  return trimmed
}