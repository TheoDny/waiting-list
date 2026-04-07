import { Text } from "@react-email/components"
import { render } from "@react-email/render"
import { EmailShell } from "./email-shell"

export type WaitlistEmailVariant = "join" | "refresh" | "approved" | "rejected"

type VariantMeta = { title: string; preview: string; heading: string }

function metaFor(variant: WaitlistEmailVariant): VariantMeta {
  switch (variant) {
    case "join":
      return {
        title: "Inscription confirmée",
        preview: "Votre inscription à la liste d'attente est enregistrée.",
        heading: "Inscription confirmée",
      }
    case "refresh":
      return {
        title: "Actualisation confirmée",
        preview: "Votre position sur la liste a bien été actualisée.",
        heading: "Actualisation confirmée",
      }
    case "approved":
      return {
        title: "Inscription validée",
        preview: "Votre inscription a été validée par un administrateur.",
        heading: "Inscription validée",
      }
    case "rejected":
      return {
        title: "Inscription refusée",
        preview: "Votre inscription a été refusée par un administrateur.",
        heading: "Inscription refusée",
      }
  }
}

export type WaitlistEmailProps = {
  variant: WaitlistEmailVariant
  waitlistName: string
  displayName: string
}

/**
 * Notifications liées aux listes d’attente (inscription, actualisation, validation, refus).
 */
export function WaitlistEmail({ variant, waitlistName, displayName }: WaitlistEmailProps) {
  const { title, preview, heading } = metaFor(variant)

  return (
    <EmailShell preview={preview} title={title} heading={heading}>
      <Text className="m-0 mb-5 text-[15px] leading-6 text-ink">Bonjour {displayName},</Text>
      {variant === "join" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          Votre inscription à la liste d&apos;attente <strong>{waitlistName}</strong> est enregistrée.
        </Text>
      )}
      {variant === "refresh" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          Votre position sur la liste <strong>{waitlistName}</strong> a bien été actualisée.
        </Text>
      )}
      {variant === "approved" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          Votre inscription à <strong>{waitlistName}</strong> a été{" "}
          <span className="font-semibold text-emerald-700">validée</span> par un administrateur.
        </Text>
      )}
      {variant === "rejected" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          Votre inscription à <strong>{waitlistName}</strong> a été{" "}
          <span className="font-semibold text-red-600">refusée</span> par un administrateur.
        </Text>
      )}
    </EmailShell>
  )
}

/** HTML de confirmation d’inscription (React Email). */
export async function waitlistJoinConfirmationHtml(params: {
  waitlistName: string
  displayName: string
}): Promise<string> {
  return render(<WaitlistEmail variant="join" {...params} />)
}

/** HTML de confirmation d’actualisation de position. */
export async function waitlistRefreshConfirmationHtml(params: {
  waitlistName: string
  displayName: string
}): Promise<string> {
  return render(<WaitlistEmail variant="refresh" {...params} />)
}

/** HTML d’acceptation par un administrateur. */
export async function waitlistApprovedHtml(params: {
  waitlistName: string
  displayName: string
}): Promise<string> {
  return render(<WaitlistEmail variant="approved" {...params} />)
}

/** HTML de refus par un administrateur. */
export async function waitlistRejectedHtml(params: {
  waitlistName: string
  displayName: string
}): Promise<string> {
  return render(<WaitlistEmail variant="rejected" {...params} />)
}

WaitlistEmail.PreviewProps = {
  variant: "join",
  displayName: "Marie",
  waitlistName: "Ouverture du site",
} satisfies WaitlistEmailProps

export default WaitlistEmail
