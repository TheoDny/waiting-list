"use server"

/**
 * List owner / super-admin operations (member moderation, logs).
 */
import { authedAction } from "@/lib/safe-action"
import {
  deleteWaitlistAsAdmin,
  listAdminLogs,
  listMembersForAdmin,
  setMemberStatus,
} from "@/service/waiting-list-manage.service"
import { WaitlistMemberStatus } from "../generated/prisma/enums"
import { z } from "zod"

const statusSchema = z.enum([
  WaitlistMemberStatus.PENDING,
  WaitlistMemberStatus.APPROVED,
  WaitlistMemberStatus.REFUSED,
])

export const listAdminMembersAction = authedAction
  .inputSchema(
    z.object({
      waitlistId: z.string().min(1),
      status: statusSchema,
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const members = await listMembersForAdmin(
      parsedInput.waitlistId,
      ctx.userId,
      parsedInput.status
    )
    return { members }
  })

export const listAdminLogsAction = authedAction
  .inputSchema(z.object({ waitlistId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const logs = await listAdminLogs(parsedInput.waitlistId, ctx.userId)
    return { logs }
  })

export const setMemberStatusAction = authedAction
  .inputSchema(
    z.object({
      waitlistId: z.string().min(1),
      memberId: z.string().min(1),
      nextStatus: statusSchema,
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    await setMemberStatus({
      waitlistId: parsedInput.waitlistId,
      adminUserId: ctx.userId,
      memberId: parsedInput.memberId,
      nextStatus: parsedInput.nextStatus,
    })
    return { ok: true as const }
  })

export const deleteWaitlistManageAction = authedAction
  .inputSchema(z.object({ waitlistId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await deleteWaitlistAsAdmin(parsedInput.waitlistId, ctx.userId)
    return { ok: true as const }
  })
