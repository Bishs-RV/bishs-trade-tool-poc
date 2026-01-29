"use client";

import { BishsLayout, useMockAuth } from "@bishs-rv/bishs-global-header";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

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
        name: session.user.name ?? "Unknown User",
        email: session.user.email ?? "",
      }
    : mockAuth.user;

  const isLoading = status === "loading" || mockAuth.isLoading;

  const handleSignOut = isRealAuthActive
    ? () => nextAuthSignOut()
    : mockAuth.signOut;

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
