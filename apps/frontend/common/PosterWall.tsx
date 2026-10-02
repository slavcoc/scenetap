/**
 * Decorative poster-wall background for the hero + leaderboard sections.
 *
 * All posters are PUBLIC DOMAIN (US films from 1920–1930, works published
 * before 1931), sourced from Wikimedia Commons:
 *   Metropolis (1927), Das Cabinet des Dr. Caligari (1920), The General (1926),
 *   Safety Last! (1923), The Gold Rush (1925), The Kid (1921), The Circus (1928),
 *   Wings (1927), The Jazz Singer (1927), The Thief of Bagdad (1924),
 *   Greed (1924), The Phantom of the Opera (1925), Ben-Hur (1925),
 *   Sunrise (1927), Our Hospitality (1923), The Navigator (1924),
 *   The Mark of Zorro (1920), The Sheik (1921), The Lodger (1927),
 *   Sherlock Jr. (1924), Dr. Mabuse, der Spieler (1922).
 */

const POSTERS = [
  { src: "/posters/metropolis-1927.jpg" },
  { src: "/posters/caligari-1920.jpg" },
  { src: "/posters/general-1926.png" },
  { src: "/posters/safety-last-1923.jpg" },
  { src: "/posters/gold-rush-1925.jpg" },
  { src: "/posters/kid-1921.jpg" },
  { src: "/posters/circus-1928.jpg" },
  { src: "/posters/wings-1927.jpg" },
  { src: "/posters/jazz-singer-1927.jpg" },
  { src: "/posters/thief-bagdad-1924.jpg" },
  { src: "/posters/greed-1924.jpg" },
  { src: "/posters/phantom-opera-1925.jpg" },
  { src: "/posters/ben-hur-1925.jpg" },
  { src: "/posters/sunrise-1927.jpg" },
  { src: "/posters/our-hospitality-1923.jpg" },
  { src: "/posters/navigator-1924.jpg" },
  { src: "/posters/mark-zorro-1920.jpg" },
  { src: "/posters/sheik-1921.jpg" },
  { src: "/posters/lodger-1927.jpg" },
  { src: "/posters/sherlock-jr-1924.jpg" },
  { src: "/posters/dr-mabuse-1922.jpg" },
  { src: "/posters/ben-hur-1925.jpg" },
  { src: "/posters/circus-1928.jpg" },
  { src: "/posters/kid-1921.jpg" },
];

/** Slight per-poster tilt, like prints pinned askew on a wall. */
const TILTS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "rotate-[1.5deg]",
  "-rotate-[1.5deg]",
];

/** Vertical stagger so rows don't line up like a boring grid. */
const OFFSETS = [
  "translate-y-0",
  "lg:translate-y-8",
  "lg:-translate-y-5",
  "lg:translate-y-12",
  "lg:-translate-y-2",
  "lg:translate-y-5",
];

export function PosterWall() {
  return (
    <div aria-hidden className="absolute inset-0 select-none overflow-hidden">
      <div className="absolute inset-[-5%] opacity-[0.13] blur-[0.5px]">
        <div className="grid h-full grid-cols-4 gap-4 sm:grid-cols-5 lg:grid-cols-6">
          {POSTERS.map((p, i) => (
            <div
              key={`${p.src}-${i}`}
              className={`relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 shadow-lg shadow-black/50 ring-1 ring-inset ring-white/[.06] ${TILTS[i % TILTS.length]} ${OFFSETS[i % OFFSETS.length]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover sepia-[.35] contrast-[1.05] saturate-[.8]"
              />
              {/* Fade each print toward its bottom edge — old-paper feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-zinc-950/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
