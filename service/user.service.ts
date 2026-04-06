/**
 * User profile persistence (Prisma). Auth/session lives in Better Auth.
 */
import prisma from "@/lib/prisma"

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  })
}

/**
 * Updates the display name (`User.name`) used as default pseudo on waitlists.
 */
export async function updateUserDisplayName(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, emailVerified: true, isSuperAdmin: true },
  })
}

/**
 * Returns true if another user already uses this e-mail (normalized lowercase).
 */
export async function isEmailTakenByOther(email: string, excludeUserId: string) {
  const normalized = email.trim().toLowerCase()
  const row = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  })
  return row != null && row.id !== excludeUserId
}
