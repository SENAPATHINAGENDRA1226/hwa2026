import { animate, useInView } from "framer-motion";
import { Award, Crown, Medal, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PRIZES, SPECIAL_AWARDS } from "@/lib/event-content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const inr = new Intl.NumberFormat("en-IN");

function Counter({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      ₹{inr.format(n)}
    </span>
  );
}

const TONES = {
  cyan: { ring: "border-cyan/50", text: "text-cyan", glow: "glow-cyan", blob: "bg-cyan/25", Icon: Crown },
  violet: { ring: "border-violet/50", text: "text-violet", glow: "glow-violet", blob: "bg-violet/25", Icon: Trophy },
  magenta: { ring: "border-magenta/50", text: "text-magenta", glow: "", blob: "bg-magenta/20", Icon: Medal },
} as const;

export function Prizes() {
  const total = PRIZES.reduce((s, p) => s + p.amount, 0);
  return (
    <section id="prizes" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet/15 blur-[120px]" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Prizes & rewards" title="Rewards Worth" highlight="Hacking For" />

        <Reveal className="mt-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Total cash pool</p>
          <Counter value={total} className="mt-2 block font-display text-5xl font-black text-neon sm:text-7xl" />
        </Reveal>

        <div className="mt-16 grid items-end gap-6 md:grid-cols-3">
          {PRIZES.map((p, i) => {
            const tone = TONES[p.tone];
            const first = p.rank === "1st";
            return (
              <Reveal key={p.rank} delay={first ? 0 : 0.15 * i} className={cn(first ? "order-first md:order-0" : "")}>
                <div
                  className={cn(
                    "glass group relative overflow-hidden rounded-3xl p-8 text-center transition-transform duration-500 hover:-translate-y-2",
                    tone.ring,
                    first && "md:py-14",
                  )}
                >
                  <div className={cn("absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100", tone.blob, first ? "opacity-100" : "opacity-60")} />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />
                  <div className={cn("relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border bg-background/60 animate-float", tone.ring, tone.glow)}>
                    <tone.Icon className={cn("h-7 w-7", tone.text)} />
                  </div>
                  <p className={cn("relative mt-6 font-mono text-xs uppercase tracking-[0.3em]", tone.text)}>{p.rank} Place</p>
                  <h3 className="relative mt-1 font-display text-xl font-bold">{p.title}</h3>
                  <Counter value={p.amount} className={cn("relative mt-4 block font-display font-black", first ? "text-5xl" : "text-4xl")} />
                  <ul className="relative mt-6 space-y-2 text-sm text-muted-foreground">
                    {p.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-cyan" />
              <p className="font-display font-bold tracking-wide">Special Awards</p>
            </div>
            <ul className="flex flex-wrap gap-3 md:ml-auto">
              {SPECIAL_AWARDS.map((a) => (
                <li key={a} className="rounded-full border border-border bg-background/50 px-4 py-2 text-sm text-muted-foreground">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
