import NextAuth from "next-auth";
import Google    from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const { GET, POST } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId:     process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: { email:{}, password:{} },
      async authorize(creds) {
        const { email, password } = creds as any;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) throw new Error("No user");
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new Error("Invalid password");
        return { id: user.id, email: user.email };
      },
    })
  ],

  session: { strategy: "jwt" },
  secret:  process.env.NEXTAUTH_SECRET,
});
