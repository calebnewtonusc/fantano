"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface ScrollNavProps {
  /** When set, shows a back-to-home arrow + this label. Otherwise shows the Fantano wordmark. */
  back?: string;
}

export function ScrollNav({ back }: ScrollNavProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const nearBottom = y + winH >= docH - 200;
      setVisible(y > 80 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-xl"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex h-11 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium tracking-[-0.01em] text-white transition hover:text-white/80"
        >
          {back ? (
            <>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {back}
            </>
          ) : (
            "Fantano"
          )}
        </Link>
        <div className="flex items-center gap-6 text-[12px] font-normal text-white/70">
          <Link href="/random" className="transition hover:text-white">
            Random
          </Link>
          <a
            href="https://www.youtube.com/theneedledrop"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            Source
          </a>
          <a
            href="https://github.com/calebnewtonusc/fantano"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}
