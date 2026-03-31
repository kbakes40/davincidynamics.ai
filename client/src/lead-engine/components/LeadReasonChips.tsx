import { cn } from "@/lib/utils";
import { leInset } from "../surface";

export function LeadReasonChips({ codes, className }: { codes: string[]; className?: string }) {
  if (codes.length === 0) {
    return <span className="text-xs text-muted-foreground font-heading">No flags</span>;
  }
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {codes.map(code => (
        <span
          key={code}
          className={cn(
            leInset,
            "px-2 py-1 text-[11px] font-heading text-muted-foreground border-white/[0.08]"
          )}
        >
          {code}
        </span>
      ))}
    </div>
  );
}
