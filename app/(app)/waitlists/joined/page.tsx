import { Skeleton } from "@/components/ui/skeleton"
import { JoinedWaitlistsClient } from "@/components/waitlist/joined-waitlists-client"
import { getSession } from "@/lib/auth-server"
import { listMyJoinedWaitlists } from "@/service/waiting-list.service"
import { Suspense } from "react"

function JoinedWaitlistsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-38 w-full" />
        <Skeleton className="h-38 w-full" />
        <Skeleton className="h-38 w-full" />
      </div>
    </div>
  )
}

async function JoinedWaitlistsPageContent() {
  const session = await getSession()
  const userId = session!.user!.id
  const rows = await listMyJoinedWaitlists(userId)
  return <JoinedWaitlistsClient rows={rows} />
}

export default function JoinedWaitlistsPage() {
  return (
    <Suspense fallback={<JoinedWaitlistsPageSkeleton />}>
      <JoinedWaitlistsPageContent />
    </Suspense>
  )
}
