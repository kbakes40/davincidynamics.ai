import { OperatorLayout } from "@/components/operator/OperatorLayout";
import { useOperatorAuth } from "@/internal/useOperatorAuth";

type Props = {
  title: string;
  description: string;
};

export default function OperatorPlaceholderPage({ title, description }: Props) {
  const auth = useOperatorAuth({ required: true });

  if (auth.loading) return <div className="min-h-screen bg-[#02040a]" />;
  if (!auth.isAuthenticated) return null;

  return (
    <OperatorLayout title={title} subtitle="Operator module" onLogout={auth.logout}>
      <div className="rounded-2xl border border-cyan-300/16 bg-slate-950/62 p-8 shadow-[0_10px_36px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        <p className="text-cyan-100/78">{description}</p>
        <p className="mt-4 text-sm text-cyan-100/55">This module scaffold is ready for expansion.</p>
      </div>
    </OperatorLayout>
  );
}

