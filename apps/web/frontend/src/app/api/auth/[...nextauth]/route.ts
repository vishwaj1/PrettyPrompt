import NextAuth from "next-auth/next";
import Google    from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient }  from "@prisma/client";
import bcrypt from "bcryptjs";

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
      credentials: { email:{}, password:{} },
      async authorize(creds) {
        const { email, password } = creds as { email: string; password: string };
        const user = await prisma.user.findUnique({ where:{ email } });
        if (!user?.passwordHash) throw new Error("No user");
        const ok = await bcrypt.compare(password, user.passwordHash!);
        if (!ok) throw new Error("Wrong password");
        return { id: user.id, email: user.email };
      },
    }),
  ],

  session: { strategy: "jwt" as const },
  secret : process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

/* VERY IMPORTANT:  export both methods */
export { handler as GET, handler as POST };
