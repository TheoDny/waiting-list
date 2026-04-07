import { AppHeader } from "@/components/layout/app-header"

/**
 * Pages accessibles sans session (listes publiques + détail public).
 * Le header affiche une navigation réduite pour les invités.
 */
export default function PublicSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
