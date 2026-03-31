import { cn } from "@/lib/utils";

export function normalizeWebsiteUrl(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;
  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function websiteDisplayText(value: string | null | undefined): string {
  const href = normalizeWebsiteUrl(value);
  if (!href) return "No website";
  try {
    const url = new URL(href);
    const host = url.hostname.replace(/^www\./i, "");
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${host}${path}`;
  } catch {
    return href;
  }
}

export function WebsiteLink({
  value,
  className,
  fallback = "No website",
  showExternalIcon = false,
  truncate = false,
}: {
  value: string | null | undefined;
  className?: string;
  fallback?: string;
  showExternalIcon?: boolean;
  truncate?: boolean;
}) {
  const href = normalizeWebsiteUrl(value);
  if (!href) {
    return <span className={cn("text-muted-foreground", className)}>{fallback}</span>;
  }

  const label = websiteDisplayText(value);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={href}
      className={cn(
        "text-emerald-300 hover:text-emerald-200 underline underline-offset-4 inline-flex items-center gap-1 min-w-0",
        truncate && "max-w-full truncate",
        className
      )}
      onClick={e => e.stopPropagation()}
    >
      <span className={cn(truncate && "truncate")}>{label}</span>
      {showExternalIcon ? <span aria-hidden>↗</span> : null}
    </a>
  );
}
