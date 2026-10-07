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

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const previousPathname = useRef(pathname);
  const pendingTransition = useRef<(() => void) | null>(null);

  const [direction, setDirection] = useState<Direction>("forward");
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    const nextDirection = getDirection(previousPathname.current, pathname);

    setDirection(nextDirection);
    document.documentElement.dataset.transitionDirection = nextDirection;

    previousPathname.current = pathname;
    setTransitionKey((current) => current + 1);

    pendingTransition.current?.();
    pendingTransition.current = null;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(event, anchor)) return;

      const url = new URL(anchor.href, window.location.href);
      const nextDirection = getDirection(pathname, url.pathname);

      event.preventDefault();

      setDirection(nextDirection);
      document.documentElement.dataset.transitionDirection = nextDirection;

      const startTransition = (
        document as Document & {
          startViewTransition?: (
            callback: () => void | Promise<void>
          ) => { finished: Promise<void> };
        }
      ).startViewTransition;

      const destination = `${url.pathname}${url.search}${url.hash}`;

      if (!startTransition) {
        router.push(destination);
        return;
      }

      startTransition(() => {
        router.push(destination);

        return new Promise<void>((resolve) => {
          pendingTransition.current = resolve;
        });
      });
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [pathname, router]);

  return (
    <div key={transitionKey} className="page-transition">
      {children}
    </div>
  );
}
