import prisma from "@/lib/prisma"
import { sendAuthOtpEmail } from "@/service/mail.service"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import type { AuthOtpType } from "@/emails/otp-email"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      isSuperAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      changeEmail: { enabled: true },
      async sendVerificationOTP({ email, otp, type }) {
        await sendAuthOtpEmail(email, otp, type as AuthOtpType)
      },
    }),
  ],
})
