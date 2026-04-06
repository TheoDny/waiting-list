import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function intlLocaleFor(nextIntlLocale: string): string {
  if (nextIntlLocale === "fr") return "fr-FR"
  return "en-US"
}