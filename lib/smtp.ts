import type { Transporter } from "nodemailer"
import nodemailer from "nodemailer"

export function getSmtpTransport(): Transporter {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const secure = process.env.SMTP_SECURE === "true"
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  if (!host || !port) {
    throw new Error("Missing SMTP configuration")
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: secure,
    auth: user && password ? { user: user, pass: password } : undefined,
  })
}
