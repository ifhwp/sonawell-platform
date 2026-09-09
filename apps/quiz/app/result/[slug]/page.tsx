import { notFound } from "next/navigation";
import Link from "next/link";
import { RESULT_TYPES, RESULT_SUMMARIES, isResultType } from "@/lib/questions";
import { RESULT_CONTENT } from "@/content/results";

export function generateStaticParams() {
  return RESULT_TYPES.map((slug) => ({ slug }));
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isResultType(slug)) notFound();

  const content = RESULT_CONTENT[slug];

  return (
    <article className="flex flex-1 flex-col">
      <p className="text-xs uppercase tracking-[0.18em] text-grape font-semibold mb-3">
        Your result
      </p>
      <h1 className="text-3xl sm:text-4xl font-semibold text-ink leading-tight">
        {content.headline}
      </h1>

      <div className="mt-6 rounded-2xl border border-card-border bg-card px-5 py-4">
        <p className="text-sm text-ink/80 leading-relaxed">
          {RESULT_SUMMARIES[slug]}
        </p>
      </div>

      <p className="mt-8 text-lg text-ink/85 leading-relaxed">{content.intro}</p>

      <Section title="Your 5-Habit Reset">
        <ol className="space-y-3 list-decimal pl-5">
          {content.fiveHabitReset.map((habit, i) => (
            <li key={i} className="text-base text-ink/85 leading-relaxed">
              {habit}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Your first 7 days">
        <ul className="space-y-3">
          {content.firstSevenDays.map((day, i) => (
            <li key={i} className="text-base text-ink/85 leading-relaxed">
              {day}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="What's next">
        <p className="text-base text-ink/85 leading-relaxed">{content.closing}</p>
      </Section>

      <div className="mt-12 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted mb-4">
          Check your inbox — a copy is on its way.
        </p>
        <Link
          href="/"
          className="text-sm text-green hover:text-green-700 underline"
        >
          Take the quiz again
        </Link>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-ink mb-4">{title}</h2>
      {children}
    </section>
  );
}
