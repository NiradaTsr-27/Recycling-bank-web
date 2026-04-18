import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" }, //
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const account = await prisma.account.findUnique({
          where: { username: credentials.username }, //
          include: {
            admin: true,
            employee: true,
            member: true,
          },
        });

        if (!account) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          account.password,
        );

        if (!valid) return null;

        let role: "ADMIN" | "EMPLOYEE" | "MEMBER" | null = null;
        let name = "";

        if (account.admin) {
          role = "ADMIN";
          name = `${account.admin.firstName} ${account.admin.lastName}`;
        } else if (account.employee) {
          role = "EMPLOYEE";
          name = `${account.employee.firstName} ${account.employee.lastName}`;
        } else if (account.member) {
          role = "MEMBER";
          name = `${account.member.firstName} ${account.member.lastName}`;
        }

        if (!role) return null;

        return {
          id: account.id.toString(),
          username: account.username, //  ส่ง username แทน email
          name,
          role,
          employeeId: account.employee?.id ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = (user as any).username;
        token.employeeId = (user as any).employeeId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.employeeId = token.employeeId
          ? Number(token.employeeId)
          : undefined;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
