import {
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { COORDINATORS, VENUE } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function ContactVenue() {
  return (
    <section id="contact" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20 overflow-hidden">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-cyan/15 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 bottom-1/4 h-80 w-80 rounded-full bg-violet/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Get In Touch"
          title="Contact &"
          highlight="Event Venue"
          description="Have questions? Reach out directly to our student and faculty coordinators or locate our campus."
        />

        {/* Coordinators Grid */}
        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          {/* Student Coordinators */}
          <div className="space-y-6">
            <Reveal delay={0.05}>
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan/40 bg-cyan/10 text-cyan">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Event Coordinators</h3>
                  <p className="text-xs text-muted-foreground">Student leadership & organization</p>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {COORDINATORS.student.map((c, idx) => (
                <Reveal key={c.name} delay={idx * 0.1}>
                  <div className="glass group relative flex flex-col justify-between rounded-2xl border border-cyan/30 p-6 transition-all duration-300 hover:border-cyan hover:-translate-y-1">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-cyan">{c.role}</span>
                      <h4 className="mt-2 font-display text-lg font-bold text-foreground">{c.name}</h4>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-cyan/70 shrink-0" />
                        <a href={`tel:+91${c.phone}`} className="hover:text-foreground font-mono">
                          +91 {c.phone}
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60">
                      <a
                        href={c.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 font-mono text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-400" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Faculty Coordinators */}
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-violet/40 bg-violet/10 text-violet">
                  <GraduationCap className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Faculty Coordinators</h3>
                  <p className="text-xs text-muted-foreground">Department advisory & mentorship</p>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {COORDINATORS.faculty.map((c, idx) => (
                <Reveal key={c.name} delay={idx * 0.1}>
                  <div className="glass group relative flex flex-col justify-between rounded-2xl border border-violet/30 p-6 transition-all duration-300 hover:border-violet hover:-translate-y-1">
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-violet">{c.role}</span>
                      <h4 className="mt-2 font-display text-lg font-bold text-foreground">{c.name}</h4>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-violet/70 shrink-0" />
                        <a href={`tel:+91${c.phone}`} className="hover:text-foreground font-mono">
                          +91 {c.phone}
                        </a>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/60">
                      <a
                        href={c.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 font-mono text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:border-emerald-500/60"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-400" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Venue Information Card */}
        <Reveal delay={0.2} className="mt-12">
          <div className="glass relative overflow-hidden rounded-3xl border border-cyan/40 p-8 sm:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon" />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-cyan">
                <MapPin className="h-3.5 w-3.5" /> Event Venue
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                {VENUE.name}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {VENUE.location}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
