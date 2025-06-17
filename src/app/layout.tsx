import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Document Copilot",
  description: "AI-powered document editing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="mx-auto w-[80vw] max-w-[1200px]">
          <header className="flex justify-end p-4">
            <Link href="/config" className="underline">
              Config
            </Link>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
