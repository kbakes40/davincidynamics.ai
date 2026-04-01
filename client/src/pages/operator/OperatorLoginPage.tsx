import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { operatorLogin } from "@/internal/api";

function readNextTarget(): string {
  if (typeof window === "undefined") return "/control";
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (!next || !next.startsWith("/")) return "/control";
  return next;
}

export default function OperatorLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await operatorLogin(email, password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setLocation(readNextTarget());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_74%_46%_at_50%_-10%,rgba(34,211,238,0.17),transparent_56%),linear-gradient(180deg,#020617_0%,#01040b_100%)]" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-2xl border border-cyan-300/18 bg-slate-950/72 p-8 shadow-[0_18px_70px_rgba(0,0,0,0.55),0_0_80px_-22px_rgba(34,211,238,0.26)] backdrop-blur-xl"
        >
          <p className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-sky-400 bg-clip-text text-xs font-semibold uppercase tracking-[0.24em] text-transparent">
            DaVinci Control
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">Secure Login</h1>
          <p className="mt-2 text-sm text-cyan-100/65">Authorized DaVinci Dynamics team members only.</p>

          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-cyan-100/80">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border-cyan-300/20 bg-slate-900/70 text-white placeholder:text-cyan-100/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-cyan-100/80">Password</label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="border-cyan-300/20 bg-slate-900/70 text-white placeholder:text-cyan-100/30"
                required
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          <Button
            type="submit"
            disabled={loading}
            className="mt-7 w-full bg-gradient-to-r from-cyan-400 to-sky-400 font-semibold text-slate-950 hover:from-cyan-300 hover:to-sky-300"
          >
            {loading ? "Signing in..." : "Enter Operator Portal"}
          </Button>
        </form>
      </div>
    </div>
  );
}

