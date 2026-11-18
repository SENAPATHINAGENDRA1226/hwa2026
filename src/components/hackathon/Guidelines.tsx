import { CheckCircle2, Compass, ShieldCheck } from "lucide-react";
import { GUIDELINES } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Guidelines() {
  return (
    <section id="guidelines" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20">
      <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan/10 blur-[120px]" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Participation Guidelines"
          title="Official Event"
          highlight="Guidelines"
          description="Essential instructions for all registered candidates and teams participating in HWA 2026."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {GUIDELINES.map((item, idx) => (
            <Reveal key={idx} delay={(idx % 4) * 0.05}>
              <div className="glass group relative flex items-start gap-4 rounded-2xl border border-border p-5 transition-all duration-300 hover:border-cyan/40 hover:bg-background/80">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 font-mono text-xs font-bold text-cyan">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-1">
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 group-hover:text-foreground">
                    {item}
                  </p>
                </div>
                <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan/40 transition-colors group-hover:text-cyan" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
