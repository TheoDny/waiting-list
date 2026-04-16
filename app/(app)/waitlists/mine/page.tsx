import { Skeleton } from "@/components/ui/skeleton"
import { MineWaitlistsClient } from "@/components/waitlist/mine-waitlists-client"
import { getSession } from "@/lib/auth-server"
import { listMyOwnedWaitlists } from "@/service/waiting-list.service"
import { Suspense } from "react"

function MineWaitlistsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

async function MineWaitlistsPageContent() {
  const session = await getSession()
  const userId = session!.user!.id
  const data = await listMyOwnedWaitlists(userId)
  return <MineWaitlistsClient initial={data} />
}

export default function MineWaitlistsPage() {
  return (
    <Suspense fallback={<MineWaitlistsPageSkeleton />}>
      <MineWaitlistsPageContent />
    </Suspense>
  )
}
