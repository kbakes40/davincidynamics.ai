export type OperatorUser = {
  email: string;
  role: "operator";
};

type MeResponse = { ok: true; user: OperatorUser } | { ok: false };

export async function operatorMe(): Promise<OperatorUser | null> {
  const res = await fetch("/api/internal/auth/me", {
    credentials: "include",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as MeResponse;
  if (!json.ok) return null;
  return json.user;
}

export async function operatorLogin(email: string, password: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch("/api/internal/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const json = (await res.json()) as { ok: boolean; message?: string };
    if (!res.ok || !json.ok) {
      return { ok: false, message: json.message ?? "Login failed." };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Unable to reach server. Check your local URL and try again." };
  }
}

export async function operatorLogout(): Promise<void> {
  await fetch("/api/internal/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

