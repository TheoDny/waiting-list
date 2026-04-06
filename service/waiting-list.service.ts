/**
 * Waitlists: discovery, membership, refresh, owner CRUD. Prisma only.
 */
import { generateRandomString } from "better-auth/crypto"
import { maxMembersPerWaitlist, maxWaitlistsPerUser, REFRESH_COOLDOWN_DAYS } from "@/lib/waitlist-config"
import {
  isActiveForRanking,
  rankInSortedList,
  sortMembersByRanking,
} from "@/lib/waitlist-ranking"
import prisma from "@/lib/prisma"
import { appendAdminLog } from "@/service/waiting-list-manage.service"
import {
  sendWaitlistJoinConfirmation,
  sendWaitlistRefreshConfirmation,
} from "@/service/mail.service"
import { WaitlistMemberStatus, WaitlistVisibilityMode } from "../generated/prisma/enums"

const MS_PER_DAY = 24 * 60 * 60 * 1000

async function isSuperAdminUser(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  })
  return u?.isSuperAdmin ?? false
}

export async function findWaitlistIdByJoinCode(code: string) {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return null
  const w = await prisma.waitlist.findFirst({
    where: { joinCode: normalized },
    select: { id: true },
  })
  return w?.id ?? null
}

export async function listPublicWaitlists(search: string | undefined, userId: string) {
  const term = search?.trim()
  return prisma.waitlist.findMany({
    where: {
      isPublic: true,
      ...(term
        ? { name: { contains: term, mode: "insensitive" } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      paused: true,
      visibilityMode: true,
      createdAt: true,
      owner: { select: { name: true } },
      _count: { select: { members: true } },
    },
  })
}

export async function listAllWaitlistsForSuperAdmin(search: string | undefined) {
  const term = search?.trim()
  return prisma.waitlist.findMany({
    where: term ? { name: { contains: term, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
    },
  })
}

export async function assertWaitlistAccess(
  waitlistId: string,
  userId: string | null,
  joinCode?: string | null
) {
  const w = await prisma.waitlist.findUnique({
    where: { id: waitlistId },
    select: {
      id: true,
      isPublic: true,
      joinCode: true,
      ownerId: true,
    },
  })
  if (!w) {
    throw new Error("Liste introuvable")
  }
  if (w.isPublic) {
    return w
  }
  if (userId) {
    const [superA, member] = await Promise.all([
      isSuperAdminUser(userId),
      prisma.waitlistMember.findUnique({
        where: { waitlistId_userId: { waitlistId, userId } },
        select: { id: true },
      }),
    ])
    if (superA || w.ownerId === userId || member) {
      return w
    }
  }
  const jc = joinCode?.trim().toUpperCase() ?? ""
  if (jc && w.joinCode && jc === w.joinCode) {
    return w
  }
  throw new Error("Accès à cette liste privée refusé")
}

export type WaitlistDetailForUi = {
  waitlist: {
    id: string
    name: string
    isPublic: boolean
    joinCode: string | null
    visibilityMode: (typeof WaitlistVisibilityMode)[keyof typeof WaitlistVisibilityMode]
    paused: boolean
    ownerId: string
    createdAt: Date
  }
  isOwner: boolean
  isSuperAdmin: boolean
  myMembership: {
    id: string
    displayName: string
    status: (typeof WaitlistMemberStatus)[keyof typeof WaitlistMemberStatus]
    joinedAt: Date
    lastRefreshedAt: Date | null
    canRefresh: boolean
    nextRefreshAt: Date | null
  } | null
  /** Rank among PENDING+APPROVED (sorted). */
  myRank: number | null
  /** When admin or VIEW_ALL: full rows. When VIEW_YOURSELF and not admin: only self + placeholders. */
  displayRows: Array<{
    id: string
    displayName: string
    joinedAt: Date
    lastRefreshedAt: Date | null
    status: (typeof WaitlistMemberStatus)[keyof typeof WaitlistMemberStatus]
    isSelf: boolean
    blurName: boolean
  }>
  otherCount: number
}

export async function getWaitlistDetailForUi(
  waitlistId: string,
  userId: string,
  joinCode?: string | null
): Promise<WaitlistDetailForUi> {
  await assertWaitlistAccess(waitlistId, userId, joinCode)

  const [waitlist, superA] = await Promise.all([
    prisma.waitlist.findUnique({
      where: { id: waitlistId },
      select: {
        id: true,
        name: true,
        isPublic: true,
        joinCode: true,
        visibilityMode: true,
        paused: true,
        ownerId: true,
        createdAt: true,
      },
    }),
    isSuperAdminUser(userId),
  ])
  if (!waitlist) {
    throw new Error("Liste introuvable")
  }

  const isOwner = waitlist.ownerId === userId
  const isAdminView = isOwner || superA

  const allMembers = await prisma.waitlistMember.findMany({
    where: { waitlistId },
    orderBy: { joinedAt: "asc" },
  })

  const rankedPool = allMembers.filter(
    (m) => m.status === WaitlistMemberStatus.PENDING || m.status === WaitlistMemberStatus.APPROVED
  )
  const sortedRanked = sortMembersByRanking(rankedPool)
  const myMembershipRow = allMembers.find((m) => m.userId === userId) ?? null

  let nextRefreshAt: Date | null = null
  let canRefresh = false
  if (myMembershipRow?.lastRefreshedAt) {
    const elapsed = Date.now() - myMembershipRow.lastRefreshedAt.getTime()
    const cooldownMs = REFRESH_COOLDOWN_DAYS * MS_PER_DAY
    if (elapsed < cooldownMs) {
      nextRefreshAt = new Date(myMembershipRow.lastRefreshedAt.getTime() + cooldownMs)
    } else {
      canRefresh = true
    }
  } else if (myMembershipRow) {
    canRefresh = true
  }

  const myRank = myMembershipRow
    ? rankInSortedList(sortedRanked, userId, (m) => m.userId)
    : null

  const showAllNames =
    isAdminView || waitlist.visibilityMode === WaitlistVisibilityMode.VIEW_ALL

  let displayRows: WaitlistDetailForUi["displayRows"] = []
  let otherCount = 0

  if (showAllNames) {
    displayRows = sortedRanked.map((m) => ({
      id: m.id,
      displayName: m.displayName,
      joinedAt: m.joinedAt,
      lastRefreshedAt: m.lastRefreshedAt,
      status: m.status,
      isSelf: m.userId === userId,
      blurName: false,
    }))
  } else {
    const selfInRanked = sortedRanked.find((m) => m.userId === userId)
    otherCount = sortedRanked.length - (selfInRanked ? 1 : 0)
    if (selfInRanked) {
      displayRows = [
        {
          id: selfInRanked.id,
          displayName: selfInRanked.displayName,
          joinedAt: selfInRanked.joinedAt,
          lastRefreshedAt: selfInRanked.lastRefreshedAt,
          status: selfInRanked.status,
          isSelf: true,
          blurName: false,
        },
      ]
    }
  }

  return {
    waitlist,
    isOwner,
    isSuperAdmin: superA,
    myMembership: myMembershipRow
      ? {
          id: myMembershipRow.id,
          displayName: myMembershipRow.displayName,
          status: myMembershipRow.status,
          joinedAt: myMembershipRow.joinedAt,
          lastRefreshedAt: myMembershipRow.lastRefreshedAt,
          canRefresh,
          nextRefreshAt,
        }
      : null,
    myRank,
    displayRows,
    otherCount,
  }
}

export async function listMyOwnedWaitlists(userId: string) {
  const [rows, superA] = await Promise.all([
    prisma.waitlist.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { members: true } } },
    }),
    isSuperAdminUser(userId),
  ])
  const limit = superA ? null : maxWaitlistsPerUser()
  return { rows, limit, superAdmin: superA }
}

export async function listMyJoinedWaitlists(userId: string) {
  const memberships = await prisma.waitlistMember.findMany({
    where: { userId },
    include: {
      waitlist: {
        select: {
          id: true,
          name: true,
          paused: true,
          visibilityMode: true,
          ownerId: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  })

  const results = []
  for (const m of memberships) {
    const pool = await prisma.waitlistMember.findMany({
      where: {
        waitlistId: m.waitlistId,
        status: {
          in: [WaitlistMemberStatus.PENDING, WaitlistMemberStatus.APPROVED],
        },
      },
    })
    const sorted = sortMembersByRanking(pool)
    const rank = rankInSortedList(sorted, userId, (x) => x.userId)

    let nextRefreshAt: Date | null = null
    let canRefresh = false
    if (m.lastRefreshedAt) {
      const elapsed = Date.now() - m.lastRefreshedAt.getTime()
      const cooldownMs = REFRESH_COOLDOWN_DAYS * MS_PER_DAY
      if (elapsed < cooldownMs) {
        nextRefreshAt = new Date(m.lastRefreshedAt.getTime() + cooldownMs)
      } else {
        canRefresh = true
      }
    } else {
      canRefresh = true
    }

    const refreshedRecently = isActiveForRanking(m.lastRefreshedAt)

    results.push({
      membership: m,
      waitlist: m.waitlist,
      rank,
      canRefresh,
      nextRefreshAt,
      refreshedRecently,
    })
  }

  return results
}

export type JoinedWaitlistSummary = Awaited<ReturnType<typeof listMyJoinedWaitlists>>[number]

export async function createWaitlist(
  ownerId: string,
  input: {
    name: string
    isPublic: boolean
    visibilityMode: (typeof WaitlistVisibilityMode)[keyof typeof WaitlistVisibilityMode]
  }
) {
  const superA = await isSuperAdminUser(ownerId)
  if (!superA) {
    const count = await prisma.waitlist.count({ where: { ownerId } })
    if (count >= maxWaitlistsPerUser()) {
      throw new Error(`Nombre maximum de listes atteint (${maxWaitlistsPerUser()})`)
    }
  }

  const name = input.name.trim()
  if (!name) {
    throw new Error("Nom requis")
  }

  const exists = await prisma.waitlist.findUnique({ where: { name }, select: { id: true } })
  if (exists) {
    throw new Error("Ce nom de liste est déjà utilisé")
  }

  const joinCode = input.isPublic ? null : generateRandomString(10).toUpperCase()

  return prisma.waitlist.create({
    data: {
      name,
      isPublic: input.isPublic,
      joinCode,
      visibilityMode: input.visibilityMode,
      ownerId,
    },
  })
}

export async function updateWaitlist(
  editorId: string,
  waitlistId: string,
  input: {
    name?: string
    isPublic?: boolean
    visibilityMode?: (typeof WaitlistVisibilityMode)[keyof typeof WaitlistVisibilityMode]
    paused?: boolean
  }
) {
  const w = await prisma.waitlist.findUnique({ where: { id: waitlistId } })
  if (!w) {
    throw new Error("Liste introuvable")
  }
  const superA = await isSuperAdminUser(editorId)
  if (w.ownerId !== editorId && !superA) {
    throw new Error("Modification réservée au propriétaire")
  }

  let joinCode: string | null | undefined = undefined
  if (input.isPublic === true) {
    joinCode = null
  } else if (input.isPublic === false && w.isPublic) {
    joinCode = generateRandomString(10).toUpperCase()
  }

  const name = input.name?.trim()
  if (name !== undefined) {
    if (!name) throw new Error("Nom requis")
    const clash = await prisma.waitlist.findFirst({
      where: { name, NOT: { id: waitlistId } },
      select: { id: true },
    })
    if (clash) {
      throw new Error("Ce nom de liste est déjà utilisé")
    }
  }

  const updated = await prisma.waitlist.update({
    where: { id: waitlistId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(input.visibilityMode !== undefined ? { visibilityMode: input.visibilityMode } : {}),
      ...(input.paused !== undefined ? { paused: input.paused } : {}),
      ...(input.isPublic !== undefined ? { isPublic: input.isPublic } : {}),
      ...(joinCode !== undefined ? { joinCode } : {}),
    },
  })

  await appendAdminLog({
    waitlistId,
    adminUserId: editorId,
    action: "waitlist_update",
    payload: { fields: Object.keys(input) },
  })

  return updated
}

export async function deleteWaitlistByOwner(ownerId: string, waitlistId: string) {
  const w = await prisma.waitlist.findUnique({ where: { id: waitlistId } })
  if (!w) {
    throw new Error("Liste introuvable")
  }
  const superA = await isSuperAdminUser(ownerId)
  if (w.ownerId !== ownerId && !superA) {
    throw new Error("Suppression réservée au propriétaire")
  }
  await prisma.waitlist.delete({ where: { id: waitlistId } })
}

export async function joinWaitlist(
  userId: string,
  waitlistId: string,
  displayName: string,
  joinCode?: string | null
) {
  await assertWaitlistAccess(waitlistId, userId, joinCode)

  const w = await prisma.waitlist.findUnique({
    where: { id: waitlistId },
    select: { id: true, name: true, paused: true },
  })
  if (!w) throw new Error("Liste introuvable")
  if (w.paused) {
    throw new Error("Les inscriptions sont en pause sur cette liste")
  }

  const count = await prisma.waitlistMember.count({ where: { waitlistId } })
  if (count >= maxMembersPerWaitlist()) {
    throw new Error("Liste complète")
  }

  const dn = displayName.trim()
  if (!dn) throw new Error("Pseudo requis")

  const existingUser = await prisma.waitlistMember.findUnique({
    where: { waitlistId_userId: { waitlistId, userId } },
  })
  if (existingUser) {
    throw new Error("Vous êtes déjà inscrit sur cette liste")
  }

  const pseudoTaken = await prisma.waitlistMember.findUnique({
    where: { waitlistId_displayName: { waitlistId, displayName: dn } },
  })
  if (pseudoTaken) {
    throw new Error("Ce pseudo est déjà pris sur cette liste")
  }

  const member = await prisma.waitlistMember.create({
    data: {
      waitlistId,
      userId,
      displayName: dn,
      status: WaitlistMemberStatus.PENDING,
    },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (user?.email) {
    await sendWaitlistJoinConfirmation(user.email, {
      waitlistName: w.name,
      displayName: dn,
    }).catch(() => {})
  }

  return member
}

export async function leaveWaitlist(userId: string, waitlistId: string) {
  const m = await prisma.waitlistMember.findUnique({
    where: { waitlistId_userId: { waitlistId, userId } },
  })
  if (!m) {
    throw new Error("Inscription introuvable")
  }
  await prisma.waitlistMember.delete({ where: { id: m.id } })
}

export async function refreshWaitlistMembership(userId: string, waitlistId: string) {
  await assertWaitlistAccess(waitlistId, userId, null)

  const m = await prisma.waitlistMember.findUnique({
    where: { waitlistId_userId: { waitlistId, userId } },
    include: { waitlist: { select: { name: true } } },
  })
  if (!m) {
    throw new Error("Vous n'êtes pas inscrit sur cette liste")
  }

  const now = Date.now()
  if (m.lastRefreshedAt) {
    const elapsed = now - m.lastRefreshedAt.getTime()
    if (elapsed < REFRESH_COOLDOWN_DAYS * MS_PER_DAY) {
      throw new Error(
        `Actualisation possible dans ${Math.ceil((REFRESH_COOLDOWN_DAYS * MS_PER_DAY - elapsed) / MS_PER_DAY)} jour(s) environ`
      )
    }
  }

  await prisma.waitlistMember.update({
    where: { id: m.id },
    data: { lastRefreshedAt: new Date() },
  })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (user?.email) {
    await sendWaitlistRefreshConfirmation(user.email, {
      waitlistName: m.waitlist.name,
      displayName: m.displayName,
    }).catch(() => {})
  }
}
