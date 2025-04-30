// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import Google    from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient }  from "@prisma/client";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt"
import { User, Session } from "next-auth"

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const { email, password } = creds as { email: string; password: string };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) throw new Error("Invalid credentials");
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new Error("Invalid credentials");
        return { id: user.id, email: user.email };
      },
    }),
  ],

  session: { strategy: "jwt" as const },
  secret:  process.env.NEXTAUTH_SECRET,

  callbacks: {
    // 1) On first sign-in, persist user.id into the token
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    // 2) On each request, copy token.sub into session.user.id
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
