export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <a href="#" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden>🎬</span> Scene<span className="text-amber-400">Tap</span>
        </a>
        <nav aria-label="Account" className="flex items-center gap-2 text-sm">
          <a href="#" className="rounded-lg px-3 py-2 text-zinc-300 transition hover:text-white">
            Log in
          </a>
          <a
            href="#"
            className="rounded-lg bg-amber-400 px-3 py-2 font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            Sign up
          </a>
        </nav>
      </div>
    </header>
  );
}
