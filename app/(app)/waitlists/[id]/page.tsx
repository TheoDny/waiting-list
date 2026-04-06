import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth-server"
import { getWaitlistDetailForUi } from "@/service/waiting-list.service"
import { WaitlistDetailClient } from "@/components/waitlist/waitlist-detail-client"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ code?: string }>
}

export default async function WaitlistDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { code } = await searchParams
  const session = await getSession()
  if (!session?.user?.id) {
    notFound()
  }
  let detail
  try {
    detail = await getWaitlistDetailForUi(id, session.user.id, code ?? null)
  } catch {
    notFound()
  }

  return (
    <WaitlistDetailClient
      detail={detail}
      joinCode={code ?? null}
      defaultDisplayName={session.user.name ?? ""}
    />
  )
}
