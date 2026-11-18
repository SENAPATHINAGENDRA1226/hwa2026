import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function RegisterButton({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const isFull = className?.includes("w-full");
  return (
    <Link
      to="/register"
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full p-[1.5px] border-orbit transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-full",
        !isFull && "shrink-0",
        className,
      )}
    >
      <span
        className={cn(
          "relative inline-flex items-center justify-center gap-1.5 rounded-full bg-background font-display font-semibold uppercase tracking-[0.12em] text-foreground transition-colors group-hover:bg-background/80 whitespace-nowrap",
          isFull && "w-full",
          size === "sm"
            ? "px-3 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px]"
            : size === "lg"
            ? "px-5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm"
            : "px-4 py-2 sm:px-5 sm:py-2.5 text-xs",
        )}
      >
        <span>Register Now</span>
        <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
