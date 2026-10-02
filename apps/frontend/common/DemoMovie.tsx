"use client";

import { useCallback, useMemo, useRef, useState } from "react";

/* ── Demo content (fictional movie, invented lines) ──────────────────── */

const RUNTIME_MIN = 118;
const MAX_FREE_TAPS = 3;
const TAP_COST = 15;

const CORRECT_TITLE = "The Ledger";
const OPTIONS = [CORRECT_TITLE, "Midnight Train", "Paper Streets", "Cold Harbor"];

/** Deterministic PRNG so the waveform is identical on server and client
 * (no hydration mismatch) and stable across re-renders. */
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const WAVE_BARS = 64;

type Exchange = { minute: number; speaker: string; line: string };
/** One reveal action produces one batch of exchanges. */
type Batch = { id: number; label: string; exchanges: Exchange[] };

const fmtMinute = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

/** Curated pins — free to reveal, marked ⭐ on the timeline. */
const FIXED: Exchange[] = [
  { minute: 42, speaker: "WALTER", line: "You're three minutes late, Frank. I keep a ledger." },
  { minute: 72, speaker: "FRANK", line: "Three minutes I'll never get back." },
];

/** Dense ranked pool — free taps reveal the closest entries. */
const POOL: Exchange[] = [
  { minute: 4, speaker: "ESTHER", line: "You brought the rain with you." },
  { minute: 9, speaker: "WALTER", line: "I bring a lot of things." },
  { minute: 17, speaker: "FRANK", line: "The safe opens at midnight. It's old-fashioned that way." },
  { minute: 23, speaker: "ESTHER", line: "Everyone in this city has a second name." },
  { minute: 31, speaker: "WALTER", line: "Ledgers don't lie. People do." },
  { minute: 38, speaker: "FRANK", line: "You think I'd cross you over a suitcase?" },
  { minute: 47, speaker: "ESTHER", line: "The bridge is watched from both ends." },
  { minute: 56, speaker: "WALTER", line: "Burn the page, and the debt still stands." },
  { minute: 64, speaker: "FRANK", line: "I've been followed since Tuesday." },
  { minute: 83, speaker: "ESTHER", line: "Then Tuesday owes you an apology." },
  { minute: 95, speaker: "WALTER", line: "Every partner I ever had is buried in this city." },
  { minute: 103, speaker: "FRANK", line: "So that's why you called me." },
  { minute: 113, speaker: "ESTHER", line: "Nobody leaves the ledger." },
];

/* ── Step legend (replaces the old “how it works” section) ───────────── */

const STEPS = [
  { icon: "👆", title: "Tap the timeline" },
  { icon: "💬", title: "Eavesdrop" },
  { icon: "🎯", title: "Name the movie" },
];

/* ── Component ───────────────────────────────────────────────────────── */

export function DemoMovie() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [freeTaps, setFreeTaps] = useState(0);
  const [fixedShown, setFixedShown] = useState<boolean[]>(FIXED.map(() => false));
  const [guess, setGuess] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; minute: number } | null>(null);

  const done = guess !== null;

  /** Waveform bar heights — deterministic (seeded), with scene-like peaks. */
  const waveform = useMemo(() => {
    const rnd = mulberry32(1337);
    return Array.from({ length: WAVE_BARS }, (_, i) => {
      const scene = Math.abs(Math.sin(i * 0.55)) * 0.45 + Math.abs(Math.sin(i * 0.21 + 1.7)) * 0.3;
      return Math.min(1, 0.12 + scene + rnd() * 0.3);
    });
  }, []);

  /** Bar indices that already have a revealed exchange (light up on the wave). */
  const revealedBars = useMemo(() => {
    const set = new Set<number>();
    for (const b of batches) {
      for (const x of b.exchanges) set.add(Math.round((x.minute / RUNTIME_MIN) * (WAVE_BARS - 1)));
    }
    return set;
  }, [batches]);

  /** Hovered bar index (±2 bars glow around the playhead). */
  const hoverBar = hover ? Math.round((hover.x / 100) * (WAVE_BARS - 1)) : -1;

  /** Which of the 3 steps is live right now. */
  const step = done ? 2 : batches.length > 0 ? 1 : 0;

  /** Exchange minutes already on the transcript (ref so batch pushes stay
   * deduped without making setState updaters impure). */
  const revealedMinutes = useRef<Set<number>>(new Set());
  const batchId = useRef(0);

  const pushBatch = useCallback((label: string, exchanges: Exchange[]) => {
    // Mutations happen here, NOT inside the setState updater — StrictMode
    // double-invokes updaters in dev, which would swallow the batch.
    const fresh = exchanges.filter((x) => !revealedMinutes.current.has(x.minute));
    if (fresh.length === 0) return;
    fresh.forEach((x) => revealedMinutes.current.add(x.minute));
    batchId.current += 1;
    const batch: Batch = { id: batchId.current, label, exchanges: [...fresh].reverse() };
    setBatches((prev) => [batch, ...prev]);
  }, []);

  /** The n nearest unrevealed pool exchanges to a minute. */
  const nearestPool = useCallback(
    (minute: number, n: number) =>
      POOL.filter((p) => !revealedMinutes.current.has(p.minute))
        .sort((a, b) => Math.abs(a.minute - minute) - Math.abs(b.minute - minute))
        .slice(0, n),
    [],
  );

  const revealFixed = useCallback(
    (index: number) => {
      if (done || fixedShown[index]) return;
      setFixedShown((prev) => prev.map((v, i) => (i === index ? true : v)));
      const f = FIXED[index];
      // Star reveals read as scenes too: the pinned line + 2 nearest pool lines.
      pushBatch(`⭐ Free reveal · ${fmtMinute(f.minute)}`, [f, ...nearestPool(f.minute, 2)]);
    },
    [done, fixedShown, pushBatch, nearestPool],
  );

  const onTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (done || freeTaps >= MAX_FREE_TAPS) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const minute = Math.round(((e.clientX - rect.left) / rect.width) * RUNTIME_MIN);
      const nextTap = freeTaps + 1;
      setFreeTaps(nextTap);
      // Every tap reads as a scene: reveal up to 3 exchanges around the tap.
      pushBatch(`Tap ${nextTap} · ~${fmtMinute(minute)}`, nearestPool(minute, 3));
    },
    [done, freeTaps, pushBatch, nearestPool],
  );

  const onGuess = useCallback(
    (title: string) => {
      if (done) return;
      setGuess(title);
    },
    [done],
  );

  const reset = useCallback(() => {
    setBatches([]);
    revealedMinutes.current.clear();
    batchId.current = 0;
    setFreeTaps(0);
    setFixedShown(FIXED.map(() => false));
    setGuess(null);
  }, []);

  const correct = guess === CORRECT_TITLE;
  const score = correct ? Math.max(40, 100 - TAP_COST * freeTaps) : 0;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Step legend — integrated into the demo flow */}
      <ol className="mb-4 grid grid-cols-3 gap-2" aria-label="How the game works">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            aria-current={step === i ? "step" : undefined}
            className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${
              step === i
                ? "border-amber-400/40 bg-amber-400/10"
                : step > i
                  ? "border-white/10 bg-white/[.03]"
                  : "border-white/5 opacity-60"
            }`}
          >
            <div className="text-base leading-none">{s.icon}</div>
            <div className="mt-1.5 text-[11px] font-medium text-zinc-300">{s.title}</div>
          </li>
        ))}
      </ol>

      {/* The demo card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 shadow-2xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono">Demo movie · runtime 1h 58m</span>
          <span className={freeTaps >= MAX_FREE_TAPS ? "text-red-400" : "text-amber-300"}>
            {freeTaps}/{MAX_FREE_TAPS} free taps used
          </span>
        </div>

        {/* Timeline — waveform-styled, live scrub readout */}
        <div
          onClick={onTimelineClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setHover({ x: pct, minute: Math.round((pct / 100) * RUNTIME_MIN) });
          }}
          onMouseLeave={() => setHover(null)}
          role="slider"
          aria-label="Movie timeline — click to reveal a dialogue exchange"
          aria-valuemin={0}
          aria-valuemax={RUNTIME_MIN}
          aria-valuenow={hover?.minute ?? Math.round(RUNTIME_MIN / 2)}
          className={`relative h-14 cursor-crosshair rounded-xl border border-white/10 bg-white/[.03] transition-colors ${
            done || freeTaps >= MAX_FREE_TAPS ? "cursor-default" : "hover:border-amber-400/30"
          }`}
        >
          {/* Waveform bars */}
          <div className="pointer-events-none absolute inset-x-2 inset-y-0 flex items-center gap-[3px]" aria-hidden>
            {waveform.map((h, i) => {
              const isRevealed = revealedBars.has(i);
              const isNear = Math.abs(i - hoverBar) <= 2;
              return (
                <div
                  key={i}
                  style={{ height: `${Math.round(h * 100)}%` }}
                  className={`flex-1 rounded-full transition-[height,background-color,opacity] duration-150 ${
                    isRevealed
                      ? "bg-amber-400"
                      : isNear
                        ? "bg-amber-300/90"
                        : "bg-gradient-to-t from-zinc-600/30 to-amber-400/40"
                  }`}
                />
              );
            })}
          </div>

          {/* Hover playhead + scrub readout */}
          {hover && !done && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-1 w-px bg-amber-300/80"
                style={{ left: `${hover.x}%` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -top-9 -translate-x-1/2 rounded-md border border-amber-400/30 bg-zinc-950/95 px-2 py-1 font-mono text-[10px] text-amber-300 shadow-lg"
                style={{ left: `${hover.x}%` }}
              >
                ⏱ {fmtMinute(hover.minute)}
              </div>
            </>
          )}

          {/* Star reveals */}
          {FIXED.map((f, i) => (
            <button
              key={f.minute}
              onClick={(e) => {
                e.stopPropagation();
                revealFixed(i);
              }}
              aria-label={`Free reveal at minute ${f.minute}`}
              title={`Free reveal · ${fmtMinute(f.minute)}`}
              className={`absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm drop-shadow transition-transform hover:scale-125 ${
                fixedShown[i] ? "opacity-40" : ""
              }`}
              style={{ left: `${(f.minute / RUNTIME_MIN) * 100}%` }}
            >
              ⭐
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          {done
            ? "Demo finished — reset to play again"
            : freeTaps >= MAX_FREE_TAPS
              ? "No free taps left — stars are still free, then take your guess"
              : "Every tap reveals up to 3 nearby exchanges · ⭐ pins are free"}
        </p>

        {/* Transcript — batches separated, hairline scrollbar */}
        <div className="transcript-scroll mt-4 max-h-64 overflow-y-auto pr-1.5">
          {batches.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-zinc-600">
              Revealed dialogue stacks here — newest on top
            </p>
          ) : (
            <ol className="space-y-5">
              {batches.map((b) => (
                <li key={b.id} aria-label={b.label}>
                  {/* Batch separator header */}
                  <div className="flex items-center gap-2.5">
                    <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">
                      {b.label}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
                  </div>
                  <ul className="mt-2.5 space-y-2">
                    {b.exchanges.map((r) => (
                      <li
                        key={r.minute}
                        className="rounded-xl border-l-2 border-amber-400/30 bg-white/[.04] p-3"
                      >
                        <p className="text-xs font-semibold text-amber-400/90">
                          {fmtMinute(r.minute)} — {r.speaker}
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">&ldquo;{r.line}&rdquo;</p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Guess options / result */}
        {!done ? (
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => onGuess(t)}
                className="rounded-lg border border-white/10 px-3 py-2 text-zinc-300 transition hover:border-amber-400/40 hover:bg-amber-400/5 hover:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <div
              className={`rounded-xl border p-4 text-center ${
                correct ? "border-emerald-400/30 bg-emerald-400/10" : "border-red-400/30 bg-red-400/10"
              }`}
            >
              <p className="text-sm font-semibold">
                {correct ? "🟢 Nailed it" : `🔴 It was “${CORRECT_TITLE}”`}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {score} pts · {freeTaps} free taps · every tap costs {TAP_COST} pts
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
            >
              ↺ Reset demo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
