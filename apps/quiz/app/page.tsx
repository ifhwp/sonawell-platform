import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="flex flex-1 flex-col justify-center text-center sm:text-left">
      <p className="text-xs uppercase tracking-[0.18em] text-grape font-semibold mb-4">
        SonaWell Midlife Quiz
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-ink mb-5">
        What&rsquo;s Really Blocking Your Midlife Weight &amp; Energy?
      </h1>
      <p className="text-lg leading-relaxed text-ink/80 mb-8">
        &ldquo;I don&rsquo;t feel myself.&rdquo; &ldquo;I always feel tired.&rdquo;
        &ldquo;I feel overweight and bloated.&rdquo; If any of that sounds like you,
        this 60-second quiz finds the pattern behind it &mdash; and gives you a
        personalized starting point.
      </p>

      <Link
        href="/quiz/1"
        className="inline-flex items-center justify-center gap-2 self-center sm:self-start rounded-full bg-green hover:bg-green-700 text-white px-8 py-4 text-base font-medium transition-colors shadow-sm"
      >
        Start the Quiz <span aria-hidden>→</span>
      </Link>

      <p className="mt-8 text-sm text-muted">
        Built by Sonali Surve, DTR · 60 seconds · 8 questions
      </p>
    </section>
  );
}
