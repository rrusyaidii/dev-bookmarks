import type { Metadata } from "next";
import { Figtree, JetBrains_Mono, Syne } from "next/font/google";
import { AuthRecoveryListener } from "@/components/AuthRecoveryListener";
import { APPEARANCE_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-figtree",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevMark — Signal shelf for your links",
  description: "Save, tag, and browse your developer resources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="forge"
      data-mode="dark"
      className={`h-full antialiased ${figtree.variable} ${jetbrains.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-bg text-fg font-sans">
        <AuthRecoveryListener />
        {children}
      </body>
    </html>
  );
}
