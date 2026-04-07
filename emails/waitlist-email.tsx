import { Text } from "@react-email/components"
import { render } from "@react-email/render"
import { EmailShell } from "./email-shell"

export type WaitlistEmailVariant = "join" | "refresh" | "approved" | "rejected"

type WaitlistCopyBase = {
  preview: string
  title: string
  heading: string
  greeting: string
}

export type WaitlistJoinCopy = WaitlistCopyBase & {
  bodyBefore: string
  bodyAfter: string
}

export type WaitlistRefreshCopy = WaitlistCopyBase & {
  bodyBefore: string
  bodyAfter: string
}

export type WaitlistApprovedCopy = WaitlistCopyBase & {
  bodyBefore: string
  bodyMid: string
  highlight: string
  bodyAfter: string
}

export type WaitlistRejectedCopy = WaitlistCopyBase & {
  bodyBefore: string
  bodyMid: string
  highlight: string
  bodyAfter: string
}

export type WaitlistEmailProps =
  | { variant: "join"; waitlistName: string; copy: WaitlistJoinCopy }
  | { variant: "refresh"; waitlistName: string; copy: WaitlistRefreshCopy }
  | { variant: "approved"; waitlistName: string; copy: WaitlistApprovedCopy }
  | { variant: "rejected"; waitlistName: string; copy: WaitlistRejectedCopy }

/**
 * Notifications liées aux listes d’attente (inscription, actualisation, validation, refus).
 */
export function WaitlistEmail(props: WaitlistEmailProps) {
  const { copy } = props

  return (
    <EmailShell preview={copy.preview} title={copy.title} heading={copy.heading}>
      <Text className="m-0 mb-5 text-[15px] leading-6 text-ink">{copy.greeting}</Text>
      {props.variant === "join" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          {props.copy.bodyBefore}
          <strong>{props.waitlistName}</strong>
          {props.copy.bodyAfter}
        </Text>
      )}
      {props.variant === "refresh" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          {props.copy.bodyBefore}
          <strong>{props.waitlistName}</strong>
          {props.copy.bodyAfter}
        </Text>
      )}
      {props.variant === "approved" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          {props.copy.bodyBefore}
          <strong>{props.waitlistName}</strong>
          {props.copy.bodyMid}
          <span className="font-semibold text-emerald-700">{props.copy.highlight}</span>
          {props.copy.bodyAfter}
        </Text>
      )}
      {props.variant === "rejected" && (
        <Text className="m-0 text-[15px] leading-6 text-ink">
          {props.copy.bodyBefore}
          <strong>{props.waitlistName}</strong>
          {props.copy.bodyMid}
          <span className="font-semibold text-red-600">{props.copy.highlight}</span>
          {props.copy.bodyAfter}
        </Text>
      )}
    </EmailShell>
  )
}

/** HTML de confirmation d’inscription (React Email). */
export async function waitlistJoinConfirmationHtml(params: {
  waitlistName: string
  copy: WaitlistJoinCopy
}): Promise<string> {
  return render(<WaitlistEmail variant="join" waitlistName={params.waitlistName} copy={params.copy} />)
}

/** HTML de confirmation d’actualisation de position. */
export async function waitlistRefreshConfirmationHtml(params: {
  waitlistName: string
  copy: WaitlistRefreshCopy
}): Promise<string> {
  return render(
    <WaitlistEmail variant="refresh" waitlistName={params.waitlistName} copy={params.copy} />
  )
}

/** HTML d’acceptation par un administrateur. */
export async function waitlistApprovedHtml(params: {
  waitlistName: string
  copy: WaitlistApprovedCopy
}): Promise<string> {
  return render(
    <WaitlistEmail variant="approved" waitlistName={params.waitlistName} copy={params.copy} />
  )
}

/** HTML de refus par un administrateur. */
export async function waitlistRejectedHtml(params: {
  waitlistName: string
  copy: WaitlistRejectedCopy
}): Promise<string> {
  return render(
    <WaitlistEmail variant="rejected" waitlistName={params.waitlistName} copy={params.copy} />
  )
}

WaitlistEmail.PreviewProps = {
  variant: "join",
  waitlistName: "Ouverture du site",
  copy: {
    preview: "Votre inscription à la liste d'attente est enregistrée.",
    title: "Inscription confirmée",
    heading: "Inscription confirmée",
    greeting: "Bonjour Marie,",
    bodyBefore: "Votre inscription à la liste d'attente ",
    bodyAfter: " est enregistrée.",
  },
} satisfies Extract<WaitlistEmailProps, { variant: "join" }>

export default WaitlistEmail
