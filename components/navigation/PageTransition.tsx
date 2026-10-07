"use client";

import { usePathname, useRouter } from "next/navigation";
import { setNavigationContext } from "./navigation-context";
import { useEffect, useRef, useState } from "react";

type Direction = "forward" | "backward";

function getRouteInfo(pathname: string, search = "") {
  const clean = pathname.replace(/\/+$/, "") || "/";
  const segments = clean.split("/").filter(Boolean);
  const section = segments[0] ?? "home";
  const params = new URLSearchParams(search);

  const fromCollection =
    section === "sets" &&
    segments.length >= 3 &&
    params.get("from") === "collection";

  const sectionOrder: Record<string, number> = {
    home: 0,
    sets: 1,
    collection: 2,
    wishlist: 3,
  };

  return {
    sectionOrder: fromCollection ? sectionOrder.collection : sectionOrder[section] ?? 1,
    depth: segments.length,
  };
}

function getDirection(
  previousPath: string,
  nextPath: string,
  previousSearch = "",
  nextSearch = ""
): Direction {
  const previous = getRouteInfo(previousPath, previousSearch);
  const next = getRouteInfo(nextPath, nextSearch);

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

const transitionStyles = `
  .page-transition {
    min-height: 100%;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .page-transition-entering {
    animation-duration: 760ms;
    animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
    animation-fill-mode: both;
  }

  .page-transition-leaving {
    animation-duration: 420ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.6, 1);
    animation-fill-mode: both;
    pointer-events: none;
  }

  .page-transition-forward.page-transition-entering {
    animation-name: page-enter-from-right-controlled;
  }

  .page-transition-forward.page-transition-leaving {
    animation-name: page-leave-to-left-controlled;
  }

  .page-transition-backward.page-transition-entering {
    animation-name: page-enter-from-left-controlled;
  }

  .page-transition-backward.page-transition-leaving {
    animation-name: page-leave-to-right-controlled;
  }

  @keyframes page-enter-from-right-controlled {
    0% {
      opacity: 0;
      transform: translate3d(120px, 0, 0);
    }

    78% {
      opacity: 1;
      transform: translate3d(-8px, 0, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes page-enter-from-left-controlled {
    0% {
      opacity: 0;
      transform: translate3d(-120px, 0, 0);
    }

    78% {
      opacity: 1;
      transform: translate3d(8px, 0, 0);
    }

    100% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes page-leave-to-left-controlled {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    100% {
      opacity: 0;
      transform: translate3d(-120px, 0, 0);
    }
  }

  @keyframes page-leave-to-right-controlled {
    0% {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    100% {
      opacity: 0;
      transform: translate3d(120px, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .page-transition-entering,
    .page-transition-leaving {
      animation-duration: 1ms;
    }
  }
`;

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const previousPathname = useRef(pathname);
  const previousSearch = useRef("");
  const navigationFrame = useRef<number | null>(null);

  const [direction, setDirection] = useState<Direction>("forward");
  const [isLeaving, setIsLeaving] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    const currentSearch = window.location.search;
    const currentParams = new URLSearchParams(currentSearch);
    const currentSegments = pathname.split("/").filter(Boolean);

    setNavigationContext(
      pathname.startsWith("/sets/") &&
        currentSegments.length >= 3 &&
        currentParams.get("from") === "collection"
        ? "collection"
        : "default"
    );

    const nextDirection = getDirection(
      previousPathname.current,
      pathname,
      previousSearch.current,
      currentSearch
    );

    setDirection(nextDirection);
    setIsLeaving(false);
    setTransitionKey((current) => current + 1);

    previousPathname.current = pathname;
    previousSearch.current = currentSearch;
  }, [pathname]);

  useEffect(() => {
    previousSearch.current = window.location.search;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(event, anchor)) return;
      if (navigationFrame.current !== null) return;

      const url = new URL(anchor.href, window.location.href);
      const nextDirection = getDirection(
        pathname,
        url.pathname,
        window.location.search,
        url.search
      );
      const destination = url.pathname + url.search + url.hash;
      const nextParams = new URLSearchParams(url.search);
      const nextSegments = url.pathname.split("/").filter(Boolean);

      setNavigationContext(
        url.pathname.startsWith("/sets/") &&
          nextSegments.length >= 3 &&
          nextParams.get("from") === "collection"
          ? "collection"
          : "default"
      );

      event.preventDefault();

      setDirection(nextDirection);
      setIsLeaving(true);

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

  const transitionClass = [
    "page-transition",
    isLeaving ? "page-transition-leaving" : "page-transition-entering",
    direction === "forward"
      ? "page-transition-forward"
      : "page-transition-backward",
  ].join(" ");

  return (
    <>
      <style>{transitionStyles}</style>
      <div key={transitionKey} className={transitionClass}>
        {children}
      </div>
    </>
  );
}
