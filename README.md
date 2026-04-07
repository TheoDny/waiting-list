# Waiting List

Application web pour gérer des **listes d’attente** : listes publiques ou privées (code d’invitation), inscriptions, modération par le propriétaire, classement avec actualisation périodique, et rôle **super-admin** pour la supervision globale.

## Fonctionnalités principales

- **Authentification** : e-mail / mot de passe et **OTP** (Better Auth), changement d’e-mail et de mot de passe depuis le profil.
- **Listes** : création, édition, suppression ; visibilité publique ou privée avec `joinCode` ; limites configurables (`MAX_*` dans l’environnement).
- **Membres** : rejoindre / quitter / actualiser sa place ; statuts en attente, validé, refusé ; e-mails transactionnels (inscription, actualisation, approbation, refus).
- **Classement** : membres « actifs » (rafraîchis dans une fenêtre configurable) au-dessus des autres ; détails dans `lib/waitlist-ranking.ts`.
- **Admin** : onglets membres + journal d’actions pour les listes dont l’utilisateur est propriétaire (ou super-admin).
- **Super-admin** : vue de toutes les listes et des listes privées uniquement (`/super/waitlists`, `/super/waitlists/private`).
- **i18n** : `next-intl` ; thème clair / sombre (`next-themes`).

## Stack technique

| Domaine | Choix |
|--------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router, Turbopack en dev) |
| UI | React 19, Tailwind CSS 4, [Base UI](https://base-ui.com/) + primitives type shadcn dans `components/ui/` |
| Données | [Prisma](https://www.prisma.io/) 7, PostgreSQL (`@prisma/adapter-pg`) |
| Auth | [Better Auth](https://www.better-auth.com/) (adapter Prisma) |
| Actions serveur | [next-safe-action](https://next-safe-action.dev/) + Zod |
| E-mails | Nodemailer (SMTP) + gabarits dans `emails/` |

La structure des dossiers, les règles d’accès Prisma et la référence des modules sont décrites dans **[CONTEXT.md](./CONTEXT.md)**.

## Prérequis

- [Bun](https://bun.sh/) ou Node.js compatible avec le projet
- PostgreSQL accessible via `DATABASE_URL`

## Configuration

1. Copier l’exemple d’environnement et l’adapter :

   ```bash
   cp .env.example .env
   ```

2. Renseigner au minimum : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, et les variables **SMTP** si vous voulez les e-mails (OTP, listes d’attente).

3. Optionnel : `SEED_SUPER_ADMIN_*` pour créer ou promouvoir un super-admin au seed (voir `.env.example`).

## Démarrage local

```bash
bun install
# Appliquer le schéma (migrations Prisma selon votre flux habituel)
npx prisma migrate dev
npx prisma generate
bun run db:seed   # si vous utilisez le seed super-admin
bun run dev
```

L’application écoute en général sur [http://localhost:3000](http://localhost:3000).

## Scripts npm / Bun

| Script | Rôle |
|--------|------|
| `bun run dev` | Serveur de développement (Turbopack) |
| `bun run build` | Build production (`prebuild` lance `prisma generate`) |
| `bun run start` | Serveur Next.js en production |
| `bun run lint` | ESLint |
| `bun run format` | Prettier sur les `.ts` / `.tsx` |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:seed` | Seed Prisma (`prisma/seed.ts`) |

Le script `vercel-build` du `package.json` enchaîne migration, generate, seed et build pour un déploiement type Vercel.

## Parcours utiles (routes)

- `/login`, `/register` — connexion / inscription  
- `/waitlists` — listes publiques  
- `/waitlists/[id]` — détail d’une liste  
- `/waitlists/mine`, `/waitlists/joined` — listes créées / inscriptions  
- `/join` — rejoindre une liste privée par code  
- `/profile` — pseudo, mot de passe, e-mail  
- `/admin/waitlists/[id]` — modération  
- `/super/waitlists` — supervision (super-admin)

Pour le détail des pages et des fichiers, voir **CONTEXT.md**.

## Licence

The MIT License (MIT)
