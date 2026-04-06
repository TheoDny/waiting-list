import { getSession } from "@/lib/auth-server"
import { listMyOwnedWaitlists } from "@/service/waiting-list.service"
import { MineWaitlistsClient } from "@/components/waitlist/mine-waitlists-client"

export default async function MineWaitlistsPage() {
  const session = await getSession()
  const userId = session!.user!.id
  const data = await listMyOwnedWaitlists(userId)
  return <MineWaitlistsClient initial={data} />
}
