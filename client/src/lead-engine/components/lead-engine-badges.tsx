import { cn } from "@/lib/utils";
import type { JobStatus, VerificationStatus } from "@shared/lead-engine-types";

export function LeadScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80 ? "text-emerald-400/90 border-emerald-500/25 bg-emerald-500/10" :
    score >= 60 ? "text-foreground border-white/15 bg-white/[0.04]" :
    "text-muted-foreground border-white/10 bg-white/[0.03]";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[2.25rem] px-2 py-0.5 rounded-md border text-xs font-heading font-semibold tabular-nums",
        tone
      )}
    >
      {score}
    </span>
  );
}

const verificationStyles: Record<VerificationStatus, string> = {
  verified: "text-emerald-400/85 border-emerald-500/20 bg-emerald-500/[0.07]",
  pending: "text-amber-200/80 border-amber-400/20 bg-amber-400/[0.06]",
  unverified: "text-muted-foreground border-white/10 bg-white/[0.03]",
  failed: "text-red-400/85 border-red-500/25 bg-red-500/[0.07]",
};

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const label =
    status === "verified" ? "Verified" :
    status === "pending" ? "Pending" :
    status === "failed" ? "Failed" :
    "Unverified";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-heading font-semibold uppercase tracking-wide",
        verificationStyles[status]
      )}
    >
      {label}
    </span>
  );
}

const jobStyles: Record<JobStatus, string> = {
  running: "text-sky-300/90 border-sky-400/25 bg-sky-400/10",
  queued: "text-muted-foreground border-white/12 bg-white/[0.04]",
  completed: "text-emerald-400/85 border-emerald-500/20 bg-emerald-500/[0.07]",
  failed: "text-red-400/85 border-red-500/25 bg-red-500/[0.07]",
  cancelled: "text-muted-foreground border-white/10 bg-white/[0.03]",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-heading font-semibold capitalize",
        jobStyles[status]
      )}
    >
      {status}
    </span>
  );
}
