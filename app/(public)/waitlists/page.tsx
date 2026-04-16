import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PublicWaitlistSearch } from "@/components/waitlist/public-waitlist-search"
import { listPublicWaitlists } from "@/service/waiting-list.service"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Suspense } from "react"

type Props = { searchParams: Promise<{ q?: string }> }

function PublicWaitlistsPageSkeleton() {
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
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

async function PublicWaitlistsPageContent({ searchParams }: Props) {
  const { q } = await searchParams
  const rows = await listPublicWaitlists(q)
  const t = await getTranslations("WaitlistPublic")
  const tc = await getTranslations("Common")
  const tb = await getTranslations("WaitlistBadge")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <PublicWaitlistSearch initialQuery={q ?? ""} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((w) => (
          <li key={w.id}>
            <Link href={`/waitlists/${w.id}`}>
              <Card className="hover:bg-muted/40 transition-colors">
                <CardHeader className="gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    {w.paused ? <Badge variant="secondary">{tb("pauseSignup")}</Badge> : null}
                  </div>
                  <CardDescription>
                    {t("cardLine", {
                      by: tc("by"),
                      owner: w.owner.name,
                      count: w._count.members,
                      membersLabel: tc("members"),
                    })}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="text-muted-foreground text-sm">{t("empty")}</p> : null}
    </div>
  )
}

export default function PublicWaitlistsPage(props: Props) {
  return (
    <Suspense fallback={<PublicWaitlistsPageSkeleton />}>
      <PublicWaitlistsPageContent searchParams={props.searchParams} />
    </Suspense>
  )
}
