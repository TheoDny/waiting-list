"use client"

import { LoginForm } from "@/components/auth/login-form";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getSafeRedirectPath } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RegisterForm } from "../auth/register-form";

export function AuthDialog() {
  const [authAction, setAuthAction] = useState<"login" | "register">("login")
  const t = useTranslations("Auth")

  const pathname = usePathname()
  let callbackUrl: string | undefined
  if (!pathname.startsWith("/login") && !pathname.startsWith("/register")) {
    callbackUrl = getSafeRedirectPath(pathname)
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div id="login-dialog-trigger" className={buttonVariants({ variant: "outline" })}>{t("signIn")}</div>
      </DialogTrigger>
      <DialogContent>
        {authAction === "login" ? 
        <>
          <DialogHeader>
            <DialogTitle>{t("signInToApp")}</DialogTitle>
          </DialogHeader>
          <LoginForm callbackUrl={callbackUrl} />
          <p className="text-muted-foreground text-center text-sm">
            {t("noAccount")}{" "}
            <span 
            onClick={() => setAuthAction("register")}
            className="text-primary font-medium underline-offset-4 hover:underline">
              {t("createAccount")}
            </span>
            </p>
        </> 
          : 
        <>
          <DialogHeader>
            <DialogTitle>{t("registerTitle")}</DialogTitle>
          </DialogHeader>
          <RegisterForm callbackUrl={callbackUrl} />
            <p className="text-muted-foreground text-center text-sm">
              {t("hasAccount")}{" "}
              <span
                onClick={() => setAuthAction("login")}
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                {t("signInLink")}
              </span>
            </p>
        </>}
      </DialogContent>

    </Dialog>
  )
}