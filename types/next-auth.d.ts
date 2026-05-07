// ══════════════════════════════════════════════════════
//  INSTALL — run this in your Next.js project root
// ══════════════════════════════════════════════════════
//
//  npm install next-auth
//
// That's the only new dependency needed on the frontend.
// ══════════════════════════════════════════════════════


// src/types/next-auth.d.ts
// Augment the NextAuth session type so TypeScript knows about session.user.id

import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id:    string
      name:  string | null
      email: string | null
      image: string | null
    }
  }
}