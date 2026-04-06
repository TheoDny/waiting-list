import Link from "next/link"
import { getSession } from "@/lib/auth-server"
import { listPublicWaitlists } from "@/service/waiting-list.service"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicWaitlistSearch } from "@/components/waitlist/public-waitlist-search"
import { getTranslations } from "next-intl/server"

type Props = { searchParams: Promise<{ q?: string }> }

export default async function PublicWaitlistsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const session = await getSession()
  const userId = session!.user!.id
  const rows = await listPublicWaitlists(q, userId)
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
