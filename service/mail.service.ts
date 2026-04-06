/**
 * Sends transactional e-mails via SMTP (see `lib/smtp.ts`).
 * Templates live in `emails/`.
 */
import { getOtpEmailHtml, getOtpEmailSubject, type AuthOtpType } from "@/emails/otp-email"
import {
  waitlistApprovedHtml,
  waitlistJoinConfirmationHtml,
  waitlistRefreshConfirmationHtml,
  waitlistRejectedHtml,
} from "@/emails/waitlist-email"
import { getSmtpTransport } from "@/lib/smtp"

export type SendMailInput = {
  to: string
  subject: string
  html: string
  text?: string
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
  await sendMail({
    to: email,
    subject: getOtpEmailSubject(type),
    html: getOtpEmailHtml(otp, type),
    text: `Code : ${otp}`,
  })
}

export async function sendWaitlistJoinConfirmation(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  await sendMail({
    to: email,
    subject: `Inscription : ${params.waitlistName}`,
    html: waitlistJoinConfirmationHtml(params),
  })
}

export async function sendWaitlistRefreshConfirmation(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  await sendMail({
    to: email,
    subject: `Actualisation : ${params.waitlistName}`,
    html: waitlistRefreshConfirmationHtml(params),
  })
}

export async function sendWaitlistApprovedEmail(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  await sendMail({
    to: email,
    subject: `Validé : ${params.waitlistName}`,
    html: waitlistApprovedHtml(params),
  })
}

export async function sendWaitlistRejectedEmail(
  email: string,
  params: { waitlistName: string; displayName: string }
): Promise<void> {
  await sendMail({
    to: email,
    subject: `Refusé : ${params.waitlistName}`,
    html: waitlistRejectedHtml(params),
  })
}
