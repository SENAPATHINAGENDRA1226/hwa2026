import { animate, useInView } from "framer-motion";
import { Award, Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PRIZE_POOL } from "@/lib/event-content";
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
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      ₹{inr.format(n)}
    </span>
  );
}

export function Prizes() {
  return (
    <section id="prizes" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20 overflow-hidden">
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-violet/15 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 bottom-1/4 h-96 w-96 rounded-full bg-cyan/15 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Prize Pool – ₹20,000"
          title="Rewards Worth"
          highlight="Hacking For"
          description="Dedicated prize tracks for 2nd and 3rd year teams, recognizing excellence across both cohorts."
        />

        {/* Grand Total Callout */}
        <Reveal className="mt-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Total Cash Prize Pool</p>
          <Counter
            value={PRIZE_POOL.total}
            className="mt-2 block font-display text-5xl font-black text-neon sm:text-7xl"
          />
          <p className="mt-2 text-xs font-mono uppercase tracking-widest text-cyan">
            ₹10,000 for 2nd Year &bull; ₹10,000 for 3rd Year
          </p>
        </Reveal>

        {/* 2nd Year & 3rd Year Grids */}
        <div className="mt-16 space-y-16">
          {PRIZE_POOL.categories.map((cat, catIdx) => (
            <div key={cat.year} className="space-y-6">
              {/* Category Header */}
              <Reveal delay={0.05}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan/40 bg-cyan/10 font-mono text-xs font-bold text-cyan">
                      0{catIdx + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground">{cat.year}</h3>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-cyan bg-cyan/10 px-3 py-1.5 rounded-lg border border-cyan/30 self-start sm:self-auto">
                    Category Pool: ₹{inr.format(cat.totalCategory)}
                  </div>
                </div>
              </Reveal>

              {/* Cards Grid: Winner and Runner-up */}
              <div className="grid gap-6 md:grid-cols-2">
                {cat.prizes.map((p, pIdx) => {
                  const isWinner = p.rank === "Winner";
                  const ringColor = isWinner ? "border-cyan/50 hover:border-cyan" : "border-violet/50 hover:border-violet";
                  const textColor = isWinner ? "text-cyan" : "text-violet";
                  const glowColor = isWinner ? "glow-cyan" : "glow-violet";
                  const Icon = isWinner ? Crown : Trophy;

                  return (
                    <Reveal key={p.title} delay={pIdx * 0.1}>
                      <div
                        className={cn(
                          "glass group relative overflow-hidden rounded-3xl p-8 text-center transition-all duration-500 hover:-translate-y-1.5",
                          ringColor,
                        )}
                      >
                        <div
                          className={cn(
                            "absolute -top-20 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-80",
                            isWinner ? "bg-cyan/25" : "bg-violet/25",
                          )}
                        />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />

                        {/* Icon */}
                        <div
                          className={cn(
                            "relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border bg-background/70 shadow-lg",
                            isWinner ? "border-cyan/50 glow-cyan" : "border-violet/50",
                          )}
                        >
                          <Icon className={cn("h-7 w-7", textColor)} />
                        </div>

                        {/* Title and Rank */}
                        <p className={cn("relative mt-5 font-mono text-xs uppercase tracking-[0.25em]", textColor)}>
                          {p.rank}
                        </p>
                        <h4 className="relative mt-1 font-display text-xl sm:text-2xl font-bold">{p.title}</h4>

                        {/* Prize Amount */}
                        <Counter
                          value={p.amount}
                          className="relative mt-4 block font-display text-4xl sm:text-5xl font-black text-foreground"
                        />

                        {/* Perks */}
                        <ul className="relative mt-6 space-y-2 text-sm text-muted-foreground border-t border-border/60 pt-5">
                          {p.perks.map((perk) => (
                            <li key={perk} className="flex items-center justify-center gap-2">
                              <Sparkles className={cn("h-3.5 w-3.5", textColor)} />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
