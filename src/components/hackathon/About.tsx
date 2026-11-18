import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { EVENT } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const DETAILS = [
  { icon: CalendarDays, label: "Date", value: EVENT.dateLabel },
  { icon: MapPin, label: "Venue", value: EVENT.venue },
  { icon: Clock, label: "Duration", value: `${EVENT.duration} · 2 Days` },
  { icon: Users, label: "Team Size", value: EVENT.teamSize },
];

const PILLARS = [
  { k: "01", t: "Build", d: "Turn a bold idea into a working prototype in 24 hours." },
  { k: "02", t: "Learn", d: "Mentors, tech talks and hands-on help through the night." },
  { k: "03", t: "Connect", d: "Meet builders, mentors and recruiters from across the region." },
];

export function About() {
  return (
    <section id="about" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="About the hack"
          title="Enter the"
          highlight="Neural Arena"
          description={`HACK WITH AVANTHI 2026 is a two-day technical hackathon organised by ${EVENT.organiser} at ${EVENT.institute}. 2nd and 3rd year innovators from CSM and CSD departments team up to solve real-world problems with code, hardware, and AI.`}
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-5">
          <Reveal className="glass relative overflow-hidden rounded-3xl p-8 lg:col-span-3 sm:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet/25 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Mission Overview</p>
            <h3 className="mt-4 font-display text-2xl font-bold sm:text-3xl">2 Days. Infinite possibilities.</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              From generative AI to sustainable tech, pick one of nine themes and ship something that matters.
              Whether it’s your first hackathon or your fiftieth, you’ll leave with new skills, new friends and a
              project you’re proud of.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {PILLARS.map((p) => (
                <div key={p.k} className="rounded-2xl border border-border bg-background/40 p-5">
                  <span className="font-mono text-xs text-violet">{p.k}</span>
                  <p className="mt-2 font-display font-semibold">{p.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
            {DETAILS.map((d, i) => (
              <Reveal key={d.label} delay={0.1 * i} className="glass group flex items-center gap-5 rounded-2xl p-5 transition-colors hover:border-cyan/40">
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-border bg-background/50">
                  <span className="absolute inset-0 rounded-xl bg-cyan/10 opacity-0 transition-opacity group-hover:opacity-100" />
                  <d.icon className="h-5 w-5 text-cyan" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{d.label}</p>
                  <p className="mt-1 font-display text-base font-semibold sm:text-lg">{d.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
