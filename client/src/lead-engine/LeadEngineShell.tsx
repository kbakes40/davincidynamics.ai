import { Link, useLocation } from "wouter";
import {
  BarChart3,
  Briefcase,
  KanbanSquare,
  LayoutDashboard,
  Megaphone,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { leSurface } from "./surface";

const nav = [
  { href: "/lead-engine", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lead-engine/jobs", label: "Jobs", icon: Briefcase },
  { href: "/lead-engine/leads", label: "Leads", icon: Users },
  { href: "/lead-engine/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/lead-engine/outreach", label: "Outreach", icon: Megaphone },
  { href: "/lead-engine/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function LeadEngineShell({
  children,
  title,
  subtitle,
  headerActions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
}) {
  const [loc] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside
        className={cn(
          leSurface,
          "hidden lg:flex w-[260px] flex-col border-r border-white/[0.08] rounded-none border-y-0 border-l-0 bg-card/40 shrink-0"
        )}
      >
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/lead-engine">
            <span className="font-display font-bold text-lg text-foreground tracking-tight block">
              Lead Engine
            </span>
          </Link>
          <p className="text-[11px] text-muted-foreground font-heading mt-1 uppercase tracking-wider">
            DaVinci Dynamics
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => {
            const active =
              item.href === "/lead-engine"
                ? loc === "/lead-engine" || loc === "/lead-engine/"
                : loc.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading transition-colors cursor-pointer",
                    active
                      ? "bg-white/[0.07] text-foreground border border-white/[0.08]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="size-4 opacity-80 shrink-0" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <Link href="/">
            <span className="text-xs font-heading text-muted-foreground hover:text-accent transition-colors cursor-pointer">
              ← Back to site
            </span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-background/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 px-4 lg:px-8 py-4 max-w-[1600px] mx-auto w-full">
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1">
              {nav.map(item => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-heading whitespace-nowrap border",
                      loc === item.href || loc.startsWith(item.href)
                        ? "border-accent/30 bg-accent/10 text-foreground"
                        : "border-white/10 text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="hidden lg:block min-w-0 flex-1">
              {title ? (
                <>
                  <h1 className="font-display font-bold text-xl text-foreground tracking-tight truncate">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="text-xs text-muted-foreground font-heading mt-0.5 truncate">{subtitle}</p>
                  ) : null}
                </>
              ) : null}
            </div>
            {headerActions ? (
              <div className="flex items-center gap-2 shrink-0">{headerActions}</div>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
