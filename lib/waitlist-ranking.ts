import { RANKING_ACTIVE_WINDOW_DAYS } from "@/lib/waitlist-config"
import type { WaitlistMember } from "../generated/prisma/client"

type MemberRow = Pick<WaitlistMember, "joinedAt" | "lastRefreshedAt">

export function isActiveForRanking(lastRefreshedAt: Date | null, now = new Date()): boolean {
  if (!lastRefreshedAt) return false
  const ms = RANKING_ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000
  return now.getTime() - lastRefreshedAt.getTime() <= ms
}

/**
 * Sorts members for public display: "active" bucket first, then inactive.
 * Within active: joinedAt asc, then lastRefreshedAt desc.
 * Within inactive: joinedAt asc.
 */
export function sortMembersByRanking<T extends MemberRow>(members: T[], now = new Date()): T[] {
  return [...members].sort((a, b) => {
    const aAct = isActiveForRanking(a.lastRefreshedAt, now)
    const bAct = isActiveForRanking(b.lastRefreshedAt, now)
    if (aAct !== bAct) return aAct ? -1 : 1
    const ja = a.joinedAt.getTime()
    const jb = b.joinedAt.getTime()
    if (ja !== jb) return ja - jb
    if (aAct) {
      const ra = a.lastRefreshedAt?.getTime() ?? 0
      const rb = b.lastRefreshedAt?.getTime() ?? 0
      return rb - ra
    }
    return 0
  })
}

/** 1-based rank in the sorted order. */
export function rankInSortedList<T>(sorted: T[], userId: string, getUserId: (m: T) => string): number | null {
  const i = sorted.findIndex((m) => getUserId(m) === userId)
  return i === -1 ? null : i + 1
}
