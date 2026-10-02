const TESTIMONIALS = [
  {
    name: "Maya R.",
    meta: "Day 6 · 🔥 streak 6",
    quote:
      "I told myself one round before bed. It's 2am and I've replayed the demo twice. The 'just one more tap' pull is real.",
  },
  {
    name: "Jonas K.",
    meta: "7-day board · #11",
    quote:
      "Chasing my friend on the weekly board is the only competition I care about. We send each other our dots every midnight.",
  },
  {
    name: "Priya S.",
    meta: "🟢🟢🔴 · 255 pts",
    quote:
      "The moment a line clicks and you just KNOW the movie — better than coffee. Three movies a day, every day.",
  },
  {
    name: "Diego M.",
    meta: "Day 14 · 🔥 streak 12",
    quote:
      "I came for the quotes, stayed for the streak. Breaking it would genuinely ruin my morning.",
  },
  {
    name: "Aisha T.",
    meta: "Group chat champion",
    quote:
      "My group chat shares our cards at midnight. Loser buys the popcorn. I have not bought popcorn yet.",
  },
  {
    name: "Tom L.",
    meta: "🟢🟢🟢 · 285 pts",
    quote:
      "Three taps, three greens, 285 points. I'm still chasing the perfect 300 and I think about it at work.",
  },
  {
    name: "Sofia G.",
    meta: "Plays with her dad",
    quote:
      "It's the only daily game my dad and I both play. He's winning. For now.",
  },
  {
    name: "Chris B.",
    meta: "7-day board · #4",
    quote:
      "I've never rewatched so many movies in my life. This game is basically film school with a leaderboard.",
  },
  {
    name: "Nina P.",
    meta: "Today's board · #9",
    quote:
      "Top 50 felt impossible at first. This morning I opened the board and I was #9. Instant screenshot, instant motivation.",
  },
  {
    name: "Marcus W.",
    meta: "🟢🟡🟡 · 190 pts",
    quote:
      "The tap mechanic is genius — every tap is a gamble, every guess is a dare. The board makes it personal.",
  },
];

export function Testimonials() {
  return (
    <section
      aria-label="What players are saying"
      className="border-t border-white/5 bg-zinc-900/30"
    >
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">What players are saying</h2>
          <p className="mx-auto mb-10 mt-1 max-w-md text-sm text-zinc-400">
            Fun to play, hard to put down — and everyone&apos;s chasing the board.
          </p>
        </div>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="mb-4 break-inside-avoid rounded-2xl border border-white/10 bg-zinc-900/60 p-5"
            >
              <blockquote className="text-sm leading-relaxed text-zinc-300">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/30 to-amber-400/10 text-xs font-bold text-amber-300"
                >
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-zinc-200">{t.name}</p>
                  <p className="truncate font-mono text-[10px] text-zinc-500">{t.meta}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
