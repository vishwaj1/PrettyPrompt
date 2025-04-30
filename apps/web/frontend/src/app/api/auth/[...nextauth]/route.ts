// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize NextAuth with your imported options
const handler = NextAuth(authOptions);

// Only these two exports are allowed in an App-Router API route
export { handler as GET, handler as POST };
