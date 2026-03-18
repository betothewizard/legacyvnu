import { useEffect } from "react";
import { cn } from "~/src/lib/utils";

const AD_CLIENT = "ca-pub-2669549342761819";

type AdProps = {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
};

export function Ad({ slot, format = "auto", className }: AdProps) {
  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is injected by Google
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle may not be loaded yet; safe to ignore
    }
  }, []);

  return (
    <ins
      className={cn("adsbygoogle block", className)}
      data-ad-client={AD_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}

// Convenience wrappers for common placements
export function AdLeaderboard({ className }: { className?: string }) {
  // 728x90 leaderboard — top banner
  return (
    <Ad
      slot="SLOT_LEADERBOARD"
      format="horizontal"
      className={cn("min-h-[90px]", className)}
    />
  );
}

export function AdRectangle({ className }: { className?: string }) {
  // 300x250 medium rectangle — sidebar
  return (
    <Ad
      slot="SLOT_RECTANGLE"
      format="rectangle"
      className={cn("min-h-[250px]", className)}
    />
  );
}

export function AdInList({ className }: { className?: string }) {
  // In-list ad between cards
  return (
    <Ad
      slot="SLOT_INLIST"
      format="auto"
      className={cn("min-h-[90px]", className)}
    />
  );
}
