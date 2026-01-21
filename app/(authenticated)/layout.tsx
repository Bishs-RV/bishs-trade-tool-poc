"use client";

import { BishsLayout, useMockAuth } from "@bishs-rv/bishs-global-header";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useMockAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BishsLayout user={user} onSignOut={signOut} environment="development">
      {children}
    </BishsLayout>
  );
}
