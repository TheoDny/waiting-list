/**
 * Sends transactional e-mails via SMTP (see `lib/smtp.ts`).
 * Gabarits React Email dans `emails/` ; libellés via `next-intl` (namespace `Email`).
 */
import {
  getOtpEmailHtml,
  type AuthOtpType,
  type OtpEmailCopy,
} from "@/emails/otp-email"
import {
  waitlistApprovedHtml,
  waitlistJoinConfirmationHtml,
  waitlistRefreshConfirmationHtml,
  waitlistRejectedHtml,
  type WaitlistApprovedCopy,
  type WaitlistJoinCopy,
  type WaitlistRefreshCopy,
  type WaitlistRejectedCopy,
} from "@/emails/waitlist-email"
import { IMPLEMENTED_LOCALE } from "@/i18n/request"
import { getSmtpTransport } from "@/lib/smtp"
import { getLocale, getTranslations } from "next-intl/server"

export type SendMailInput = {
  to: string
  subject: string
  html: string
  text?: string
}

async function getEmailTranslator() {
  let locale = "en"
  try {
    const raw = await getLocale()
    if (IMPLEMENTED_LOCALE.includes(raw)) {
      locale = raw
    }
  } catch {
    /* hors requête Next (tests, scripts) */
  }
  const t = await getTranslations({ locale, namespace: "Email" })
  return t
}

function buildOtpEmailCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Email">>>,
  otp: string,
  type: AuthOtpType
): OtpEmailCopy {
  const subjectKey = `otp.subject.${type}` as
    | "otp.subject.sign-in"
    | "otp.subject.email-verification"
    | "otp.subject.forget-password"
    | "otp.subject.change-email"
  const introKey = `otp.intro.${type}` as
    | "otp.intro.sign-in"
    | "otp.intro.email-verification"
    | "otp.intro.forget-password"
    | "otp.intro.change-email"
  const subject = t(subjectKey)
  return {
    subject,
    intro: t(introKey),
    disclaimer: t("otp.disclaimer"),
    preview: t("otp.preview", { subject, code: otp }),
  }
}

function buildWaitlistJoinCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Email">>>,
  displayName: string
): WaitlistJoinCopy {
  return {
    preview: t("waitlist.join.preview"),
    title: t("waitlist.join.title"),
    heading: t("waitlist.join.heading"),
    greeting: t("waitlist.greeting", { displayName }),
    bodyBefore: t("waitlist.join.bodyBefore"),
    bodyAfter: t("waitlist.join.bodyAfter"),
  }
}

function buildWaitlistRefreshCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Email">>>,
  displayName: string
): WaitlistRefreshCopy {
  return {
    preview: t("waitlist.refresh.preview"),
    title: t("waitlist.refresh.title"),
    heading: t("waitlist.refresh.heading"),
    greeting: t("waitlist.greeting", { displayName }),
    bodyBefore: t("waitlist.refresh.bodyBefore"),
    bodyAfter: t("waitlist.refresh.bodyAfter"),
  }
}

function buildWaitlistApprovedCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Email">>>,
  displayName: string
): WaitlistApprovedCopy {
  return {
    preview: t("waitlist.approved.preview"),
    title: t("waitlist.approved.title"),
    heading: t("waitlist.approved.heading"),
    greeting: t("waitlist.greeting", { displayName }),
    bodyBefore: t("waitlist.approved.bodyBefore"),
    bodyMid: t("waitlist.approved.bodyMid"),
    highlight: t("waitlist.approved.highlight"),
    bodyAfter: t("waitlist.approved.bodyAfter"),
  }
}

function buildWaitlistRejectedCopy(
  t: Awaited<ReturnType<typeof getTranslations<"Email">>>,
  displayName: string
): WaitlistRejectedCopy {
  return {
    preview: t("waitlist.rejected.preview"),
    title: t("waitlist.rejected.title"),
    heading: t("waitlist.rejected.heading"),
    greeting: t("waitlist.greeting", { displayName }),
    bodyBefore: t("waitlist.rejected.bodyBefore"),
    bodyMid: t("waitlist.rejected.bodyMid"),
    highlight: t("waitlist.rejected.highlight"),
    bodyAfter: t("waitlist.rejected.bodyAfter"),
  }
}

/**
 * Sends a single HTML e-mail. Uses `SMTP_FROM` when set.
 */
export async function sendMail(input: SendMailInput): Promise<void> {
  const transport = getSmtpTransport()
  const from = process.env.SMTP_FROM
  if (!from) {
    throw new Error("Missing SMTP_FROM")
  }
  await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  })
}

/**
 * Sends OTP e-mails for Better Auth (`emailOTP` plugin).
 */
export async function sendAuthOtpEmail(
  email: string,
  otp: string,
  type: AuthOtpType
): Promise<void> {
  const t = await getEmailTranslator()
  const copy = buildOtpEmailCopy(t, otp, type)
  const html = await getOtpEmailHtml(otp, copy)
  await sendMail({
    to: email,
    subject: copy.subject,
    html,
    text: t("otp.plainText", { code: otp }),
  })
}

export async function sendWaitlistJoinConfirmation(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  const t = await getEmailTranslator()
  const copy = buildWaitlistJoinCopy(t, params.displayName)
  const html = await waitlistJoinConfirmationHtml({ waitlistName: params.waitlistName, copy })
  await sendMail({
    to: email,
    subject: t("waitlist.subject.join", { waitlistName: params.waitlistName }),
    html,
  })
}

export async function sendWaitlistRefreshConfirmation(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  const t = await getEmailTranslator()
  const copy = buildWaitlistRefreshCopy(t, params.displayName)
  const html = await waitlistRefreshConfirmationHtml({ waitlistName: params.waitlistName, copy })
  await sendMail({
    to: email,
    subject: t("waitlist.subject.refresh", { waitlistName: params.waitlistName }),
    html,
  })
}

export async function sendWaitlistApprovedEmail(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  const t = await getEmailTranslator()
  const copy = buildWaitlistApprovedCopy(t, params.displayName)
  const html = await waitlistApprovedHtml({ waitlistName: params.waitlistName, copy })
  await sendMail({
    to: email,
    subject: t("waitlist.subject.approved", { waitlistName: params.waitlistName }),
    html,
  })
}

export async function sendWaitlistRejectedEmail(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  const t = await getEmailTranslator()
  const copy = buildWaitlistRejectedCopy(t, params.displayName)
  const html = await waitlistRejectedHtml({ waitlistName: params.waitlistName, copy })
  await sendMail({
    to: email,
    subject: t("waitlist.subject.rejected", { waitlistName: params.waitlistName }),
    html,
  })
}
