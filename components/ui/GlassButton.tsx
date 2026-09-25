import Link from "next/link";

interface GlassButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "glass" | "primary";
  className?: string;
}

export default function GlassButton({
  children,
  href,
  variant = "glass",
  className = "",
}: GlassButtonProps) {
  const styles =
    variant === "primary"
      ? "yellow-button"
      : "glass-hover glass";

  const classes = `
    inline-flex
    items-center
    justify-center
    rounded-full
    px-6
    py-3.5
    text-sm
    font-semibold
    ${styles}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes}>
      {children}
    </button>
  );
}