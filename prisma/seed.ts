import { hashPassword } from "better-auth/crypto"
import "dotenv/config"
import prisma from "../lib/prisma"

/**
 * Creates or promotes the super admin user (credential account).
 * Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD in .env before running.
 */
async function main() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD
  const name = process.env.SEED_SUPER_ADMIN_NAME?.trim() || "Super Admin"

  if (!email || !password) {
    console.warn(
      "Skip seed: set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create the super admin."
    )
    return
  }

  const hashed = await hashPassword(password)

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { isSuperAdmin: true },
    })
    const hasCredential = existing.accounts.some(
      (a) => a.providerId === "credential"
    )
    if (!hasCredential) {
      await prisma.account.create({
        data: {
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: hashed,
        },
      })
    }
    console.log(`Super admin ensured for existing user: ${email}`)
    return
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: true,
      isSuperAdmin: true,
    },
  })

  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashed,
    },
  })

  console.log(`Super admin created: ${email}`)
}

main()
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
