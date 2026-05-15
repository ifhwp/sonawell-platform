import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="flex flex-1 flex-col justify-center text-center sm:text-left">
      <p className="text-xs uppercase tracking-[0.18em] text-coral font-semibold mb-4">
        SonaWell Midlife Quiz
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-burgundy mb-5">
        What&rsquo;s Really Blocking Your Midlife Weight &amp; Energy?
      </h1>
      <p className="text-lg leading-relaxed text-ink/80 mb-8">
        Most midlife women are solving the wrong problem. This 60-second quiz identifies
        which of the 4 midlife blocks is running the show &mdash; and gives you a
        personalized starting point.
      </p>

      <Link
        href="/quiz/1"
        className="inline-flex items-center justify-center gap-2 self-center sm:self-start rounded-full bg-burgundy hover:bg-burgundy-700 text-white px-8 py-4 text-base font-medium transition-colors shadow-sm"
      >
        Start the Quiz <span aria-hidden>→</span>
      </Link>

      <p className="mt-8 text-sm text-muted">
        Built by Sonali Surve, DTR · 60 seconds · 8 questions
      </p>
    </section>
  );
}
