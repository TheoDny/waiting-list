"use client"

import { buttonVariants } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { VariantProps } from "class-variance-authority"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import * as React from "react"

interface SelectThemeButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export function SelectTheme(props: SelectThemeButtonProps) {
    const { setTheme } = useTheme()
    const t = useTranslations("Theme")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger openOnHover={true}>
                <div
                    className={buttonVariants({ variant: "outline", className: "self-center cursor-pointer" })}
                >
                    <HugeiconsIcon icon={Sun02Icon} className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <HugeiconsIcon icon={Moon02Icon} className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-24 flex flex-col items-center">
                <DropdownMenuItem className="cursor-pointer w-full" onClick={() => setTheme("light")}>{t("light")}</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer w-full" onClick={() => setTheme("dark")}>{t("dark")}</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer w-full" onClick={() => setTheme("system")}>{t("system")}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
