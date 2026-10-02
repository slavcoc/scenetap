"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ── Types ───────────────────────────────────────────────────────────── */

export type MovieExchange = { minute: number; speaker: string; line: string };

export type MovieRoundData = {
  /** Correct movie title (also shown as the answer on a wrong guess). */
  title: string;
  /** The 4 guess options — must include `title`. */
  options: string[];
  /** Movie runtime in minutes (defines the timeline scale). */
  runtimeMin: number;
  /** Curated pins — free to reveal, marked with a 💬 bubble on the timeline. */
  fixed: MovieExchange[];
  /** Dense ranked pool — free taps reveal the closest entries. */
  pool: MovieExchange[];
};

export type RoundResult = { correct: boolean; score: number; freeTaps: number };

export type MovieRoundProps = MovieRoundData & {
  /** Small label shown next to the runtime (e.g. "Demo movie"). */
  label?: string;
  maxFreeTaps?: number;
  tapCost?: number;
  /** Show the onboarding step legend above the card (demo mode). */
  showSteps?: boolean;
  /** Show a reset button after the guess (demo mode). */
  allowReset?: boolean;
  /** Called once when the player guesses, with the round result. */
  onFinished?: (result: RoundResult) => void;
};

/* ── Constants ───────────────────────────────────────────────────────── */

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

const fmtMinute = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00`;
const fmtRuntime = (m: number) => `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;

/** One reveal action produces one batch of exchanges. */
type Batch = { id: number; label: string; exchanges: MovieExchange[] };

const STEPS = [
  { icon: "👆", title: "Tap the timeline" },
  { icon: "💬", title: "Eavesdrop" },
  { icon: "🎯", title: "Name the movie" },
];

/* ── Component ───────────────────────────────────────────────────────── */

export function MovieRound({
  title,
  options,
  runtimeMin,
  fixed,
  pool,
  label = "Movie",
  maxFreeTaps = 3,
  tapCost = 15,
  showSteps = false,
  allowReset = false,
  onFinished,
}: MovieRoundProps) {
  /** The first (earliest) free frame, auto-opened at round start:
   * its pinned line + the 2 nearest pool lines = 3 dialogs on screen. */
  const openingBatch = useMemo<Batch | null>(() => {
    if (fixed.length === 0) return null;
    const f = fixed[0];
    const neighbors = pool
      .filter((p) => p.minute !== f.minute)
      .sort((a, b) => Math.abs(a.minute - f.minute) - Math.abs(b.minute - f.minute))
      .slice(0, 2);
    return {
      id: 1,
      label: `🎬 Opening scene · ${fmtMinute(f.minute)}`,
      exchanges: [f, ...neighbors].sort((a, b) => b.minute - a.minute),
    };
  }, [fixed, pool]);

  const [batches, setBatches] = useState<Batch[]>(() => (openingBatch ? [openingBatch] : []));
  const [freeTaps, setFreeTaps] = useState(0);
  // The first (earliest) frame is always open — 3 dialogs on screen at start.
  const [fixedShown, setFixedShown] = useState<boolean[]>(() => fixed.map((_, i) => i === 0));
  const [guess, setGuess] = useState<string | null>(null);
  const [hover, setHover] = useState<{ x: number; minute: number } | null>(null);

  const done = guess !== null;

  /** Which of the 3 steps is live right now (demo legend). */
  const step = done ? 2 : batches.length > 0 ? 1 : 0;

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
      for (const x of b.exchanges) set.add(Math.round((x.minute / runtimeMin) * (WAVE_BARS - 1)));
    }
    return set;
  }, [batches, runtimeMin]);

  /** Hovered bar index (±2 bars glow around the playhead). */
  const hoverBar = hover ? Math.round((hover.x / 100) * (WAVE_BARS - 1)) : -1;

  /** Exchange minutes already on the transcript (ref so batch pushes stay
   * deduped without making setState updaters impure). */
  const revealedMinutes = useRef<Set<number>>(new Set());
  const batchId = useRef(openingBatch ? 1 : 0);

  // The opening scene's minutes are pre-revealed — keep the dedupe set in
  // sync (idempotent, so StrictMode double-runs are harmless).
  useEffect(() => {
    if (openingBatch) {
      for (const x of openingBatch.exchanges) revealedMinutes.current.add(x.minute);
    }
  }, [openingBatch]);

  const pushBatch = useCallback((batchLabel: string, exchanges: MovieExchange[]) => {
    // Mutations happen here, NOT inside the setState updater — StrictMode
    // double-invokes updaters in dev, which would swallow the batch.
    const fresh = exchanges.filter((x) => !revealedMinutes.current.has(x.minute));
    if (fresh.length === 0) return;
    fresh.forEach((x) => revealedMinutes.current.add(x.minute));
    batchId.current += 1;
    const batch: Batch = {
      id: batchId.current,
      label: batchLabel,
      // Newest minute first — keeps the scene in timeline order.
      exchanges: [...fresh].sort((a, b) => b.minute - a.minute),
    };
    setBatches((prev) => [batch, ...prev]);
  }, []);

  /** The n nearest unrevealed pool exchanges to a minute. */
  const nearestPool = useCallback(
    (minute: number, n: number) =>
      pool
        .filter((p) => !revealedMinutes.current.has(p.minute))
        .sort((a, b) => Math.abs(a.minute - minute) - Math.abs(b.minute - minute))
        .slice(0, n),
    [pool],
  );

  const revealFixed = useCallback(
    (index: number) => {
      if (done || fixedShown[index]) return;
      setFixedShown((prev) => prev.map((v, i) => (i === index ? true : v)));
      const f = fixed[index];
      // Star reveals read as scenes too: the pinned line + 2 nearest pool lines.
      pushBatch(`💬 Free reveal · ${fmtMinute(f.minute)}`, [f, ...nearestPool(f.minute, 2)]);
    },
    [done, fixedShown, fixed, pushBatch, nearestPool],
  );

  const onTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (done || freeTaps >= maxFreeTaps) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const minute = Math.round(((e.clientX - rect.left) / rect.width) * runtimeMin);
      const nextTap = freeTaps + 1;
      setFreeTaps(nextTap);
      // Every tap reads as a scene: reveal up to 3 exchanges around the tap.
      pushBatch(`Tap ${nextTap} · ~${fmtMinute(minute)}`, nearestPool(minute, 3));
    },
    [done, freeTaps, maxFreeTaps, runtimeMin, pushBatch, nearestPool],
  );

  const onGuess = useCallback(
    (chosen: string) => {
      if (done) return;
      setGuess(chosen);
      const correct = chosen === title;
      onFinished?.({
        correct,
        score: correct ? Math.max(40, 100 - tapCost * freeTaps) : 0,
        freeTaps,
      });
    },
    [done, title, tapCost, freeTaps, onFinished],
  );

  const reset = useCallback(() => {
    setBatches(openingBatch ? [openingBatch] : []);
    revealedMinutes.current.clear();
    if (openingBatch) {
      for (const x of openingBatch.exchanges) revealedMinutes.current.add(x.minute);
    }
    batchId.current = openingBatch ? 1 : 0;
    setFreeTaps(0);
    setFixedShown(fixed.map((_, i) => i === 0));
    setGuess(null);
    setHover(null);
  }, [fixed, openingBatch]);

  const correct = guess === title;
  const score = correct ? Math.max(40, 100 - tapCost * freeTaps) : 0;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Step legend — integrated into the demo flow */}
      {showSteps && (
        <ol className="mb-4 grid grid-cols-3 gap-2" aria-label="How the game works">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={step === i ? "step" : undefined}
              className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${
                step === i
                  ? "border-amber-400 bg-amber-400"
                  : step > i
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-zinc-800 bg-zinc-900"
              }`}
            >
              <div className="text-base leading-none">{s.icon}</div>
              <div
                className={`mt-1.5 text-[11px] font-medium ${
                  step === i ? "text-zinc-950" : step > i ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {s.title}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* The round card */}
      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl shadow-black/50">
        <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono">
            {label} · runtime {fmtRuntime(runtimeMin)}
          </span>
          <span className={freeTaps >= maxFreeTaps ? "text-red-400" : "text-amber-300"}>
            {freeTaps}/{maxFreeTaps} free taps used
          </span>
        </div>

        {/* Timeline — waveform-styled, live scrub readout */}
        <div
          onClick={onTimelineClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setHover({ x: pct, minute: Math.round((pct / 100) * runtimeMin) });
          }}
          onMouseLeave={() => setHover(null)}
          role="slider"
          aria-label="Movie timeline — click to reveal a dialogue exchange"
          aria-valuemin={0}
          aria-valuemax={runtimeMin}
          aria-valuenow={hover?.minute ?? Math.round(runtimeMin / 2)}
          className={`relative h-14 cursor-crosshair rounded-xl border border-white/10 bg-zinc-800 transition-colors ${
            done || freeTaps >= maxFreeTaps ? "cursor-default" : "hover:border-amber-400/30"
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
                        ? "bg-amber-300"
                        : "bg-gradient-to-t from-zinc-600 to-amber-400"
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

          {/* Fixed dialogue reveals */}
          {fixed.map((f, i) => (
            <button
              key={f.minute}
              onClick={(e) => {
                e.stopPropagation();
                revealFixed(i);
              }}
              aria-label={`Free reveal at minute ${f.minute}`}
              title={`Free reveal · ${fmtMinute(f.minute)}`}
              className="group absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              style={{ left: `${(f.minute / runtimeMin) * 100}%` }}
            >
              <span
                className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
                  fixedShown[i]
                    ? "border-zinc-500/50 bg-zinc-950/90 text-zinc-300"
                    : "border-amber-400/40 bg-zinc-950/90 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,.25)]"
                }`}
              >
                {!fixedShown[i] && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full bg-amber-400/20"
                  />
                )}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="relative h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          {done
            ? "Round finished"
            : freeTaps >= maxFreeTaps
              ? "No free taps left — bubbles are still free, then take your guess"
              : "Every tap reveals 3 nearby exchanges · 💬 pins are free"}
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
                        className="rounded-xl border-l-2 border-amber-400/30 bg-zinc-800 p-3"
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
            {options.map((t) => (
              <button
                key={t}
                onClick={() => onGuess(t)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300 transition hover:border-amber-400/60 hover:bg-zinc-700 hover:text-white"
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
                {correct ? "🟢 Nailed it" : `🔴 It was “${title}”`}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {score} pts · {freeTaps} free taps · every tap costs {tapCost} pts
              </p>
            </div>
            {allowReset && (
              <button
                onClick={reset}
                className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
              >
                ↺ Reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
