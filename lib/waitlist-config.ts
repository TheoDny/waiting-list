/** Env-backed limits for waitlists (see `.env.example`). */

export function maxWaitlistsPerUser(): number {
  const v = Number(process.env.MAX_WAITLISTS_CREATED_BY_USER)
  return Number.isFinite(v) && v > 0 ? v : 5
}

export function maxMembersPerWaitlist(): number {
  const v = Number(process.env.MAX_MEMBERS_BY_WAITLIST)
  return Number.isFinite(v) && v > 0 ? v : 1000
}

export function maxAdminLogsPerWaitlist(): number {
  const v = Number(process.env.MAX_LOG_ACTION_BY_WAITLIST)
  return Number.isFinite(v) && v > 0 ? v : 20
}

/** Minimum delay between two refreshes for a member. */
export const REFRESH_COOLDOWN_DAYS = 7

/** Members refreshed within this window count as "active" for ranking. */
export const RANKING_ACTIVE_WINDOW_DAYS = 10

/** Max length for optional waitlist description (create / update). */
export const MAX_WAITLIST_DESCRIPTION_LENGTH = 2000
