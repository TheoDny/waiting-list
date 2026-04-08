"use server"

/**
 * Waitlist flows for authenticated users (non–list-admin mutations use the same services).
 */
import { authedAction } from "@/lib/safe-action"
import {
  createWaitlist,
  deleteWaitlistByOwner,
  findWaitlistIdByJoinCode,
  getWaitlistDetailForUi,
  joinWaitlist,
  leaveWaitlist,
  listAllWaitlistsForSuperAdmin,
  listMyJoinedWaitlists,
  listMyOwnedWaitlists,
  listPublicWaitlists,
  refreshWaitlistMembership,
  updateWaitlist,
} from "@/service/waiting-list.service"
import { MAX_WAITLIST_DESCRIPTION_LENGTH } from "@/lib/waitlist-config"
import { getUserById } from "@/service/user.service"
import { WaitlistVisibilityMode } from "../generated/prisma/enums"
import { z } from "zod"

const visibilitySchema = z.enum([WaitlistVisibilityMode.VIEW_ALL, WaitlistVisibilityMode.VIEW_YOURSELF])

const optionalDescriptionSchema = z
  .string()
  .max(MAX_WAITLIST_DESCRIPTION_LENGTH)
  .optional()

export const listPublicWaitlistsAction = authedAction
  .inputSchema(z.object({ search: z.string().optional() }))
  .action(async ({ parsedInput, ctx }) => {
    const rows = await listPublicWaitlists(parsedInput.search)
    return { rows }
  })

export const listSuperAdminWaitlistsAction = authedAction
  .inputSchema(z.object({ search: z.string().optional() }))
  .action(async ({ parsedInput, ctx }) => {
    const me = await getUserById(ctx.userId)
    if (!me?.isSuperAdmin) {
      throw new Error("Accès super-admin requis")
    }
    const rows = await listAllWaitlistsForSuperAdmin(parsedInput.search)
    return { rows }
  })

export const resolveJoinCodeAction = authedAction
  .inputSchema(z.object({ code: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const id = await findWaitlistIdByJoinCode(parsedInput.code)
    return { waitlistId: id }
  })

export const getWaitlistDetailAction = authedAction
  .inputSchema(
    z.object({
      waitlistId: z.string().min(1),
      joinCode: z.string().optional().nullable(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const detail = await getWaitlistDetailForUi(
      parsedInput.waitlistId,
      ctx.userId,
      parsedInput.joinCode ?? null
    )
    return { detail }
  })

export const listMyOwnedWaitlistsAction = authedAction.action(async ({ ctx }) => {
  return await listMyOwnedWaitlists(ctx.userId)
})

export const listMyJoinedWaitlistsAction = authedAction.action(async ({ ctx }) => {
  const rows = await listMyJoinedWaitlists(ctx.userId)
  return { rows }
})

export const createWaitlistAction = authedAction
  .inputSchema(
    z.object({
      name: z.string().min(1),
      description: optionalDescriptionSchema,
      isPublic: z.boolean(),
      visibilityMode: visibilitySchema,
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const waitlist = await createWaitlist(ctx.userId, parsedInput)
    return { waitlist }
  })

export const updateWaitlistAction = authedAction
  .inputSchema(
    z.object({
      waitlistId: z.string().min(1),
      name: z.string().min(1).optional(),
      description: optionalDescriptionSchema,
      isPublic: z.boolean().optional(),
      visibilityMode: visibilitySchema.optional(),
      paused: z.boolean().optional(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { waitlistId, ...rest } = parsedInput
    const waitlist = await updateWaitlist(ctx.userId, waitlistId, rest)
    return { waitlist }
  })

export const deleteWaitlistAction = authedAction
  .inputSchema(z.object({ waitlistId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await deleteWaitlistByOwner(ctx.userId, parsedInput.waitlistId)
    return { ok: true as const }
  })

export const joinWaitlistAction = authedAction
  .inputSchema(
    z.object({
      waitlistId: z.string().min(1),
      displayName: z.string().min(1).max(80),
      joinCode: z.string().optional().nullable(),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const member = await joinWaitlist(
      ctx.userId,
      parsedInput.waitlistId,
      parsedInput.displayName,
      parsedInput.joinCode ?? null
    )
    return { member }
  })

export const leaveWaitlistAction = authedAction
  .inputSchema(z.object({ waitlistId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await leaveWaitlist(ctx.userId, parsedInput.waitlistId)
    return { ok: true as const }
  })

export const refreshWaitlistAction = authedAction
  .inputSchema(z.object({ waitlistId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    await refreshWaitlistMembership(ctx.userId, parsedInput.waitlistId)
    return { ok: true as const }
  })
