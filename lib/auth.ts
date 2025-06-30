import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { JWT } from "next-auth/jwt";

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
      image?: string | null;
      isActive: boolean;
    }
  }

  interface User {
    id: string;
    role: Role;
    email: string;
    name?: string | null;
    image?: string | null;
    isActive: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "Enter your email"
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Enter your password"
        }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({ 
            where: { 
              email: credentials.email.toLowerCase(),
            },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              image: true,
              isActive: true,
            }
          });

          if (!user) {
            throw new Error("Invalid credentials");
          }

          if (!user.isActive) {
            throw new Error("Account is inactive. Please contact administrator.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          // Log successful login attempt
          try {
            await prisma.$transaction(async (tx) => {
              // Ganti UserActivity menjadi userActivity (camelCase)
              await tx.userActivity.create({
                data: {
                  userId: user.id,
                  type: 'LOGIN',
                  description: `Successful login from ${req.headers?.['x-forwarded-for'] || 'unknown IP'}`
                }
              });

            // Update user's updatedAt timestamp
            await tx.user.update({
              where: { id: user.id },
              data: {
                updatedAt: new Date()
              }
            });
          });
        } catch (error) {
          console.error('Failed to log login activity:', error);
        }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            isActive: user.isActive
          };
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return user?.isActive === true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    signOut: '/auth/logout',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;