"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { VariantProps } from "class-variance-authority"
import { useLocale } from "next-intl"
import * as React from "react"

interface LanguageSelectorProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
    showText?: boolean
    languages?: Array<{ code: string; name: string }>
}

// Default supported languages
const defaultLanguages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
]

export function LanguageSelector({
    showText = true,
    languages = defaultLanguages,
    ...props
}: LanguageSelectorProps) {
    const currentLocale = useLocale()

    // Get current language display name
    const currentLanguage = languages.find((lang) => lang.code === currentLocale)?.name || currentLocale

    // Change language handler
    const changeLanguage = (locale: string) => {
        // Set the cookie
        document.cookie = `NEXT_LOCALE=${locale}; path=/`

        // Reload the page to apply the new language
        window.location.href = window.location.pathname
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger {...props}>
                <Button
                    variant="outline"
                    className="flex gap-2 items-center"
                    {...props}
                >
                    <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                    {showText && <span className="">{currentLanguage}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={lang.code === currentLocale ? "bg-accent" : ""}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
