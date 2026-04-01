import { Link } from "wouter";
import { OperatorLayout } from "@/components/operator/OperatorLayout";
import { useOperatorAuth } from "@/internal/useOperatorAuth";

const modules = [
  {
    title: "Lead Generation",
    description: "Lead engine operations, jobs, leads, and outreach pipelines.",
    href: "/lead-engine",
  },
  {
    title: "Analytics",
    description: "Traffic intelligence and growth performance monitoring.",
    href: "/backend/traffic",
  },
  {
    title: "AI Team",
    description: "AI specialist workflows and operator orchestration surfaces.",
    href: "/ai-team",
  },
  {
    title: "Sites",
    description: "Website and deployment control surfaces for client properties.",
    href: "/control/sites",
  },
  {
    title: "Admin Tools",
    description: "Internal controls, operations utilities, and system access tools.",
    href: "/control/admin-tools",
  },
  {
    title: "Settings",
    description: "Portal preferences and future operator configuration controls.",
    href: "/control/settings",
  },
];

export default function OperatorDashboardPage() {
  const auth = useOperatorAuth({ required: true });

  if (auth.loading) {
    return <div className="min-h-screen bg-[#02040a]" />;
  }
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <OperatorLayout
      title="DaVinci Control"
      subtitle="Executive command center for DaVinci Dynamics systems."
      onLogout={auth.logout}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(module => (
          <Link
            key={module.title}
            href={module.href}
            className="group rounded-2xl border border-cyan-300/16 bg-slate-950/62 p-6 shadow-[0_10px_36px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-colors hover:border-cyan-300/28 hover:bg-slate-900/72"
          >
            <p className="text-lg font-semibold tracking-tight text-white">{module.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-cyan-100/65">{module.description}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-cyan-300/70 group-hover:text-cyan-200/85">Open module</p>
          </Link>
        ))}
      </div>
    </OperatorLayout>
  );
}

