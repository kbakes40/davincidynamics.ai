import type { LeadActivityItem } from "@shared/lead-engine-types";
import { cn } from "@/lib/utils";
import { leInset, leMuted } from "../surface";

export function ActivityFeed({ items, className }: { items: LeadActivityItem[]; className?: string }) {
  if (items.length === 0) {
    return <p className={cn(leMuted, "text-sm")}>No activity yet.</p>;
  }
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map(item => (
        <li key={item.id} className={cn(leInset, "p-3 flex gap-3")}>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground font-heading">{item.message}</p>
            <p className={cn(leMuted, "text-xs mt-1")}>
              {item.actor} · {new Date(item.at).toLocaleString()} · {item.type}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
