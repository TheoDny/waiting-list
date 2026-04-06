import { getSession } from "@/lib/auth-server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await getSession()
  if (session?.user) {
    redirect("/waitlists")
  }
  redirect("/login")
}
