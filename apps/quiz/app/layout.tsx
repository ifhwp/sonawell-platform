import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "SonaWell Midlife Quiz — What's Really Blocking Your Midlife Weight & Energy?",
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
    <html lang="en" className={`${jost.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-bg text-ink">
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center px-5 py-10 sm:py-16">
          <div className="flex w-full max-w-xl flex-1 flex-col">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
