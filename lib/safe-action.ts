import { getSession } from "@/lib/auth-server"
import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.name, e.message)
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
})

export const authedAction = actionClient.use(async ({ next }) => {
  const session = await getSession()
  const userId = session?.user?.id
  if (!userId) {
    throw new Error("Non authentifié")
  }
  return next({
    ctx: {
      userId,
      user: session.user,
    },
  })
})
