import { Footer } from "@/common/Footer";
import { Hero } from "@/common/Hero";
import { Leaderboard } from "@/common/Leaderboard";
import { Nav } from "@/common/Nav";
import { Testimonials } from "@/common/Testimonials";

/** Structured data for search engines (WebSite + VideoGame). */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "SceneTap",
      url: "https://scenetap.example",
      description:
        "Daily movie guessing game: tap the timeline, read short dialogue exchanges, name the film.",
      inLanguage: "en",
    },
    {
      "@type": "VideoGame",
      name: "SceneTap",
      description:
        "Name the movie from its dialogue. Tap a mystery movie's timeline, reveal short dialogue exchanges, and guess the film in as few taps as possible. A new round of 3 movies every day.",
      genre: "Quiz game",
      gamePlatform: "Web browser",
      applicationCategory: "Game",
      inLanguage: "en",
      playMode: "SinglePlayer",
      audience: { "@type": "PeopleAudience", audienceType: "Movie fans" },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "SceneTap" },
      potentialAction: {
        "@type": "PlayAction",
        name: "Play today's round",
        target: { "@type": "EntryPoint", urlTemplate: "https://scenetap.example/#leaderboard" },
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 bg-zinc-950 text-zinc-100">
        <Nav />

        <Hero />

        <section aria-label="Leaderboard" className="mx-auto max-w-2xl px-4 py-16" id="leaderboard">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Who&apos;s on top</h2>
            <p className="mx-auto mb-6 mt-1 max-w-md text-sm text-zinc-400">
              Points won today and over the last 7 days.
            </p>
          </div>
          <Leaderboard />
        </section>

        <Testimonials />

        <Footer />
      </main>
    </>
  );
}
