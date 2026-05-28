"use client";

import { Search, Sparkles, Shuffle, Music2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const QUICK_PROMPTS = [
  {
    icon: Sparkles,
    label: "Give me 100 folk songs",
    route: "?q=100%20folk%20songs",
  },
  {
    icon: Sparkles,
    label: "Best hip hop of 2014",
    route: "?q=best%20hip%20hop%20of%202014",
  },
  { icon: Sparkles, label: "Recent shoegaze", route: "?q=recent%20shoegaze" },
  {
    icon: Sparkles,
    label: "Cloud rap from the 2010s",
    route: "?q=cloud%20rap%20from%20the%202010s",
  },
  { icon: Shuffle, label: "Random track", route: "/random" },
];

const QUICK_BROWSE = [
  {
    icon: Music2,
    label: "Browse Kendrick Lamar",
    route: "/artist/kendrick-lamar",
  },
  { icon: Music2, label: "Browse hip hop", route: "/genre/hip%20hop" },
  { icon: Calendar, label: "Browse 2024", route: "/year/2024" },
  { icon: Calendar, label: "Browse 2014", route: "/year/2014" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const closePalette = () => {
    setOpen(false);
    setQuery("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
      } else if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const allItems = [
    ...QUICK_PROMPTS.map((p) => ({ ...p, kind: "prompt" as const })),
    ...QUICK_BROWSE.map((p) => ({ ...p, kind: "browse" as const })),
  ];

  const filtered = query
    ? allItems.filter((i) =>
        i.label.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  const handleSelect = (route: string) => {
    closePalette();
    if (route.startsWith("?q=")) {
      router.push(`/${route}`);
    } else {
      router.push(route);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    closePalette();
    router.push(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={closePalette}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[15vh] backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="reveal-up w-full max-w-2xl overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#1d1d1f] shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="relative">
          <Search
            className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-white/40"
            aria-hidden="true"
          />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or ask for songs..."
            className="h-14 w-full bg-transparent pl-12 pr-12 text-[17px] text-white placeholder:text-white/40 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-white/40">
            ESC
          </kbd>
        </form>

        <div className="max-h-[50vh] overflow-y-auto border-t border-white/[0.06] p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[14px] text-white/60">
                Press Enter to search:{" "}
                <span className="font-medium text-white">{query}</span>
              </p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.route)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] text-white/85 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <Icon
                        className="h-4 w-4 text-white/50"
                        aria-hidden="true"
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-white/30">
                        {item.kind}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] text-white/30">
          <span>Cmd+K to toggle</span>
          <span>Enter to search</span>
        </div>
      </div>
    </div>
  );
}
