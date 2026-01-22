import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MockAuthProvider } from "@bishs-rv/bishs-global-header";
import "@bishs-rv/bishs-global-header/styles";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bish's Trade-In Tool",
  description: "Trade-in evaluation tool for Bish's RV",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MockAuthProvider>{children}</MockAuthProvider>
      </body>
    </html>
  );
}
