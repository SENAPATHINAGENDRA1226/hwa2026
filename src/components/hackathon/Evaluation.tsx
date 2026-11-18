import {
  BrainCircuit,
  CheckCircle2,
  Code2,
  Gauge,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { JUDGING_CRITERIA } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ICONS = [Lightbulb, Target, Code2, Wrench, MessageSquare];
const COLORS = [
  { bar: "from-cyan to-blue-500", text: "text-cyan", border: "border-cyan/40", bg: "bg-cyan/10" },
  { bar: "from-violet to-purple-500", text: "text-violet", border: "border-violet/40", bg: "bg-violet/10" },
  { bar: "from-pink-500 to-rose-500", text: "text-pink-400", border: "border-pink-500/40", bg: "bg-pink-500/10" },
  { bar: "from-emerald-400 to-teal-500", text: "text-emerald-300", border: "border-emerald-500/40", bg: "bg-emerald-500/10" },
  { bar: "from-amber-400 to-yellow-500", text: "text-amber-300", border: "border-amber-400/40", bg: "bg-amber-400/10" },
];

export function Evaluation() {
  const total = JUDGING_CRITERIA.reduce((acc, c) => acc + c.weightage, 0);

  return (
    <section id="evaluation" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20">
      <div id="judging-criteria" className="sr-only" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan/10 blur-[130px]" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Evaluation & Judging Criteria"
          title="How Teams Are"
          highlight="Evaluated"
          description="Teams are evaluated through a standardized rubrics system based on innovation, technical depth, practicality, and presentation."
        />

        {/* Overview Box */}
        <Reveal delay={0.05} className="mt-12">
          <div className="glass flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-cyan/30 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Standardized 100% Jury Matrix</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Both Round 1 screening and Round 2 finale pitching adhere strictly to these weighted criteria.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-5 py-2.5 font-mono text-sm font-bold">
              <span className="text-muted-foreground">Cumulative Weightage:</span>
              <span className="text-cyan text-base">{total}%</span>
            </div>
          </div>
        </Reveal>

        {/* Criteria Bars & Cards */}
        <div className="mt-10 space-y-5">
          {JUDGING_CRITERIA.map((criterion, idx) => {
            const Icon = ICONS[idx] || Sparkles;
            const style = COLORS[idx % COLORS.length]!;

            return (
              <Reveal key={criterion.parameter} delay={idx * 0.08}>
                <div className="glass group relative overflow-hidden rounded-2xl border border-border p-6 transition-all duration-300 hover:border-cyan/50 hover:bg-background/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${style.border} ${style.bg} ${style.text}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-display text-base sm:text-lg font-bold text-foreground">
                          {criterion.parameter}
                        </h4>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                          {criterion.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-baseline sm:flex-col sm:items-end shrink-0 gap-2">
                      <span className={`font-display text-2xl sm:text-3xl font-black ${style.text}`}>
                        {criterion.weightage}%
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        Weightage
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${style.bar} transition-all duration-1000 ease-out`}
                      style={{ width: `${criterion.weightage * 3}%`, maxWidth: "100%" }}
                    />
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
