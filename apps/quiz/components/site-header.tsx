import Image from "next/image";
import Link from "next/link";
import logo from "@/public/sonawell-logo.png";

const SITE = "https://www.sonaliwellness.com";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <a
          href={SITE}
          className="flex items-center gap-2.5"
          aria-label="SonaWell home"
        >
          <Image src={logo} alt="" width={34} height={34} priority />
          <span className="text-lg font-semibold tracking-tight text-ink">
            SonaWell
          </span>
        </a>
        <nav className="flex items-center gap-7 text-sm font-medium">
          <Link href="/" className="text-ink transition-colors hover:text-green">
            Quiz
          </Link>
          <a
            href={`${SITE}/about-us`}
            className="text-ink transition-colors hover:text-green"
          >
            About Us
          </a>
        </nav>
      </div>
    </header>
  );
}
