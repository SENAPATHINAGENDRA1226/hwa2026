import { Link } from "@tanstack/react-router";
import { EVENT } from "@/lib/event-content";

const FOOTER_LINKS = [
  { href: "#problem-statements", label: "Problem Statements" },
  { href: "#timeline", label: "Event Timeline" },
  { href: "#eligibility", label: "Eligibility Criteria" },
  { href: "#guidelines", label: "Guidelines" },
  { href: "#rules", label: "Rules & Conduct" },
  { href: "#evaluation", label: "Evaluation" },
  { href: "#prizes", label: "Prize Pool" },
  { href: "#benefits", label: "Benefits" },
  { href: "#faq", label: "FAQs" },
  { href: "#contact", label: "Contact & Venue" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background/80 backdrop-blur-md px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 max-w-md">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-display text-xl font-black tracking-[0.2em]">
                HACK WITH AVANTHI <span className="text-cyan">2026</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/80 font-medium">
              Avanthi Institute of Engineering and Technology
            </p>
            <p className="text-xs text-muted-foreground">
              Vizianagaram, Andhra Pradesh, India
            </p>
            <p className="text-xs text-muted-foreground/80 pt-1">
              Organised by <strong className="text-foreground">{EVENT.organiser}</strong> · Where Intelligence Meets Innovation.
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-cyan font-semibold">
              Quick Navigation
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-2.5">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-cyan transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-8 font-mono text-[11px] text-muted-foreground/70">
          <p>© 2026 {EVENT.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/portal" className="hover:text-cyan transition-colors">
              Student Portal
            </Link>
            <span>&bull;</span>
            <Link to="/results" className="hover:text-cyan transition-colors">
              Results
            </Link>
            <span>&bull;</span>
            <Link to="/register" className="hover:text-cyan transition-colors">
              Register Team
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
