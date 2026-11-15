import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getTimeLeft, type TimeLeft } from "@/lib/countdown";

export function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const t = new Date(target);
    const tick = () => setLeft(getTimeLeft(t, new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (left?.done) {
    return (
      <p className="font-display text-lg tracking-widest text-cyan text-glow">THE HACK IS LIVE</p>
    );
  }

  const units: [string, number | undefined][] = [
    ["Days", left?.days],
    ["Hours", left?.hours],
    ["Mins", left?.minutes],
    ["Secs", left?.seconds],
  ];

  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="Time until the hackathon begins">
      {units.map(([label, value]) => {
        const text = value === undefined ? "--" : String(value).padStart(2, "0");
        return (
          <div key={label} className="glass relative w-16 overflow-hidden rounded-xl px-2 py-3 text-center sm:w-20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-neon opacity-70" />
            <div className="relative h-8 overflow-hidden sm:h-10">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={text}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0 font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl"
                >
                  {text}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
