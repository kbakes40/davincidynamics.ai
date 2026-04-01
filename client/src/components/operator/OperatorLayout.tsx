import { type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onLogout: () => void;
};

const links = [
  { label: "Lead Generation", path: "/lead-engine" },
  { label: "Analytics", path: "/backend/traffic" },
  { label: "AI Team", path: "/ai-team" },
  { label: "Sites", path: "/control/sites" },
  { label: "Admin Tools", path: "/control/admin-tools" },
  { label: "Settings", path: "/control/settings" },
];

export function OperatorLayout({ title, subtitle, children, onLogout }: Props) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_78%_52%_at_50%_-10%,rgba(34,211,238,0.16),transparent_58%),linear-gradient(180deg,#020617_0%,#01040b_100%)]" />
      <div className="relative z-10">
        <header className="border-b border-cyan-300/15 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-4">
            <div>
              <p className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-400 bg-clip-text text-sm font-semibold uppercase tracking-[0.24em] text-transparent">
                DaVinci Dynamics
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-cyan-100/65">{subtitle}</p> : null}
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-300/20 hover:text-cyan-50"
              onClick={onLogout}
            >
              Log out
            </Button>
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-cyan-300/15 bg-slate-950/60 p-3 backdrop-blur-xl">
            <nav className="space-y-1">
              {links.map(link => {
                const active = location === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`block rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-cyan-400/18 text-cyan-100" : "text-cyan-100/70 hover:bg-cyan-400/10 hover:text-cyan-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section>{children}</section>
        </main>
      </div>
    </div>
  );
}

