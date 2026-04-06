import prisma from "@/lib/prisma"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // TODO: Send the OTP for sign in
        } else if (type === "email-verification") {
          // TODO: Send the OTP for email verification
        } else {
          // TODO: Send the OTP for password reset
        }
      },
    }),
  ],
})
