import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cache } from "react"

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireUserId(): Promise<string> {
  const session = await getSession()
  const id = session?.user?.id
  if (!id) {
    throw new Error("Non authentifié")
  }
  return id
}
