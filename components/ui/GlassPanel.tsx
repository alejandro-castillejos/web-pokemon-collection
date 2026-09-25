interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  strong = false,
}: GlassPanelProps) {
  return (
    <div
      className={`${strong ? "glass-strong" : "glass"} ${className}`}
    >
      {children}
    </div>
  );
}