import { Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Medal,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { PARTICIPATION_BENEFITS } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ParticipationBenefits() {
  return (
    <section id="benefits" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20 overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-cyan/10 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-violet/15 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Credentials & Honors"
          title="Participation Benefits"
          highlight="For All Teams"
          description="Every builder leaves with verified credentials backed by Unstop and Avanthi Institute of Engineering and Technology."
        />

        {/* Benefits Grid: Every Participant vs Round 2 Finalists */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {/* Box 1: For Every Participant */}
          <Reveal delay={0.05}>
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-cyan/40 p-8 transition-all duration-300 hover:border-cyan hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan/40 bg-cyan/10 text-cyan">
                    <ScrollText className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-cyan rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1">
                    All Participants
                  </span>
                </div>

                <h3 className="mt-6 font-display text-xl sm:text-2xl font-bold text-foreground">
                  For Every Participant
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Recognizing the hard work and technical effort of every innovator who enters the arena.
                </p>

                <ul className="mt-6 space-y-4">
                  {PARTICIPATION_BENEFITS.allParticipants.map((item, idx) => (
                    <li key={idx} className="rounded-xl border border-border bg-background/50 p-4">
                      <div className="flex items-center gap-2 font-display text-sm font-bold text-cyan">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan" />
                        <span>{item.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground pl-6">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Issuance:</span>
                <span className="text-cyan font-bold">Immediately upon round completion</span>
              </div>
            </div>
          </Reveal>

          {/* Box 2: For Round 2 Qualified Candidates */}
          <Reveal delay={0.1}>
            <div className="glass group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-violet/40 p-8 transition-all duration-300 hover:border-violet hover:-translate-y-1">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-violet via-fuchsia-500 to-pink-500" />
              <div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet/40 bg-violet/10 text-violet">
                    <Medal className="h-6 w-6" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-widest text-violet rounded-full border border-violet/30 bg-violet/10 px-3 py-1">
                    Round 2 Finalists
                  </span>
                </div>

                <h3 className="mt-6 font-display text-xl sm:text-2xl font-bold text-foreground">
                  For Round 2 Qualified Candidates
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Distinguished honors reserved for teams who excel during the screening and advance to the grand jury stage.
                </p>

                <ul className="mt-6 space-y-4">
                  {PARTICIPATION_BENEFITS.round2Qualified.map((item, idx) => (
                    <li key={idx} className="rounded-xl border border-border bg-background/50 p-4">
                      <div className="flex items-center gap-2 font-display text-sm font-bold text-violet">
                        <Sparkles className="h-4 w-4 shrink-0 text-violet" />
                        <span>{item.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground pl-6">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>Certification:</span>
                <span className="text-violet font-bold">Digital Excellence + Physical Trophy/Plaque</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Certificate Generation Functionality Feature Card */}
        <Reveal delay={0.15} className="mt-8">
          <div className="glass relative overflow-hidden rounded-3xl border border-emerald-500/30 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-foreground">
                    Zero-Delay Instant Certificate Generation
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                    E-certificates are generated immediately once the authorized round-completion process is triggered.
                    No waiting 24 hours. Access and download your certificate anytime via the Student Portal.
                  </p>
                </div>
              </div>

              <Link
                to="/portal"
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-emerald-300 transition-all hover:bg-emerald-500/20"
              >
                <Download className="h-4 w-4" /> Open Student Portal
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
