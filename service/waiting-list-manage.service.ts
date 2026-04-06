/**
 * Waitlist administration: owner or super-admin only. Prisma + admin audit log.
 */
import { maxAdminLogsPerWaitlist } from "@/lib/waitlist-config"
import { sortMembersByRanking } from "@/lib/waitlist-ranking"
import {
  sendWaitlistApprovedEmail,
  sendWaitlistRejectedEmail,
} from "@/service/mail.service"
import prisma from "@/lib/prisma"
import type { Prisma } from "../generated/prisma/client"
import type { WaitlistMemberStatus } from "../generated/prisma/enums"
import { WaitlistMemberStatus as MemberStatus } from "../generated/prisma/enums"

async function getUserFlags(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { isSuperAdmin: true },
  })
  return { isSuperAdmin: u?.isSuperAdmin ?? false }
}

export async function assertCanManageWaitlist(waitlistId: string, userId: string) {
  const [waitlist, flags] = await Promise.all([
    prisma.waitlist.findUnique({
      where: { id: waitlistId },
      select: { id: true, ownerId: true, name: true },
    }),
    getUserFlags(userId),
  ])
  if (!waitlist) {
    throw new Error("Liste introuvable")
  }
  if (waitlist.ownerId !== userId && !flags.isSuperAdmin) {
    throw new Error("Accès administrateur refusé")
  }
  return { waitlist, isSuperAdmin: flags.isSuperAdmin }
}

export async function getWaitlistMetaForAdmin(waitlistId: string, userId: string) {
  await assertCanManageWaitlist(waitlistId, userId)
  return prisma.waitlist.findUnique({
    where: { id: waitlistId },
    select: { id: true, name: true },
  })
}

async function trimAdminLogs(waitlistId: string) {
  const max = maxAdminLogsPerWaitlist()
  const ids = await prisma.waitlistAdminLog.findMany({
    where: { waitlistId },
    orderBy: { createdAt: "desc" },
    skip: max,
    select: { id: true },
  })
  if (ids.length === 0) return
  await prisma.waitlistAdminLog.deleteMany({
    where: { id: { in: ids.map((x) => x.id) } },
  })
}

export async function appendAdminLog(input: {
  waitlistId: string
  adminUserId: string
  action: string
  payload?: Record<string, unknown>
}) {
  await prisma.waitlistAdminLog.create({
    data: {
      waitlistId: input.waitlistId,
      adminUserId: input.adminUserId,
      action: input.action,
      payload: (input.payload ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })
  await trimAdminLogs(input.waitlistId)
}

export async function listAdminLogs(waitlistId: string, userId: string) {
  await assertCanManageWaitlist(waitlistId, userId)
  const max = maxAdminLogsPerWaitlist()
  return prisma.waitlistAdminLog.findMany({
    where: { waitlistId },
    orderBy: { createdAt: "desc" },
    take: max,
    include: {
      admin: { select: { id: true, name: true, email: true } },
    },
  })
}

export async function listMembersForAdmin(
  waitlistId: string,
  userId: string,
  status: WaitlistMemberStatus
) {
  await assertCanManageWaitlist(waitlistId, userId)
  const members = await prisma.waitlistMember.findMany({
    where: { waitlistId, status },
    include: { user: { select: { id: true, email: true } } },
    orderBy: { joinedAt: "asc" },
  })
  const sorted = sortMembersByRanking(members)
  return sorted.map((m, index) => ({ ...m, rank: index + 1 }))
}

export async function setMemberStatus(input: {
  waitlistId: string
  adminUserId: string
  memberId: string
  nextStatus: WaitlistMemberStatus
}) {
  const { waitlist } = await assertCanManageWaitlist(input.waitlistId, input.adminUserId)

  const member = await prisma.waitlistMember.findFirst({
    where: { id: input.memberId, waitlistId: input.waitlistId },
    include: { user: { select: { email: true } } },
  })
  if (!member) {
    throw new Error("Membre introuvable")
  }

  const prev = member.status
  await prisma.waitlistMember.update({
    where: { id: member.id },
    data: { status: input.nextStatus },
  })

  const mailParams = { waitlistName: waitlist.name, displayName: member.displayName }

  if (input.nextStatus === MemberStatus.APPROVED && prev !== MemberStatus.APPROVED) {
    await sendWaitlistApprovedEmail(member.user.email, mailParams).catch(() => {})
  }
  if (input.nextStatus === MemberStatus.REFUSED && prev !== MemberStatus.REFUSED) {
    await sendWaitlistRejectedEmail(member.user.email, mailParams).catch(() => {})
  }

  await appendAdminLog({
    waitlistId: input.waitlistId,
    adminUserId: input.adminUserId,
    action: "member_status",
    payload: {
      memberId: member.id,
      userId: member.userId,
      from: prev,
      to: input.nextStatus,
    },
  })
}

export async function deleteWaitlistAsAdmin(waitlistId: string, adminUserId: string) {
  await assertCanManageWaitlist(waitlistId, adminUserId)
  await prisma.waitlist.delete({ where: { id: waitlistId } })
}
