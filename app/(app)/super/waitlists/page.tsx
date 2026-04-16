import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/auth-server"
import { getUserById } from "@/service/user.service"
import { listAllWaitlistsForSuperAdmin } from "@/service/waiting-list.service"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PublicWaitlistSearch } from "@/components/waitlist/public-waitlist-search"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Suspense } from "react"

type Props = { searchParams: Promise<{ q?: string }> }

function SuperWaitlistsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-10 w-full" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index}>
            <div className="rounded-xl border p-6 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

async function SuperWaitlistsPageContent({ searchParams }: Props) {
  const { q } = await searchParams
  const session = await getSession()
  if (!session?.user?.id) {
    notFound()
  }
  const me = await getUserById(session.user.id)
  if (!me?.isSuperAdmin) {
    notFound()
  }
  const rows = await listAllWaitlistsForSuperAdmin(q)
  const t = await getTranslations("SuperAdmin")
  const tc = await getTranslations("Common")
  const tb = await getTranslations("WaitlistBadge")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <PublicWaitlistSearch initialQuery={q ?? ""} actionBasePath="/super/waitlists" />
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((w) => (
          <li key={w.id}>
            <Card>
              <CardHeader className="gap-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{w.name}</CardTitle>
                  {w.paused ? <Badge variant="secondary">{tb("pauseShort")}</Badge> : null}
                </div>
                <CardDescription>
                  {t("cardLine", {
                    visibility: w.isPublic ? tb("public") : tb("private"),
                    email: w.owner.email,
                    count: w._count.members,
                    membersLabel: tc("members"),
                  })}
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link href={`/waitlists/${w.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    {tc("view")}
                  </Link>
                  <Link
                    href={`/admin/waitlists/${w.id}`}
                    className={cn(buttonVariants({ variant: "default", size: "sm" }))}
                  >
                    {tc("admin")}
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="text-muted-foreground text-sm">{t("empty")}</p> : null}
    </div>
  )
}

export default function SuperWaitlistsPage(props: Props) {
  return (
    <Suspense fallback={<SuperWaitlistsPageSkeleton />}>
      <SuperWaitlistsPageContent searchParams={props.searchParams} />
    </Suspense>
  )
}
