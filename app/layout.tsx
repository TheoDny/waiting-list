
import { cn } from "@/lib/utils";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";

import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/sonner";
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
  const messages = await getMessages()
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
      <body className="bg-background min-h-dvh">
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={100}>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ConfirmDialogProvider>
                <AppHeader />
                <main className="mx-auto max-w-5xl px-4 py-8">
                  {children}
                </main>
                <Toaster richColors closeButton position="top-center" />
              </ConfirmDialogProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </NextThemesProvider>
      </body>
    </html>
  )
}
