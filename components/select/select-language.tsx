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
    languages?: Array<{ code: string }>
}

// Default supported languages
const defaultLanguages = [
    { code: "en" },
    { code: "fr" },
]

export function LanguageSelector({
    showText = true,
    languages = defaultLanguages,
    ...props
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
            <DropdownMenuTrigger openOnHover={true}>
                <div
                    className={buttonVariants({ variant: "outline", className: "flex gap-2 items-center" })}
                >
                    <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                    {showText && <span className="">{currentLanguage}</span>}
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
