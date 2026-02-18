"use client";

import { BishsLayout, useMockAuth } from "@bishs-rv/bishs-global-header";
import { useSession, signIn, signOut as nextAuthSignOut } from "next-auth/react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mockAuth = useMockAuth();
  const { data: session, status } = useSession();

  // Use real auth if session exists, otherwise fall back to mock
  const isRealAuthActive = status === "authenticated" && session?.user;

  const user = isRealAuthActive
    ? {
        name: session.user.name
          ?? session.user.email?.split("@")[0]
          ?? session.user.email
          ?? "Unknown User",
        email: session.user.email ?? "",
      }
    : mockAuth.user;

  const isLoading = status === "loading" || mockAuth.isLoading;

  const handleSignOut = isRealAuthActive
    ? () => nextAuthSignOut()
    : mockAuth.signOut;

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";

  // In production/preview: redirect unauthenticated users to sign in
  // In development: fall back to mock auth for local testing
  if (status === "unauthenticated" && isProduction) {
    signIn();
    return <div>Redirecting to sign in...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BishsLayout
      user={user}
      onSignOut={handleSignOut}
      environment={
        process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
          ? "production"
          : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
            ? "staging"
            : "development"
      }
    >
      {children}
    </BishsLayout>
  );
}
