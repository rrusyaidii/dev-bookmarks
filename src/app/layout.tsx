import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevMark — Dev Bookmarks Dashboard",
  description: "Save, organize, and browse your dev resources effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-bg text-fg font-sans">
        {children}
      </body>
    </html>
  );
}
