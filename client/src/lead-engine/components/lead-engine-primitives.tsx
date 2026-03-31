import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { leInset, leMuted, leSurface, leSurfaceHover } from "../surface";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="space-y-1.5 min-w-0">
        <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? <p className={cn(leMuted, "max-w-2xl")}>{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn(leSurface, leSurfaceHover, "p-5 lg:p-6", className)}>
      <p className={cn(leMuted, "mb-2 uppercase tracking-wider text-[11px]")}>{label}</p>
      <p className="font-display text-2xl sm:text-3xl font-bold text-foreground tabular-nums">{value}</p>
      {hint ? <p className={cn(leMuted, "mt-2 text-xs")}>{hint}</p> : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(leSurface, "overflow-hidden", className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h2 className="font-heading font-semibold text-base text-foreground">{title}</h2>
          {description ? <p className={cn(leMuted, "mt-1 text-xs")}>{description}</p> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn(leInset, "p-8 text-center max-w-md mx-auto")}>
      <p className="font-heading font-semibold text-foreground mb-2">{title}</p>
      <p className={cn(leMuted, "text-sm mb-4")}>{description}</p>
      {action}
    </div>
  );
}

export function RefreshControl({
  loading,
  lastUpdated,
  onRefresh,
}: {
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground font-heading">
      {lastUpdated ? (
        <span className="tabular-nums">
          Last updated {lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 border-white/12 bg-background/40 hover:bg-background/60 text-foreground"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={cn("size-3.5 mr-1.5", loading && "animate-spin")} />
        Refresh
      </Button>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-64 bg-white/10 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-white/[0.07] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 bg-white/[0.07] rounded-2xl" />
    </div>
  );
}

export function SearchToolbar({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full sm:max-w-md h-10 rounded-lg border border-white/[0.1] bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none",
        "focus-visible:border-accent/35 focus-visible:ring-1 focus-visible:ring-accent/25 transition-colors font-heading"
      )}
    />
  );
}
