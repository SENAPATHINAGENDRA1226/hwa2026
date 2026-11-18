import {
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";
import { ELIGIBILITY_DATA } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Eligibility() {
  return (
    <section id="eligibility" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20 overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-cyan/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet/15 blur-[130px]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Who Can Participate"
          title="Eligibility"
          highlight="Criteria"
          description="Exclusively curated for 2nd and 3rd year innovators from CSM and CSD departments of AIET Vizianagaram."
        />

        {/* Core Eligibility Cards Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Eligible Institution */}
          <Reveal delay={0.05}>
            <div className="glass group relative h-full rounded-2xl p-6 transition-all duration-300 hover:border-cyan/50 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-foreground">Eligible Institution</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Only bona fide students of <strong className="text-foreground">Avanthi Institute of Engineering and Technology, Vizianagaram</strong> are eligible.
              </p>
            </div>
          </Reveal>

          {/* Card 2: Eligible Departments */}
          <Reveal delay={0.1}>
            <div className="glass group relative h-full rounded-2xl p-6 transition-all duration-300 hover:border-violet/50 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet/40 bg-violet/10 text-violet">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-foreground">Eligible Departments</h3>
              <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan">CSM</span>
                  <span>AI & Machine Learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-violet">CSD</span>
                  <span>Data Science</span>
                </div>
                <p className="text-xs text-muted-foreground/80 pt-1">Cross-department mixed teams allowed.</p>
              </div>
            </div>
          </Reveal>

          {/* Card 3: Eligible Academic Years */}
          <Reveal delay={0.15}>
            <div className="glass group relative h-full rounded-2xl p-6 transition-all duration-300 hover:border-cyan/50 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10 text-cyan">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-foreground">Eligible Years</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {ELIGIBILITY_DATA.years.map((yr) => (
                  <span
                    key={yr}
                    className="rounded-lg border border-cyan/30 bg-background/60 px-3 py-1 font-mono text-xs font-bold text-cyan"
                  >
                    {yr}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Dedicated parallel prize tracks for both 2nd year and 3rd year teams.
              </p>
            </div>
          </Reveal>

          {/* Card 4: Team Size & Fee */}
          <Reveal delay={0.2}>
            <div className="glass group relative h-full rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/50 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-base font-bold text-foreground">Team Size & Fee</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <strong className="text-foreground">1 to 4 Participants</strong> per team. Individual participation is warmly welcomed.
              </p>
              <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>Registration Fee</span>
                <span className="font-bold text-sm">₹250 / team</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Required Submission: PowerPoint Presentation */}
        <Reveal delay={0.25} className="mt-8">
          <div className="glass relative overflow-hidden rounded-3xl border border-cyan/30 p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-cyan">
                  <FileSpreadsheet className="h-3.5 w-3.5" /> Mandatory Submission
                </div>
                <h3 className="font-display text-2xl font-black text-foreground">
                  PowerPoint Presentation (PPT) Requirements
                </h3>
                <p className="text-sm text-muted-foreground max-w-2xl">
                  Every registered team must submit a PowerPoint presentation before the deadline (19 Dec 2026).
                  The screening panel evaluates solutions on these 7 structured sections:
                </p>
              </div>
              <div className="shrink-0 font-mono text-xs text-muted-foreground border border-border/80 rounded-xl p-3 bg-background/50">
                <span className="text-cyan font-bold">Deadline:</span> 19 December 2026
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {ELIGIBILITY_DATA.pptSubmission.map((sec, idx) => (
                <div
                  key={sec}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-4 transition-all hover:border-cyan/40 hover:bg-background/80"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-cyan/30 bg-cyan/10 font-mono text-xs font-bold text-cyan">
                    0{idx + 1}
                  </span>
                  <span className="font-sans text-sm font-medium text-foreground">{sec}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-xl border border-cyan/40 bg-cyan/5 p-4 sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <Sparkles className="h-5 w-5 text-cyan shrink-0" />
                <span className="font-sans text-xs text-muted-foreground">
                  Originality and clear system architecture earn top evaluation scores.
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
