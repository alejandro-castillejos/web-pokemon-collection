let context: "default" | "collection" = "default";
const listeners = new Set<() => void>();

export function subscribeNavigationContext(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getNavigationContext() {
  return context;
}

export function getServerNavigationContext() {
  return "default" as const;
}

export function setNavigationContext(nextContext: "default" | "collection") {
  if (context === nextContext) return;

  context = nextContext;

  for (const listener of listeners) {
    listener();
  }
}
