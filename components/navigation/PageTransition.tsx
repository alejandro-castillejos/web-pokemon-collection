"use client";

import { usePathname } from "next/navigation";
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

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const [direction, setDirection] = useState<Direction>("forward");
  const [transitionKey, setTransitionKey] = useState(0);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    setDirection(getDirection(previousPathname.current, pathname));
    previousPathname.current = pathname;
    setTransitionKey((current) => current + 1);
  }, [pathname]);

  return (
    <div
      key={transitionKey}
      className={`page-transition page-transition-${direction}`}
    >
      {children}
    </div>
  );
}
