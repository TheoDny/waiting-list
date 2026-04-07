import { CodeInline, Text } from "@react-email/components"
import { render } from "@react-email/render"
import { EmailShell } from "./email-shell"

export type AuthOtpType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email"

/** Textes déjà résolus via `next-intl` (namespace `Email`). */
export type OtpEmailCopy = {
  subject: string
  intro: string
  disclaimer: string
  preview: string
}

export type OtpEmailProps = {
  otp: string
  copy: OtpEmailCopy
}

/**
 * Gabarit OTP pour Better Auth (plugin `emailOTP`).
 */
export function OtpEmail({ otp, copy }: OtpEmailProps) {
  return (
    <EmailShell preview={copy.preview} title={copy.subject} heading={copy.subject}>
      <Text className="m-0 mb-6 text-[15px] leading-6 text-ink">{copy.intro}</Text>
      <SectionCode otp={otp} />
      <Text className="m-0 mt-6 text-[13px] leading-5 text-muted">{copy.disclaimer}</Text>
    </EmailShell>
  )
}

function SectionCode({ otp }: { otp: string }) {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      className="w-full rounded-xl border border-solid border-line bg-canvas"
    >
      <tbody>
        <tr>
          <td className="px-6 py-5 text-center">
            <CodeInline className="text-[28px] font-semibold tracking-[0.25em] text-ink">{otp}</CodeInline>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

/**
 * Rend le HTML de l’e-mail OTP via React Email (`render`).
 */
export async function getOtpEmailHtml(otp: string, copy: OtpEmailCopy): Promise<string> {
  return render(<OtpEmail otp={otp} copy={copy} />)
}

OtpEmail.PreviewProps = {
  otp: "482913",
  copy: {
    subject: "Votre code de connexion",
    intro: "Utilisez ce code pour vous connecter :",
    disclaimer:
      "Ce code expire sous peu. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.",
    preview: "Votre code de connexion — 482913",
  },
} satisfies OtpEmailProps

export default OtpEmail
