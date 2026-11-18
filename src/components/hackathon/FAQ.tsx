import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { FAQS } from "@/lib/event-content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative px-5 py-24 sm:px-8 sm:py-32 scroll-mt-20">
      <div className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet/10 blur-[130px]" />
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Common Queries"
          title="Frequently Asked"
          highlight="Questions"
          description="Everything you need to know about eligibility, registration, PPT submissions, and certificates."
        />

        <div className="mt-16 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Reveal key={idx} delay={(idx % 6) * 0.04}>
                <div
                  className={cn(
                    "glass overflow-hidden rounded-2xl border transition-all duration-300",
                    isOpen ? "border-cyan/50 bg-background/90" : "border-border hover:border-border/80",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-cyan">
                        Q{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-base sm:text-lg font-bold text-foreground">
                        {faq.q}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-background/50 transition-transform duration-300",
                        isOpen && "rotate-180 border-cyan/40 bg-cyan/10 text-cyan",
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border/50 px-5 sm:px-6 pb-6 pt-4 text-sm sm:text-base leading-relaxed text-muted-foreground animate-in fade-in-50 duration-300">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
