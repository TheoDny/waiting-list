import { emailShell, escapeHtml } from "./layout"

export function waitlistJoinConfirmationHtml(params: {
  waitlistName: string
  displayName: string
}): string {
  return emailShell(
    "Inscription confirmée",
    `<p>Bonjour ${escapeHtml(params.displayName)},</p>
     <p>Votre inscription à la liste d'attente <strong>${escapeHtml(params.waitlistName)}</strong> est enregistrée.</p>`
  )
}

export function waitlistRefreshConfirmationHtml(params: {
  waitlistName: string
  displayName: string
}): string {
  return emailShell(
    "Actualisation confirmée",
    `<p>Bonjour ${escapeHtml(params.displayName)},</p>
     <p>Votre position sur la liste <strong>${escapeHtml(params.waitlistName)}</strong> a bien été actualisée.</p>`
  )
}

export function waitlistApprovedHtml(params: {
  waitlistName: string
  displayName: string
}): string {
  return emailShell(
    "Inscription validée",
    `<p>Bonjour ${escapeHtml(params.displayName)},</p>
     <p>Votre inscription à <strong>${escapeHtml(params.waitlistName)}</strong> a été <strong>validée</strong> par un administrateur.</p>`
  )
}

export function waitlistRejectedHtml(params: {
  waitlistName: string
  displayName: string
}): string {
  return emailShell(
    "Inscription refusée",
    `<p>Bonjour ${escapeHtml(params.displayName)},</p>
     <p>Votre inscription à <strong>${escapeHtml(params.waitlistName)}</strong> a été <strong>refusée</strong> par un administrateur.</p>`
  )
}
