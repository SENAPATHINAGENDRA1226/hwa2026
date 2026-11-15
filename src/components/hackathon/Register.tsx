import { CheckCircle2 } from "lucide-react";
import { EVENT } from "@/lib/event-content";
import { RegisterButton } from "./RegisterButton";
import { Reveal } from "./Reveal";

const STEPS = [
  "Form a team of 2 – 4 members",
  "Register your team online",
  "Pick your theme and get shortlisted",
  "Show up and hack for 24 hours",
];

export function Register() {
  return (
    <section id="register" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative rounded-[2rem] p-px border-orbit">
            <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-background px-6 py-14 text-center sm:px-14 sm:py-20">
              <div className="pointer-events-none absolute inset-0 bg-neural-grid opacity-60 mask-[radial-gradient(ellipse_at_center,black,transparent_70%)]" />
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-violet/25 blur-3xl" />

              <p className="relative font-mono text-xs uppercase tracking-[0.3em] text-cyan">Registration Open</p>
              <h2 className="relative mt-4 font-display text-3xl font-black leading-tight sm:text-5xl">
                Ready to <span className="text-neon">plug in?</span>
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-muted-foreground">
                Seats are limited. Lock in your team’s spot at {EVENT.name} and join the most intelligent 24 hours on
                campus.
              </p>

              <ul className="relative mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 rounded-xl border border-border bg-glass px-4 py-3 text-sm">
                    <span className="font-mono text-xs text-violet">0{i + 1}</span>
                    <span className="flex-1">{s}</span>
                    <CheckCircle2 className="h-4 w-4 text-cyan" />
                  </li>
                ))}
              </ul>

              <div className="relative mt-12 flex justify-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-cyan/40 blur-2xl animate-pulse-glow" />
                  <RegisterButton size="lg" className="relative" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
