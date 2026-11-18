import { useGSAP } from "@gsap/react";
import { ClientOnly } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, ChevronDown, MapPin, Timer } from "lucide-react";
import { lazy, Suspense, useRef } from "react";
import { EVENT } from "@/lib/event-content";
import { Countdown } from "./Countdown";
import { RegisterButton } from "./RegisterButton";

const NeuralSphere = lazy(() => import("./NeuralSphere"));

function Chars({ text, className, charClassName = "" }: { text: string; className?: string; charClassName?: string }) {
  return (
    <span className={className} aria-hidden>
      {Array.from(text).map((ch, i) => (
        <span key={i} className={`hero-char inline-block ${charClassName}`}>
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.set("[data-intro]", { autoAlpha: 1 });
      if (reduced) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-badge", { y: 20, autoAlpha: 0, duration: 0.6 })
        .from(".hero-char", { yPercent: 110, autoAlpha: 0, rotateX: -80, filter: "blur(8px)", stagger: 0.035, duration: 0.8, clearProps: "filter,transform" }, "-=0.2")
        .from(".hero-fade", { y: 24, autoAlpha: 0, stagger: 0.12, duration: 0.7 }, "-=0.4")
        .from(".hero-sphere", { scale: 0.7, autoAlpha: 0, duration: 1.6, ease: "expo.out" }, 0.2);

      gsap.to(".hero-content", {
        yPercent: -18,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-sphere", {
        scale: 1.25,
        autoAlpha: 0.3,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="hero" className="relative flex min-h-svh items-center overflow-hidden pt-24 pb-16 scroll-mt-20">
      <div id="top" className="sr-only" />
      <div className="pointer-events-none absolute inset-0 bg-neural-grid mask-[radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      <div className="hero-sphere absolute inset-0 opacity-50 sm:opacity-70 lg:left-[40%] lg:opacity-100">
        <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-[100px]" />
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <NeuralSphere />
          </Suspense>
        </ClientOnly>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background via-background/70 to-transparent lg:via-background/40" />

      <div className="hero-content relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div data-intro className="invisible max-w-2xl">
          <div className="hero-badge mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-glow" />
            {EVENT.organiser} presents
          </div>
          <h1 className="font-display font-black leading-[0.95] tracking-tight perspective-[600px]">
            <span className="sr-only">{EVENT.name}</span>
            <Chars text="HACK WITH" className="block text-4xl sm:text-6xl lg:text-7xl" />
            <Chars text="AVANTHI" className="block text-5xl sm:text-7xl lg:text-8xl" charClassName="text-glow" />
            <Chars text="2026" className="block pb-2 text-5xl sm:text-7xl lg:text-8xl" charClassName="text-neon" />
          </h1>
          <p className="hero-fade mt-6 font-display text-lg tracking-wide text-cyan sm:text-2xl">{EVENT.tagline}</p>
          <p className="hero-fade mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A two-day,technical hackathon at {EVENT.institute}. Assemble your team, pick a theme and build
            the future of intelligent technology.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap items-center gap-4">
            <RegisterButton size="lg" />
            <a
              href="#about"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-glass px-7 py-4 font-display text-xs font-semibold uppercase tracking-[0.15em] text-foreground backdrop-blur transition-colors hover:border-cyan/60 hover:text-cyan sm:text-sm"
            >
              Explore Event
            </a>
          </div>
          <div className="hero-fade mt-10">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Kick-off in</p>
            <Countdown target={EVENT.startsAt} />
          </div>
          <ul className="hero-fade mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cyan" />{EVENT.dateLabel}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan" />{EVENT.venue}</li>
            <li className="flex items-center gap-2"><Timer className="h-4 w-4 text-cyan" />{EVENT.duration}</li>
          </ul>
        </div>
      </div>

      <a href="#about" aria-label="Scroll to about" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-float" />
      </a>
    </section>
  );
}
