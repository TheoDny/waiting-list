import { Skeleton } from "@/components/ui/skeleton"
import { WaitlistDetailClient } from "@/components/waitlist/waitlist-detail-client"
import { getSession } from "@/lib/auth-server"
import { getWaitlistDetailForUi } from "@/service/waiting-list.service"
import { notFound } from "next/navigation"
import { Suspense } from "react"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ code?: string }>
}

function WaitlistDetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-10 w-56" />
      <div className="grid gap-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

async function WaitlistDetailPageContent({ params, searchParams }: Props) {
  const { id } = await params
  const { code } = await searchParams
  const session = await getSession()
  const userId = session?.user?.id ?? null
  let detail
  try {
    detail = await getWaitlistDetailForUi(id, userId, code ?? null)
  } catch {
    notFound()
  }

  return (
    <WaitlistDetailClient
      detail={detail}
      joinCode={code ?? null}
      defaultDisplayName={session?.user?.name ?? ""}
      isAuthenticated={Boolean(userId)}
    />
  )
}

export default function WaitlistDetailPage(props: Props) {
  return (
    <Suspense fallback={<WaitlistDetailPageSkeleton />}>
      <WaitlistDetailPageContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  )
}
