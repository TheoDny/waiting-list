"use client"

import { buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Globe02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { VariantProps } from "class-variance-authority"
import { useLocale, useTranslations } from "next-intl"
import * as React from "react"

interface LanguageSelectorProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    showText?: boolean
    /** Sur mobile, désactiver l’ouverture au survol pour un menu utilisable au doigt. */
    openOnHover?: boolean
    languages?: Array<{ code: string }>
}

// Default supported languages
const defaultLanguages = [
    { code: "en" },
    { code: "fr" },
]

export function LanguageSelector({
    showText = true,
    openOnHover = true,
    languages = defaultLanguages,
    className,
}: LanguageSelectorProps) {
    const currentLocale = useLocale()
    const t = useTranslations("Language")

    // Get current language display name
    const currentLanguage = t(languages.find((lang) => lang.code === currentLocale)?.code as "en" | "fr") || currentLocale

    // Change language handler
    const changeLanguage = (locale: string) => {
        // Set the cookie
        document.cookie = `NEXT_LOCALE=${locale}; path=/`

        // Reload the page to apply the new language
        window.location.href = window.location.pathname
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger openOnHover={openOnHover}>
                <div
                    className={cn(
                        buttonVariants({
                            variant: "outline",
                            size: showText ? "default" : "icon-sm",
                            className: "flex items-center gap-2",
                        }),
                        className,
                    )}
                    aria-label={!showText ? t("ariaLabel") : undefined}
                >
                    <HugeiconsIcon icon={Globe02Icon} className="size-4" />
                    {showText && <span>{currentLanguage}</span>}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-24 flex flex-col items-center">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={cn(lang.code === currentLocale ? "bg-accent" : "", "cursor-pointer w-full")}
                    >
                        {t(lang.code)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
