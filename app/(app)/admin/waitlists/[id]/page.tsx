import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import { getWaitlistMetaForAdmin } from "@/service/waiting-list-manage.service"
import { AdminWaitlistClient } from "@/components/waitlist/admin-waitlist-client"

type Props = { params: Promise<{ id: string }> }

export default async function AdminWaitlistPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.id) {
    notFound()
  }
  let waitlist
  try {
    waitlist = await getWaitlistMetaForAdmin(id, session.user.id)
  } catch {
    notFound()
  }
  if (!waitlist) {
    notFound()
  }
  return <AdminWaitlistClient waitlistId={waitlist.id} waitlistName={waitlist.name} />
}
