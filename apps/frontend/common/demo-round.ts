import type { MovieRoundData } from "./MovieRound";

/** Fictional demo movie (invented lines) — used by the landing page only.
 * The real game will feed MovieRound the same shape with production data. */
export const demoRound: MovieRoundData = {
  title: "The Ledger",
  options: ["The Ledger", "Midnight Train", "Paper Streets", "Cold Harbor"],
  runtimeMin: 118,

  /** Curated pins — free to reveal, marked with a 💬 bubble on the timeline.
   * The first (earliest) pin is auto-revealed as the opening scene. */
  fixed: [
    { minute: 42, speaker: "WALTER", line: "You're three minutes late, Frank. I keep a ledger." },
    { minute: 72, speaker: "FRANK", line: "Three minutes I'll never get back." },
    { minute: 108, speaker: "WALTER", line: "Close the ledger, Frank. For both of us." },
  ],

  /** Dense ranked pool — free taps reveal the closest entries. */
  pool: [
    { minute: 4, speaker: "ESTHER", line: "You brought the rain with you." },
    { minute: 9, speaker: "WALTER", line: "I bring a lot of things." },
    { minute: 12, speaker: "FRANK", line: "There are two kinds of meetings in this town." },
    { minute: 17, speaker: "FRANK", line: "The safe opens at midnight. It's old-fashioned that way." },
    { minute: 23, speaker: "ESTHER", line: "Everyone in this city has a second name." },
    { minute: 28, speaker: "WALTER", line: "Tell the driver to take the long way." },
    { minute: 31, speaker: "WALTER", line: "Ledgers don't lie. People do." },
    { minute: 38, speaker: "FRANK", line: "You think I'd cross you over a suitcase?" },
    { minute: 47, speaker: "ESTHER", line: "The bridge is watched from both ends." },
    { minute: 51, speaker: "FRANK", line: "I left my hat in the last place I was safe." },
    { minute: 56, speaker: "WALTER", line: "Burn the page, and the debt still stands." },
    { minute: 61, speaker: "ESTHER", line: "Quiet is the only currency this street takes." },
    { minute: 64, speaker: "FRANK", line: "I've been followed since Tuesday." },
    { minute: 77, speaker: "ESTHER", line: "The water remembers every boat." },
    { minute: 83, speaker: "ESTHER", line: "Then Tuesday owes you an apology." },
    { minute: 89, speaker: "WALTER", line: "A closed door is still an answer." },
    { minute: 95, speaker: "WALTER", line: "Every partner I ever had is buried in this city." },
    { minute: 103, speaker: "FRANK", line: "So that's why you called me." },
    { minute: 113, speaker: "ESTHER", line: "Nobody leaves the ledger." },
    { minute: 116, speaker: "FRANK", line: "Then we leave together." },
  ],
};
