import {
  Blocks, Bot, BrainCircuit, GraduationCap, HeartPulse, Leaf, ShieldCheck, Sparkles, Wallet, type LucideIcon,
} from "lucide-react";
import { useRef } from "react";
import { THEMES, type ThemeIcon } from "@/lib/event-content";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ICONS: Record<ThemeIcon, LucideIcon> = {
  sparkles: Sparkles, brain: BrainCircuit, shield: ShieldCheck, blocks: Blocks, bot: Bot,
  heart: HeartPulse, wallet: Wallet, leaf: Leaf, education: GraduationCap,
};

function ThemeCard({ theme, index }: { theme: (typeof THEMES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = ICONS[theme.icon];

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 10}deg) translateZ(0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Reveal delay={(index % 3) * 0.1}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="glass group relative h-full overflow-hidden rounded-2xl p-6 transition-[transform,border-color] duration-300 ease-out hover:border-cyan/50"
      >
        {/* cursor spotlight */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(240px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklab,var(--neon-cyan)_16%,transparent),transparent_70%)]" />
        {/* scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-cyan/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-scan" />

        <div className="relative flex items-start justify-between">
          <div className="relative grid h-16 w-16 place-items-center">
            <svg className="absolute inset-0 h-full w-full animate-spin-slow" viewBox="0 0 64 64" aria-hidden>
              <circle cx="32" cy="32" r="30" fill="none" stroke="var(--neon-cyan)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="4 6" />
            </svg>
            <svg className="absolute inset-0 h-full w-full animate-spin-reverse" viewBox="0 0 64 64" aria-hidden>
              <circle cx="32" cy="2" r="2.5" fill="var(--neon-violet)" />
              <circle cx="32" cy="32" r="22" fill="none" stroke="var(--neon-violet)" strokeOpacity="0.35" strokeWidth="1" />
            </svg>
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-background/70 transition-all duration-300 group-hover:scale-110 group-hover:glow-cyan">
              <Icon className="h-5 w-5 text-cyan transition-colors group-hover:text-foreground" />
            </div>
          </div>
          <span className="font-mono text-xs tracking-widest text-muted-foreground">{theme.code}</span>
        </div>
        <h3 className="relative mt-6 font-display text-lg font-bold tracking-wide">{theme.title}</h3>
        <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{theme.blurb}</p>
        <div className="relative mt-6 h-px w-full overflow-hidden bg-border">
          <div className="h-full w-0 bg-gradient-neon transition-all duration-700 group-hover:w-full" />
        </div>
      </div>
    </Reveal>
  );
}

export function Themes() {
  return (
    <section id="themes" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-cyan/10 blur-[120px]" />
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Hackathon themes"
          title="Nine Paths Into The"
          highlight="Future"
          description="Choose the domain that sparks your curiosity. Every theme has its own jury award."
        />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((t, i) => (
            <ThemeCard key={t.code} theme={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
