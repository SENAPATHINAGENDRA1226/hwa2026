import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { TIMELINE } from "@/lib/event-content";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./SectionHeading";

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
          x: window.innerWidth >= 768 ? (fromLeft ? -60 : 60) : 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 80%" },
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
    <section id="timeline" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl" ref={root}>
        <SectionHeading
          eyebrow="Event timeline"
          title="The 24-Hour"
          highlight="Signal Path"
          description="Every milestone fires the next. Here’s how the two days unfold."
        />

        <div className="tl-track relative mt-20">
          {/* base line + glowing progress */}
          <div className="absolute bottom-0 left-4 top-0 w-px bg-border md:left-1/2 md:-translate-x-1/2" />
          <div className="tl-progress absolute bottom-0 left-4 top-0 w-0.5 origin-top translate-x-[-0.5px] bg-linear-to-b from-cyan via-violet to-magenta shadow-(--shadow-glow-cyan)] md:left-1/2 md:-translate-x-1/2" />

          <ol className="space-y-10 md:space-y-4">
            {TIMELINE.map((m, i) => {
              const side = i % 2 === 0 ? "left" : "right";
              const newDay = i === 0 || TIMELINE[i - 1]?.day !== m.day;
              return (
                <li key={m.title} data-side={side} className="tl-item group relative">
                  {newDay && (
                    <div className="relative z-10 mb-8 flex pl-12 md:justify-center md:pl-0">
                      <span className="rounded-full border border-cyan/40 bg-background px-5 py-1.5 font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan glow-cyan">
                        {m.day}
                      </span>
                    </div>
                  )}
                  <div className="relative md:grid md:grid-cols-2 md:gap-16">
                    {/* node */}
                    <span className="absolute left-4 top-6 z-10 grid h-5 w-5 -translate-x-1/2 place-items-center md:left-1/2">
                      <span className="absolute h-5 w-5 rounded-full border border-border bg-background transition-all duration-500 group-[.is-active]:scale-125 group-[.is-active]:border-cyan group-[.is-done]:border-violet" />
                      <span className="relative h-2 w-2 rounded-full bg-muted-foreground transition-all duration-500 group-[.is-active]:bg-cyan group-[.is-active]:glow-cyan group-[.is-done]:bg-violet" />
                    </span>
                    <div className={cn("pl-12 md:pl-0", side === "left" ? "md:col-start-1 md:text-right" : "md:col-start-2")}>
                      <div className="tl-card glass relative inline-block w-full overflow-hidden rounded-2xl p-5 text-left transition-colors duration-500 group-[.is-active]:border-cyan/50 sm:p-6 md:max-w-md">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon opacity-0 transition-opacity duration-500 group-[.is-active]:opacity-100" />
                        <p className="font-mono text-xs tracking-[0.25em] text-cyan">{m.time} IST</p>
                        <h3 className="mt-2 font-display text-lg font-bold">{m.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.detail}</p>
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
