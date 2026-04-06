"use client"

import { Button, buttonVariants } from "@/components/ui/button"
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

interface ModeToggleButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export function ModeToggle(props: ModeToggleButtonProps) {
    const { setTheme } = useTheme()
    const t = useTranslations("Common")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger {...props}>
                <Button
                    variant="outline"
                    className="self-center cursor-pointer"
                    {...props}
                >
                    <HugeiconsIcon icon={Sun02Icon} className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <HugeiconsIcon icon={Moon02Icon} className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">{t("changeLanguage")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>system</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
