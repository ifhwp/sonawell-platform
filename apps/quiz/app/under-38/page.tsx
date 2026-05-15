import Link from "next/link";

// TODO: Replace with Sonali's actual YouTube channel URL
const YOUTUBE_URL = "https://www.youtube.com/@sonaliwellness";

export default function Under38Page() {
  return (
    <section className="flex flex-1 flex-col justify-center text-center">
      <p className="text-xs uppercase tracking-[0.18em] text-coral font-semibold mb-4">
        Thank you for taking the quiz
      </p>
      <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-burgundy mb-5">
        This quiz was built for women 38–55
      </h1>
      <p className="text-base sm:text-lg leading-relaxed text-ink/80 mb-8 max-w-md mx-auto">
        The patterns we screen for here show up later in midlife. The good news: a lot
        of what helps then is built in the years before. Sonali shares those foundations
        on YouTube — start there.
      </p>

      <div className="flex flex-col items-center gap-4">
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy hover:bg-burgundy-700 text-white px-8 py-4 text-base font-medium transition-colors shadow-sm"
        >
          Watch on YouTube <span aria-hidden>→</span>
        </a>
        <Link href="/" className="text-sm text-muted hover:text-burgundy transition-colors">
          Back to start
        </Link>
      </div>
    </section>
  );
}
