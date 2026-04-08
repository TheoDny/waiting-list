# CONTEXT — Waiting List

Documentation technique du dépôt : structure, règles d'accès aux données, et référence des modules principaux (signatures et rôle).

## Règle Prisma

- **Seuls les fichiers sous `service/`** exécutent des requêtes Prisma pour le domaine métier (listes, membres, profil, journaux).
- **Exception documentée** : [`lib/auth.ts`](lib/auth.ts) utilise `prismaAdapter(prisma)` pour Better Auth. Aucune autre couche ne doit importer Prisma pour du métier.

## Structure des dossiers

| Dossier | Rôle |
|--------|------|
| [`app/`](app/) | App Router : zone connectée `(app)/`, zone sans session `(public)/` (listes publiques + détail), API [`app/api/auth/[...auth]/route.ts`](app/api/auth/[...auth]/route.ts). **Pas de pages `app/login` ni `app/register`** : connexion / inscription invité via la modale [`AuthDialog`](components/dialog/AuthDialog.tsx) dans l’en-tête. |
| [`action/`](action/) | Server Actions (`next-safe-action`) : validation Zod, session, appel des **services** uniquement. |
| [`service/`](service/) | Logique métier + Prisma + envoi d'e-mails via `mail.service`. |
| [`components/`](components/) | UI (shadcn / Base UI) et blocs métier (`waitlist/`, `auth/`, `layout/`). |
| [`emails/`](emails/) | Gabarits React Email (`@react-email/components` + `render`) pour les e-mails transactionnels. |
| [`lib/`](lib/) | Auth serveur/client, SMTP, helpers (classement, config env), client d'API auth JSON. |
| [`prisma/`](prisma/) | Schéma, migrations, seed super-admin. |
| [`provider/`](provider/) | Contexte dialog de confirmation global. |
| [`generated/prisma/`](generated/prisma/) | Client et types générés (ne pas éditer). |

## Dossier `components/`

Organisation : privilégier les primitives dans [`components/ui/`](components/ui/) pour tout nouveau écran ; placer la logique métier et les appels aux **Server Actions** dans des sous-dossiers par domaine (`auth/`, `waitlist/`, etc.). Les composants marqués `"use client"` sont indiqués ci-dessous.

### [`components/ui/`](components/ui/) — primitives d'interface

Composants génériques (Base UI + Tailwind + `cva`), sans accès Prisma ni actions serveur directes.

| Fichier | Exports principaux | Rôle |
|---------|-------------------|------|
| [`alert-dialog.tsx`](components/ui/alert-dialog.tsx) | `AlertDialog`, `AlertDialogContent`, `AlertDialogAction`, `AlertDialogCancel`, … | Modales de confirmation destructives. |
| [`alert.tsx`](components/ui/alert.tsx) | `Alert`, variantes | Bandeaux d'alerte. |
| [`badge.tsx`](components/ui/badge.tsx) | `Badge` | Pastilles de statut / libellés. |
| [`button.tsx`](components/ui/button.tsx) | `Button`, `buttonVariants` | Bouton ; `buttonVariants` pour styliser un `Link` comme un bouton. |
| [`card.tsx`](components/ui/card.tsx) | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Conteneurs de cartes. |
| [`dialog.tsx`](components/ui/dialog.tsx) | `Dialog`, `DialogContent`, `DialogTrigger`, `DialogHeader`, … | Modales génériques. |
| [`dropdown-menu.tsx`](components/ui/dropdown-menu.tsx) | Primitives menu déroulant | Menus contextuels. |
| [`field.tsx`](components/ui/field.tsx) | `Field`, `FieldLabel`, `FieldDescription`, … | Groupe champ + label (formulaires). |
| [`input.tsx`](components/ui/input.tsx) | `Input` | Champ texte. |
| [`input-group.tsx`](components/ui/input-group.tsx) | `InputGroup`, … | Champ avec préfixe / suffixe. |
| [`input-otp.tsx`](components/ui/input-otp.tsx) | `InputOTP`, … | Saisie OTP (si besoin UI dédiée). |
| [`label.tsx`](components/ui/label.tsx) | `Label` | Label accessible. |
| [`radio-group.tsx`](components/ui/radio-group.tsx) | `RadioGroup`, `RadioGroupItem` | Choix unique dans une liste. |
| [`separator.tsx`](components/ui/separator.tsx) | `Separator` | Séparateur visuel. |
| [`sonner.tsx`](components/ui/sonner.tsx) | `Toaster` *(client)* | Toasts thémés (`next-themes` + Hugeicons). |
| [`spinner.tsx`](components/ui/spinner.tsx) | `Spinner` | Indicateur de chargement. |
| [`switch.tsx`](components/ui/switch.tsx) | `Switch` | Interrupteur on/off. |
| [`tabs.tsx`](components/ui/tabs.tsx) | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` *(client)* | Onglets (admin liste, login). |
| [`textarea.tsx`](components/ui/textarea.tsx) | `Textarea` | Zone de texte multiligne. |
| [`tooltip.tsx`](components/ui/tooltip.tsx) | `Tooltip`, … | Infobulles (wrappées par `TooltipProvider` dans le layout). |

### [`components/dialog/`](components/dialog/)

| Fichier | Composant | Signature / props | Description |
|---------|-----------|-----------------|-------------|
| [`ConfirmDialog.tsx`](components/dialog/ConfirmDialog.tsx) | `ConfirmDialog` *(client)* | `open`, `title?`, `description?`, `onConfirm`, `onCancel` | Dialogue Oui/Non branché sur [`provider/ConfirmationProvider.tsx`](provider/ConfirmationProvider.tsx). |
| [`AuthDialog.tsx`](components/dialog/AuthDialog.tsx) | `AuthDialog` *(client)* | *(aucune prop)* | Remplace les anciennes routes `/login` et `/register` : `Dialog` avec déclencheur stylé en bouton (`buttonVariants`), id **`login-dialog-trigger`** pour ouverture programmatique (ex. CTA « Se connecter » sur une page publique). Contenu : bascule locale `login` \| `register` entre [`LoginForm`](components/auth/login-form.tsx) et [`RegisterForm`](components/auth/register-form.tsx). `callbackUrl` passé aux formulaires = [`getSafeRedirectPath`](lib/utils.ts)(`pathname`) lorsque le chemin ne commence pas par `/login` ni `/register` (évite de renvoyer vers d’anciennes URLs réservées). |

### [`components/layout/`](components/layout/)

| Fichier | Composant | Description |
|---------|-----------|-------------|
| [`app-header.tsx`](components/layout/app-header.tsx) | `AppHeader` *(async RSC)* | En-tête toujours rendu : session optionnelle + [`getUserById`](service/user.service.ts) si connecté ; délègue à `AppHeaderBar` (`isAuthenticated`, `isSuperAdmin`). |
| [`app-header-bar.tsx`](components/layout/app-header-bar.tsx) | `AppHeaderBar` *(client)* | Invité : « Listes publiques », aide, langue, thème, **[`AuthDialog`](components/dialog/AuthDialog.tsx)** (connexion / création de compte en modale, plus de navigation vers `/login` ou `/register`). Connecté : nav complète (mes listes, inscriptions, code privé, super-admin si applicable), profil, déconnexion. Style actif via [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname). |
| [`sign-out-button.tsx`](components/layout/sign-out-button.tsx) | `SignOutButton` *(client)* | `authClient.signOut()` puis `router.push("/")` et `router.refresh()` (retour zone publique, pas de page `/login`). |

### [`components/auth/`](components/auth/)

| Fichier | Composant | Description |
|---------|-----------|-------------|
| [`login-form.tsx`](components/auth/login-form.tsx) | `LoginForm` *(client)* | Prop optionnelle `callbackUrl` : redirection après succès. Onglets mot de passe (`authClient.signIn.email`) et OTP (`authPost` vers `/email-otp/…`, `/sign-in/email-otp`). Utilisé dans [`AuthDialog`](components/dialog/AuthDialog.tsx) et réutilisable hors modale. |
| [`register-form.tsx`](components/auth/register-form.tsx) | `RegisterForm` *(client)* | Prop optionnelle `callbackUrl`. Inscription `authClient.signUp.email`. Utilisé dans [`AuthDialog`](components/dialog/AuthDialog.tsx). |

### [`components/waitlist/`](components/waitlist/)

| Fichier | Composant | Description |
|---------|-----------|-------------|
| [`public-waitlist-search.tsx`](components/waitlist/public-waitlist-search.tsx) | `PublicWaitlistSearch` *(client)* | Champ recherche + navigation `?q=` ; prop optionnelle `actionBasePath` (`/waitlists` ou `/super/waitlists`). |
| [`waitlist-detail-client.tsx`](components/waitlist/waitlist-detail-client.tsx) | `WaitlistDetailClient` *(client)* | Détail liste : rejoindre (dialog pseudo), actualiser, quitter, classement (PENDING, effectif affiché, fenêtre + rang en **VIEW_YOURSELF**), bouton admin si propriétaire / super-admin ; `joinCode` visible seulement pour eux sur liste privée. |
| [`join-private-form.tsx`](components/waitlist/join-private-form.tsx) | `JoinPrivateForm` *(client)* | Résolution code → `resolveJoinCodeAction` → redirection avec `?code=`. |
| [`mine-waitlists-client.tsx`](components/waitlist/mine-waitlists-client.tsx) | `MineWaitlistsClient` *(client)* | CRUD listes possédées (création / édition dialog, suppression confirmée). |
| [`joined-waitlists-client.tsx`](components/waitlist/joined-waitlists-client.tsx) | `JoinedWaitlistsClient` *(client)* | Inscriptions de l'utilisateur : rang, refresh, quitter. |
| [`admin-waitlist-client.tsx`](components/waitlist/admin-waitlist-client.tsx) | `AdminWaitlistClient` *(client)* | Onglets membres (PENDING / APPROVED / REFUSED) + journal ; `setMemberStatusAction`, suppression liste. |

### [`components/profile/`](components/profile/)

| Fichier | Composant | Description |
|---------|-----------|-------------|
| [`profile-form.tsx`](components/profile/profile-form.tsx) | `ProfileForm` *(client)* | `updateProfileNameAction` ; changement de mot de passe via `authPost` (`/change-password`) ; changement d'e-mail via `authPost` (`/email-otp/request-email-change`, `/email-otp/change-email`). |

### [`components/select/`](components/select/)

| Fichier | Composant | Description |
|---------|-----------|-------------|
| [`select-theme.tsx`](components/select/select-theme.tsx) | Sélecteur de thème | Thème clair / sombre / système (`next-themes`). |
| [`select-language.tsx`](components/select/select-language.tsx) | Sélecteur de langue | Cookie `NEXT_LOCALE` (next-intl). |

## Variables d'environnement (référence)

Voir [`.env.example`](.env.example) : limites `MAX_*`, SMTP, Better Auth, `DATABASE_URL`, seed `SEED_SUPER_ADMIN_*`.

## Référence par fichier

### `lib/`

| Fichier | Exports / signatures | Description |
|---------|----------------------|-------------|
| [`lib/auth.ts`](lib/auth.ts) | `auth` (Better Auth) | Config adapter Prisma, `emailAndPassword`, plugin `emailOTP` + `changeEmail.enabled`, champs utilisateur additionnels `isSuperAdmin`. |
| [`lib/auth-server.ts`](lib/auth-server.ts) | `getSession()`| Session HTTP via `auth.api.getSession`. |
| [`lib/auth-client.ts`](lib/auth-client.ts) | `authClient`, `signIn`, `signUp`, `signOut`, `useSession` | Client React Better Auth + `emailOTPClient`. |
| [`lib/prisma.ts`](lib/prisma.ts) | `default` PrismaClient | Singleton avec adaptateur `pg`. |
| [`lib/safe-action.ts`](lib/safe-action.ts) | `actionClient`, `authedAction` | Client safe-action + middleware session obligatoire. |
| [`lib/smtp.ts`](lib/smtp.ts) | `getSmtpTransport()` | Transport Nodemailer (exige `SMTP_HOST` / `SMTP_PORT`). |
| [`lib/utils.ts`](lib/utils.ts) | `cn(...)`, `getSafeRedirectPath(pathname)` | Utilitaire Tailwind / clsx ; `getSafeRedirectPath` limite les redirections post-auth aux chemins internes sûrs (utilisé par `AuthDialog` / formulaires). |
| [`lib/waitlist-config.ts`](lib/waitlist-config.ts) | `maxWaitlistsPerUser()`, `maxMembersPerWaitlist()`, `maxAdminLogsPerWaitlist()`, constantes `REFRESH_COOLDOWN_DAYS`, `RANKING_ACTIVE_WINDOW_DAYS`, `MAX_WAITLIST_DESCRIPTION_LENGTH` | Limites depuis `process.env` + longueur max de la description liste. |
| [`lib/waitlist-ranking.ts`](lib/waitlist-ranking.ts) | `isActiveForRanking(lastRefreshedAt, now?)`, `sortMembersByRanking(members, now?)`, `rankInSortedList(sorted, userId, getUserId)` | Classement : actifs (rafraîchi ≤ 10 j) au-dessus ; tri join puis refresh. |

### `service/`

| Fichier | Fonctions principales | Description |
|---------|----------------------|-------------|
| [`service/mail.service.ts`](service/mail.service.ts) | Idem + `getTranslations` / `getLocale` (`next-intl`, namespace `Email`) pour construire les `*Copy` passés aux gabarits | Envoi SMTP + i18n des e-mails. |
| [`service/user.service.ts`](service/user.service.ts) | `getUserById`, `updateUserDisplayName`, `isEmailTakenByOther` | Profil utilisateur (Prisma). |
| [`service/waiting-list.service.ts`](service/waiting-list.service.ts) | `findWaitlistIdByJoinCode`, `listPublicWaitlists`, `listAllWaitlistsForSuperAdmin`, `listPrivateWaitlistsForSuperAdmin`, `assertWaitlistAccess`, `getWaitlistDetailForUi`, `listMyOwnedWaitlists`, `listMyJoinedWaitlists`, `JoinedWaitlistSummary`, `createWaitlist`, `updateWaitlist`, `deleteWaitlistByOwner`, `joinWaitlist`, `leaveWaitlist`, `refreshWaitlistMembership` | Cycle de vie des listes et inscriptions. |
| [`service/waiting-list-manage.service.ts`](service/waiting-list-manage.service.ts) | `assertCanManageWaitlist`, `getWaitlistMetaForAdmin`, `appendAdminLog`, `listAdminLogs`, `listMembersForAdmin`, `setMemberStatus`, `deleteWaitlistAsAdmin` | Admin liste + journal (tronqué à `MAX_LOG_ACTION_BY_WAITLIST`). |

### `action/`

Toutes les actions : `"use server"`, schémas **Zod**, `authedAction` sauf mention contraire.

| Fichier | Actions | Description |
|---------|---------|-------------|
| [`action/user.action.ts`](action/user.action.ts) | `updateProfileNameAction` | Mise à jour du pseudo. |
| [`action/waiting-list.action.ts`](action/waiting-list.action.ts) | `listPublicWaitlistsAction`, `listSuperAdminWaitlistsAction`, `resolveJoinCodeAction`, `getWaitlistDetailAction`, `listMyOwnedWaitlistsAction`, `listMyJoinedWaitlistsAction`, `createWaitlistAction`, `updateWaitlistAction`, `deleteWaitlistAction`, `joinWaitlistAction`, `leaveWaitlistAction`, `refreshWaitlistAction` | Flux listes côté utilisateur connecté. |
| [`action/waiting-list-manage.action.ts`](action/waiting-list-manage.action.ts) | `listAdminMembersAction`, `listAdminLogsAction`, `setMemberStatusAction`, `deleteWaitlistManageAction` | Modération et logs. |

### `emails/`

| Fichier | Exports | Description |
|---------|---------|-------------|
| [`emails/email-shell.tsx`](emails/email-shell.tsx) | `EmailShell` | Enveloppe commune (Html, Tailwind, Preview, pied de page). |
| [`emails/otp-email.tsx`](emails/otp-email.tsx) | `OtpEmail`, `getOtpEmailHtml`, types `AuthOtpType`, `OtpEmailCopy` | Gabarit OTP ; textes fournis par `mail.service` via `next-intl` (`Email`). |
| [`emails/waitlist-email.tsx`](emails/waitlist-email.tsx) | `WaitlistEmail`, helpers `waitlist*Html`, types `*Copy` | Notifications liste d’attente ; textes résolus dans `mail.service` (`Email`). |

### `prisma/`

| Fichier | Rôle |
|---------|------|
| [`prisma/schema.prisma`](prisma/schema.prisma) | Modèles `User` (+ `isSuperAdmin`), `Waitlist` (+ `description` optionnelle), `WaitlistMember`, `WaitlistAdminLog`, enums `WaitlistVisibilityMode`, `WaitlistMemberStatus`. |
| [`prisma/seed.ts`](prisma/seed.ts) | Crée / promeut le super-admin (`SEED_SUPER_ADMIN_*`). |

### Pages notables (`app/`)

- `/` : redirection vers `/waitlists`.
- **Authentification invité** : pas de routes dédiées `/login` ni `/register` sous `app/` ; utiliser la modale **`AuthDialog`** dans l’en-tête (`AppHeader` / `AppHeaderBar`). Les formulaires Better Auth (mot de passe + OTP) vivent dans [`login-form.tsx`](components/auth/login-form.tsx) et [`register-form.tsx`](components/auth/register-form.tsx).
- **Accès sans session au groupe `(app)/`** : [`app/(app)/layout.tsx`](app/(app)/layout.tsx) (et garde-fous comme [`profile/page.tsx`](app/(app)/profile/page.tsx)) redirigent vers `/` ; l’utilisateur peut ensuite ouvrir **`AuthDialog`** pour se connecter.
- `/waitlists` : listes publiques + recherche (accessible sans session, layout `(public)/`).
- `/waitlists/[id]` : détail et classement ; rejoindre nécessite une session (CTA connexion sinon). Liste privée : accès avec `?code=` ou membre / owner / super-admin.
- `/waitlists/mine`, `/waitlists/joined` : listes créées / inscriptions.
- `/join` : saisie du code liste privée.
- `/profile` : pseudo, changement de mot de passe (session + mot de passe actuel), changement d'e-mail par OTP.
- `/admin/waitlists/[id]` : onglets en attente / validés / refusés / journal.
- `/super/waitlists` : toutes les listes (super-admin uniquement).
- `/super/waitlists/private` : listes privées uniquement (`isPublic: false`, super-admin uniquement).

---

*Mettre à jour ce fichier lors de toute évolution des signatures ou de la structure.*
