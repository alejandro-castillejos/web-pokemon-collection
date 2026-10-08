"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Direction = "forward" | "backward";

function getRouteInfo(pathname: string) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  const section = segments[0] ?? "home";

  const sectionOrder: Record<string, number> = {
    home: 0,
    sets: 1,
    collection: 2,
    wishlist: 3,
  };

  return {
    sectionOrder: sectionOrder[section] ?? 1,
    depth: segments.length,
  };
}

function getDirection(previousPath: string, nextPath: string): Direction {
  const previous = getRouteInfo(previousPath);
  const next = getRouteInfo(nextPath);

  if (previous.sectionOrder !== next.sectionOrder) {
    return next.sectionOrder > previous.sectionOrder ? "forward" : "backward";
  }

  if (previous.depth !== next.depth) {
    return next.depth > previous.depth ? "forward" : "backward";
  }

  return "forward";
}

function isInternalNavigation(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);

  return (
    url.origin === window.location.origin &&
    url.pathname !== window.location.pathname
  );
}

const transitionStyles = [
  ".page-transition { position: relative; min-height: 100%; }",
  ".page-transition-content { min-height: 100%; will-change: transform, opacity; backface-visibility: hidden; }",
  ".page-transition-content.reveal-forward { animation: page-reveal-forward 520ms cubic-bezier(0.22,1,0.36,1) both; }",
  ".page-transition-content.reveal-backward { animation: page-reveal-backward 520ms cubic-bezier(0.22,1,0.36,1) both; }",
  "@keyframes page-reveal-forward { from { opacity: 0; transform: translate3d(72px,0,0); } to { opacity: 1; transform: translate3d(0,0,0); } }",
  "@keyframes page-reveal-backward { from { opacity: 0; transform: translate3d(-72px,0,0); } to { opacity: 1; transform: translate3d(0,0,0); } }",
  "@media (prefers-reduced-motion: reduce) { .page-transition-content.reveal-forward, .page-transition-content.reveal-backward { animation-duration: 1ms; } }",
].join("\n");

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const previousPathname = useRef(pathname);
  const navigationFrame = useRef<number | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [direction, setDirection] = useState<Direction>("forward");
  const [isRevealing, setIsRevealing] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    const nextDirection = getDirection(previousPathname.current, pathname);
    setDirection(nextDirection);
    setTransitionKey((value) => value + 1);
    setIsRevealing(true);

    if (revealTimer.current !== null) clearTimeout(revealTimer.current);

    revealTimer.current = setTimeout(() => {
      setIsRevealing(false);
      revealTimer.current = null;
    }, 530);

    previousPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(event, anchor)) return;
      if (navigationFrame.current !== null) return;

      const url = new URL(anchor.href, window.location.href);
      const nextDirection = getDirection(pathname, url.pathname);
      const destination = url.pathname + url.search + url.hash;

      event.preventDefault();
      setDirection(nextDirection);
      router.prefetch(destination);

      navigationFrame.current = requestAnimationFrame(() => {
        navigationFrame.current = requestAnimationFrame(() => {
          navigationFrame.current = null;
          router.push(destination);
        });
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      if (navigationFrame.current !== null) {
        cancelAnimationFrame(navigationFrame.current);
        navigationFrame.current = null;
      }
    };
  }, [pathname, router]);

  const revealClass = isRevealing
    ? direction === "forward"
      ? "reveal-forward"
      : "reveal-backward"
    : "";

  return (
    <>
      <style>{transitionStyles}</style>
      <div className="page-transition">
        <div
          key={transitionKey}
          className={`page-transition-content ${revealClass}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}