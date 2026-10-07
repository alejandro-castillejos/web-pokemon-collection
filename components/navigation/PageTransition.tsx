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

const transitionStyles = `
  .page-transition {
    min-height: 100%;
    will-change: transform, opacity;
    backface-visibility: hidden;
  }

  .page-transition-entering {
    animation-duration: 520ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    animation-fill-mode: both;
  }

  .page-transition-leaving {
    animation-duration: 280ms;
    animation-timing-function: cubic-bezier(0.4, 0, 1, 1);
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
    from {
      opacity: 0;
      transform: translate3d(72px, 0, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes page-enter-from-left-controlled {
    from {
      opacity: 0;
      transform: translate3d(-72px, 0, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @keyframes page-leave-to-left-controlled {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    to {
      opacity: 0;
      transform: translate3d(-32px, 0, 0);
    }
  }

  @keyframes page-leave-to-right-controlled {
    from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    to {
      opacity: 0;
      transform: translate3d(32px, 0, 0);
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
  const navigationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [direction, setDirection] = useState<Direction>("forward");
  const [isLeaving, setIsLeaving] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    const nextDirection = getDirection(previousPathname.current, pathname);

    setDirection(nextDirection);
    setIsLeaving(false);
    setTransitionKey((current) => current + 1);

    previousPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");

      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalNavigation(event, anchor)) return;
      if (navigationTimeout.current) return;

      const url = new URL(anchor.href, window.location.href);
      const nextDirection = getDirection(pathname, url.pathname);
      const destination = url.pathname + url.search + url.hash;

      event.preventDefault();

      setDirection(nextDirection);
      setIsLeaving(true);

      navigationTimeout.current = setTimeout(() => {
        navigationTimeout.current = null;
        router.push(destination);
      }, 280);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);

      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
        navigationTimeout.current = null;
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
