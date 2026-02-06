import { Header } from "@/components/layout/Header";
import { Providers } from "@/app/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAA Rocky Point Tracker",
  description: "Track MAA Rocky Point apartment availability and pricing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-[#020b19] text-white">
            <Header />
            <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
