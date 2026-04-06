import { emailShell, escapeHtml } from "./layout"

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

export function getOtpEmailHtml(otp: string, type: AuthOtpType): string {
  const intro =
    type === "sign-in"
      ? "Utilisez ce code pour vous connecter :"
      : type === "email-verification"
        ? "Utilisez ce code pour confirmer votre e-mail :"
        : type === "change-email"
          ? "Utilisez ce code pour confirmer votre nouvelle adresse e-mail :"
          : "Utilisez ce code pour réinitialiser votre mot de passe :"

  return emailShell(
    getOtpEmailSubject(type),
    `<p>${escapeHtml(intro)}</p>
     <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;font-family:monospace;">${escapeHtml(otp)}</p>
     <p style="font-size:13px;color:#666;">Ce code expire sous peu. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`
  )
}
