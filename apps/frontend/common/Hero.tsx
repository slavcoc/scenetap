import { demoRound } from "./demo-round";
import { MovieRound } from "./MovieRound";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(251,191,36,.08),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-20">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            New round every day · 3 movies · same for everyone
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Eavesdrop. Tap.
            <br />
            <span className="text-amber-400">Name the movie.</span>
          </h1>
          <p className="mt-4 max-w-md text-zinc-400">
            SceneTap plays a mystery movie&apos;s timeline against you. Reveal short dialogue
            exchanges, recognise the film, and score as few taps as possible. Try the demo —
            it&apos;s the real game, minus the clock.
          </p>
          <div className="mt-8 space-y-6">
            <a
              href="#"
              className="inline-block rounded-xl bg-amber-400 px-8 py-3.5 text-base font-semibold text-zinc-950 transition hover:bg-amber-300"
            >
              Play today&apos;s round
            </a>
            <div className="flex flex-wrap gap-4">
              <a
                href="#leaderboard"
                className="px-1 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                See today&apos;s board
              </a>
              <a
                href="#"
                className="px-1 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
              >
                Sign in to keep your score
              </a>
            </div>
          </div>
        </div>

        {/* Landing demo — same MovieRound the game uses, fed with demo data */}
        <MovieRound {...demoRound} label="Demo movie" showSteps allowReset />
      </div>
    </section>
  );
}
