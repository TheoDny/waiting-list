import { CodeInline, Text } from "@react-email/components"
import { render } from "@react-email/render"
import { EmailShell } from "./email-shell"

export type AuthOtpType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email"

export function getOtpEmailSubject(type: AuthOtpType): string {
  switch (type) {
    case "sign-in":
      return "Votre code de connexion"
    case "email-verification":
      return "Vérification de votre adresse e-mail"
    case "forget-password":
      return "Réinitialisation du mot de passe"
    case "change-email":
      return "Confirmation du changement d'e-mail"
    default:
      return "Code de vérification"
  }
}

function otpIntro(type: AuthOtpType): string {
  switch (type) {
    case "sign-in":
      return "Utilisez ce code pour vous connecter :"
    case "email-verification":
      return "Utilisez ce code pour confirmer votre e-mail :"
    case "change-email":
      return "Utilisez ce code pour confirmer votre nouvelle adresse e-mail :"
    case "forget-password":
    default:
      return "Utilisez ce code pour réinitialiser votre mot de passe :"
  }
}

export type OtpEmailProps = {
  otp: string
  type: AuthOtpType
}

/**
 * Gabarit OTP pour Better Auth (plugin `emailOTP`).
 */
export function OtpEmail({ otp, type }: OtpEmailProps) {
  const subject = getOtpEmailSubject(type)
  return (
    <EmailShell
      preview={`${subject} — ${otp}`}
      title={subject}
      heading={subject}
    >
      <Text className="m-0 mb-6 text-[15px] leading-6 text-ink">{otpIntro(type)}</Text>
      <SectionCode otp={otp} />
      <Text className="m-0 mt-6 text-[13px] leading-5 text-muted">
        Ce code expire sous peu. Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez ce
        message.
      </Text>
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
export async function getOtpEmailHtml(otp: string, type: AuthOtpType): Promise<string> {
  return render(<OtpEmail otp={otp} type={type} />)
}

OtpEmail.PreviewProps = {
  otp: "482913",
  type: "sign-in",
} satisfies OtpEmailProps

export default OtpEmail
