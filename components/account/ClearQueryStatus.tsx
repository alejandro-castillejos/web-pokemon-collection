"use client";

import { useEffect } from "react";

export default function ClearQueryStatus({
  status,
}: {
  status?: string;
}) {
  useEffect(() => {
    if (!status) return;

    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname
    );
  }, [status]);

  return null;
}
