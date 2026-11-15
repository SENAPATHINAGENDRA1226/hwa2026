import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EVENT } from "@/lib/event-content";
import { cn } from "@/lib/utils";

export function RegisterButton({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <Link
      to="/register"
      className={cn(
        "group relative inline-flex rounded-full p-[1.5px] border-orbit glow-cyan transition-transform duration-300 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex items-center gap-2 rounded-full bg-background font-display font-semibold uppercase tracking-[0.15em] text-foreground transition-colors group-hover:bg-background/70",
          size === "lg" ? "px-9 py-4 text-sm sm:text-base" : "px-7 py-3 text-xs sm:text-sm",
        )}
      >
        Register Now
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
