import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { operatorMe, operatorLogout, type OperatorUser } from "./api";

type Options = {
  required?: boolean;
};

export function useOperatorAuth(options: Options = {}) {
  const required = options.required ?? false;
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<OperatorUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const me = await operatorMe();
        if (!cancelled) setUser(me);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!required || loading || user) return;
    const target = encodeURIComponent(location);
    setLocation(`/control/login?next=${target}`);
  }, [required, loading, user, location, setLocation]);

  const logout = async () => {
    await operatorLogout();
    setUser(null);
    setLocation("/control/login");
  };

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    logout,
  };
}

