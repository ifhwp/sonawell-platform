import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SonaWell Midlife Quiz — What's Really Blocking Your Midlife Weight & Energy?",
  description:
    "A 60-second quiz from Sonali Surve, DTR. Identify which of the 4 midlife blocks is running the show and get a personalized starting point.",
  openGraph: {
    title: "SonaWell Midlife Quiz",
    description: "What's Really Blocking Your Midlife Weight & Energy?",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <main className="flex-1 flex flex-col items-center px-5 py-8 sm:py-12">
          <div className="w-full max-w-xl flex-1 flex flex-col">{children}</div>
        </main>
        <footer className="text-center text-xs text-muted py-6 px-4">
          Built by Sonali Surve, DTR · © {new Date().getFullYear()} SonaWell
        </footer>
      </body>
    </html>
  );
}
