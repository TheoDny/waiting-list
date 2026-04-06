"use server"

/**
 * Profile updates (name). E-mail changes use Better Auth OTP on the client.
 */
import { authedAction } from "@/lib/safe-action"
import { updateUserDisplayName } from "@/service/user.service"
import { z } from "zod"

const nameSchema = z.object({
  name: z.string().trim().min(1, "Pseudo requis").max(80),
})

export const updateProfileNameAction = authedAction
  .inputSchema(nameSchema)
  .action(async ({ parsedInput, ctx }) => {
    const user = await updateUserDisplayName(ctx.userId, parsedInput.name)
    return { user }
  })
