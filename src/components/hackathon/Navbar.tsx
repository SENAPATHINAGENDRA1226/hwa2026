import { Menu, X, Shield, Award, User, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { RegisterButton } from "./RegisterButton";

const MAIN_NAV = [
  { href: "#about", label: "About" },
  { href: "#themes", label: "Themes" },
  { href: "#timeline", label: "Timeline" },
  { href: "#prizes", label: "Prizes" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled ? "py-2" : "py-4")}>
      <nav
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-2.5 transition-all duration-500 sm:px-6",
          scrolled ? "glass mx-3 sm:mx-6 xl:mx-auto shadow-2xl" : "border border-border/40 bg-background/60 backdrop-blur-md mx-3 sm:mx-6 xl:mx-auto",
        )}
      >
        {/* Brand / Logo with guaranteed generous right margin to prevent any text merging */}
        <Link to="/" className="flex items-center gap-3 shrink-0 mr-8 lg:mr-12">
          <span className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-glass">
            <span className="absolute inset-1 rounded-md border border-cyan/40 animate-spin-slow" />
            <span className="h-2 w-2 rounded-full bg-cyan glow-cyan" />
          </span>
          <span className="font-display text-sm font-bold tracking-[0.18em] whitespace-nowrap">
            HWA<span className="text-cyan">’26</span>
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <div className="hidden xl:flex items-center gap-6 lg:gap-8 shrink-0">
          {/* Main In-page Sections */}
          <ul className="flex items-center gap-5 lg:gap-6">
            {MAIN_NAV.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground whitespace-nowrap py-1"
                >
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          {/* Divider */}
          <div className="h-4 w-px bg-border/80" />

          {/* System Portals */}
          <ul className="flex items-center gap-4 lg:gap-5">
            <li>
              <Link
                to="/portal"
                className="font-mono text-xs uppercase tracking-wider text-cyan hover:text-cyan/80 transition-colors whitespace-nowrap py-1 font-semibold"
              >
                Student Portal
              </Link>
            </li>
            <li>
              <Link
                to="/judge"
                className="font-mono text-xs uppercase tracking-wider text-violet hover:text-violet/80 transition-colors whitespace-nowrap py-1"
              >
                Judge Portal
              </Link>
            </li>
            <li>
              <Link
                to="/admin"
                className="font-mono text-xs uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors whitespace-nowrap py-1"
              >
                Command Center
              </Link>
            </li>
            <li>
              <Link
                to="/results"
                className="font-mono text-xs uppercase tracking-wider text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap py-1"
              >
                Results
              </Link>
            </li>
          </ul>
        </div>

        {/* Tablet / Smaller desktop compact menu (between md and xl) */}
        <div className="hidden md:flex xl:hidden items-center gap-4 shrink-0">
          <Link to="/portal" className="font-mono text-xs uppercase tracking-wider text-cyan font-semibold">
            Portal
          </Link>
          <Link to="/judge" className="font-mono text-xs uppercase tracking-wider text-violet">
            Judge
          </Link>
          <Link to="/admin" className="font-mono text-xs uppercase tracking-wider text-red-400">
            Admin
          </Link>
          <Link to="/results" className="font-mono text-xs uppercase tracking-wider text-amber-300">
            Results
          </Link>
        </div>

        {/* Action Button on Right with guaranteed left margin */}
        <div className="hidden md:block shrink-0 ml-6">
          <RegisterButton />
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-glass md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div className={cn("mx-3 mt-2 overflow-hidden rounded-2xl transition-all duration-500 md:hidden", open ? "glass max-h-125 opacity-100" : "max-h-0 opacity-0")}>
        <ul className="flex flex-col gap-1 p-4 text-xs font-mono uppercase tracking-wider">
          {MAIN_NAV.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-2 border-t border-border/50">
            <Link to="/portal" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-cyan font-bold hover:bg-muted">
              Student Portal
            </Link>
          </li>
          <li>
            <Link to="/judge" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-violet hover:bg-muted">
              Judge Portal
            </Link>
          </li>
          <li>
            <Link to="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-red-400 hover:bg-muted">
              Command Center
            </Link>
          </li>
          <li>
            <Link to="/results" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-amber-300 hover:bg-muted">
              Public Results
            </Link>
          </li>
          <li className="pt-3">
            <RegisterButton className="w-full" />
          </li>
        </ul>
      </div>
    </header>
  );
}
