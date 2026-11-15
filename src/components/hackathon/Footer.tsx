import { EVENT, NAV_LINKS } from "@/lib/event-content";

export function Footer() {
  return (
    <footer className="relative border-t border-border px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg font-bold tracking-[0.2em]">
            HACK WITH AVANTHI <span className="text-cyan">2026</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Organised by {EVENT.organiser} · {EVENT.institute}
          </p>
        </div>
        <ul className="flex flex-wrap gap-6">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-cyan">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-10 max-w-7xl font-mono text-[11px] tracking-widest text-muted-foreground/70">
        © 2026 {EVENT.organiser}. Where Intelligence Meets Innovation.
      </p>
    </footer>
  );
}
