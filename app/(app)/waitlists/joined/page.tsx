import { getSession } from "@/lib/auth-server"
import { listMyJoinedWaitlists } from "@/service/waiting-list.service"
import { JoinedWaitlistsClient } from "@/components/waitlist/joined-waitlists-client"

export default async function JoinedWaitlistsPage() {
  const session = await getSession()
  const userId = session!.user!.id
  const rows = await listMyJoinedWaitlists(userId)
  return <JoinedWaitlistsClient rows={rows} />
}
