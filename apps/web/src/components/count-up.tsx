"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

/** Animates from 0 -> value when scrolled into view, once. */
export function CountUp({
  value,
  durationMs = 1100,
  format = (n) => Math.round(n).toLocaleString(),
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const elRef = useRef<HTMLSpanElement | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRun.current) {
            hasRun.current = true;
            const start = performance.now();
            const ease = (t: number) => 1 - Math.pow(1 - t, 3);
            const step = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs);
              setDisplay(value * ease(t));
              if (t < 1) requestAnimationFrame(step);
              else setDisplay(value);
            };
            requestAnimationFrame(step);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={elRef} className={className}>
      {format(display)}
    </span>
  );
}
