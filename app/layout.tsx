
import { cn } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialogProvider } from "@/provider/ConfirmationProvider";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Waiting List"
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <head>
        <title>{appName}</title>
        <link
          rel="icon"
          href="/favicon.svg"
        />
      </head>
      <body>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={100}>
            <NextIntlClientProvider>
              <ConfirmDialogProvider>
                {children}
              </ConfirmDialogProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
