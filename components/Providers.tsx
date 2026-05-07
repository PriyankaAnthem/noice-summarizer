// src/components/Providers.tsx
// Wrap the app in NextAuth's SessionProvider so useSession() works everywhere.
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}