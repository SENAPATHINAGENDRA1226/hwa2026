import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = { eyebrow: string; title: string; highlight?: string; description?: string; className?: string };

/** Word-by-word text reveal as the heading scrolls into view. */
export function SectionHeading({ eyebrow, title, highlight, description, className }: Props) {
  const words = title.split(" ");
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-glass px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-cyan"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-glow" />
        {eyebrow}
      </motion.div>
      <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {w}&nbsp;
            </motion.span>
          </span>
        ))}
        {highlight && (
          <span className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block text-neon"
              initial={{ y: "110%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: words.length * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              {highlight}
            </motion.span>
          </span>
        )}
      </h2>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
