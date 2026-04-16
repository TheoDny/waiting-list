import { Skeleton } from "@/components/ui/skeleton"
import { AdminWaitlistClient } from "@/components/waitlist/admin-waitlist-client"
import { getSession } from "@/lib/auth-server"
import { getWaitlistMetaForAdmin } from "@/service/waiting-list-manage.service"
import { notFound } from "next/navigation"
import { Suspense } from "react"

type Props = { params: Promise<{ id: string }> }

function AdminWaitlistPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-21 w-full" />
        <Skeleton className="h-21 w-full" />
        <Skeleton className="h-21 w-full" />
        <Skeleton className="h-21 w-full" />
        <Skeleton className="h-21 w-full" />
      </div>
    </div>
  )
}

async function AdminWaitlistPageContent({ params }: Props) {
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

export default function AdminWaitlistPage(props: Props) {
  return (
    <Suspense fallback={<AdminWaitlistPageSkeleton />}>
      <AdminWaitlistPageContent params={props.params} />
    </Suspense>
  )
}
