import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FileCheck2,
  Flame,
  Presentation,
  Rocket,
  Search,
  UserCheck2,
} from "lucide-react";
import { useRef } from "react";
import { TIMELINE } from "@/lib/event-content";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

const BADGE_CONFIG = {
  Registration: {
    icon: UserCheck2,
    color: "border-cyan/40 text-cyan bg-cyan/10",
  },
  Submission: {
    icon: Presentation,
    color: "border-amber-400/40 text-amber-300 bg-amber-400/10",
  },
  Screening: {
    icon: Search,
    color: "border-violet/40 text-violet bg-violet/10",
  },
  Hackathon: {
    icon: Rocket,
    color: "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
  },
} as const;

export function Timeline() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(".tl-progress", { scaleY: 1 });
        gsap.set(".tl-item", { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(
        ".tl-progress",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".tl-track", start: "top 65%", end: "bottom 65%", scrub: 0.6 },
        },
      );
      gsap.utils.toArray<HTMLElement>(".tl-item").forEach((item) => {
        const fromLeft = item.dataset["side"] === "left";
        gsap.from(item.querySelector(".tl-card"), {
          x: window.innerWidth >= 768 ? (fromLeft ? -50 : 50) : 30,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 82%" },
        });
        ScrollTrigger.create({
          trigger: item,
          start: "top 65%",
          end: "bottom 65%",
          toggleClass: { targets: item, className: "is-active" },
          onLeave: () => item.classList.add("is-done"),
          onEnterBack: () => item.classList.remove("is-done"),
        });
      });
    },
    { scope: root },
  );

  return (
    <section id="timeline" className="relative px-5 py-24 sm:px-8 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl" ref={root}>
        <SectionHeading
          eyebrow="Timeline of the Event"
          title="Chronological"
          highlight="Event Timeline"
          description="Six key milestones guiding your path from registration to the grand finale."
        />

        <div className="tl-track relative mt-20">
          {/* Base track + Glowing progress line */}
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <div className="tl-progress absolute bottom-0 left-4 top-0 w-0.5 origin-top translate-x-[-0.5px] bg-linear-to-b from-cyan via-violet to-emerald-400 shadow-[0_0_12px_rgba(0,240,255,0.6)] md:left-1/2 md:-translate-x-1/2" />

          <ol className="space-y-12 md:space-y-10">
            {TIMELINE.map((m, i) => {
              const side = i % 2 === 0 ? "left" : "right";
              const badgeCfg = BADGE_CONFIG[m.badge];
              const BadgeIcon = badgeCfg.icon;

              return (
                <li key={m.title} data-side={side} className="tl-item group relative">
                  <div className="relative md:grid md:grid-cols-2 md:gap-16">
                    {/* Node on vertical line */}
                    <span className="absolute left-4 top-6 z-10 grid h-6 w-6 -translate-x-1/2 place-items-center md:left-1/2">
                      <span className="absolute h-6 w-6 rounded-full border border-border bg-background transition-all duration-500 group-[.is-active]:scale-125 group-[.is-active]:border-cyan group-[.is-done]:border-emerald-400" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-muted-foreground transition-all duration-500 group-[.is-active]:bg-cyan group-[.is-active]:glow-cyan group-[.is-done]:bg-emerald-400" />
                    </span>

                    {/* Content Card */}
                    <div className={cn("pl-12 md:pl-0", side === "left" ? "md:col-start-1 md:text-right" : "md:col-start-2")}>
                      <div className="tl-card glass relative inline-block w-full overflow-hidden rounded-2xl p-6 text-left transition-all duration-500 group-[.is-active]:border-cyan/50 hover:border-cyan/40 sm:p-7 md:max-w-lg">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon opacity-0 transition-opacity duration-500 group-[.is-active]:opacity-100" />

                        {/* Top row: Stage & Category badge */}
                        <div className={cn("flex flex-wrap items-center justify-between gap-2", side === "left" && "md:flex-row-reverse")}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{m.stage}</span>
                            {m.isKeyDeadline && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-red-400">
                                <Flame className="h-2.5 w-2.5" /> Key Deadline
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider",
                              badgeCfg.color,
                            )}
                          >
                            <BadgeIcon className="h-3.5 w-3.5" />
                            {m.badge}
                          </span>
                        </div>

                        {/* Date header */}
                        <div className="mt-4 flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-cyan shrink-0" />
                          <span className="font-mono text-sm sm:text-base font-bold text-cyan tracking-wide">{m.date}</span>
                        </div>

                        {/* Title and details */}
                        <h3 className="mt-2 font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">{m.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
