import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hybrid Elite Mafia Creative Studio",
  description: "Ghost DAW, lyrics, custom plugins, and music production tools in one creative workspace.",
  icons: {
    icon: "/branding/hem-creative-studio-logo.webp",
    shortcut: "/branding/hem-creative-studio-logo.webp",
    apple: "/branding/hem-creative-studio-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
