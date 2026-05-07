// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Use JWT strategy (no DB adapter needed — userId lives in the token)
  session: { strategy: "jwt" },

  callbacks: {
    // Embed the Google sub (stable unique ID) into the JWT
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.sub  = profile.sub ?? token.sub;
        token.name  = profile.name;
        token.email = profile.email;
        token.image = (profile as any).picture ?? null;
      }
      return token;
    },

    // Expose userId + image to the client session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id    = token.sub;
        (session.user as any).image = token.image as string | null;
      }
      return session;
    },
  },

  // The raw JWT is forwarded to the backend as a Bearer token so FastAPI can
  // verify it with the same NEXTAUTH_SECRET.
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };