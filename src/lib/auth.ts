import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { nextCookies } from "better-auth/next-js";

const prisma = new PrismaClient();

const ALLOWED_AUTH_EMAILS = new Set(["nishakp3005@gmail.com", "nishitalibrary@gmail.com"]);

const normalizeEmail = (email?: string | null) =>
  email?.trim().toLowerCase() ?? "";

const isEmailAllowed = (email?: string | null) =>
  ALLOWED_AUTH_EMAILS.has(normalizeEmail(email));

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email)) {
            return false;
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          });

          if (!isEmailAllowed(user?.email)) {
            return false;
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
