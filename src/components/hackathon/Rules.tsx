import { AlertTriangle, Scale, ShieldAlert, Sparkles } from "lucide-react";
import { RULES } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Rules() {
  return (
    <section id="rules" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20">
      <div className="pointer-events-none absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-violet/15 blur-[120px]" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Standards & Integrity"
          title="Rules &"
          highlight="Code of Conduct"
          description="Maintaining a fair, respectful, and high-integrity environment for every builder."
        />

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {RULES.map((rule, idx) => (
            <Reveal key={idx} delay={(idx % 4) * 0.05}>
              <div className="glass group relative flex items-start gap-4 rounded-2xl border border-border p-5 transition-all duration-300 hover:border-violet/50 hover:bg-background/80">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-violet/40 bg-violet/10 font-mono text-xs font-bold text-violet">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 pt-1">
                  <p className="text-sm sm:text-base leading-relaxed text-foreground/90 group-hover:text-foreground">
                    {rule}
                  </p>
                </div>
                <Scale className="h-4 w-4 shrink-0 text-violet/40 transition-colors group-hover:text-violet" />
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5 flex items-center gap-4 text-xs sm:text-sm text-amber-200/90">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <span>
              <strong>Zero-Tolerance Policy:</strong> Any violation of the code of conduct or verified plagiarism will lead to immediate disqualification by the faculty coordinator panel.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
