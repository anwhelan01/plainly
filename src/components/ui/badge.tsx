import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        slop: "bg-mark-soft text-mark",
        style: "bg-warn/15 text-warn",
        nit: "bg-ink/8 text-muted",
        ink: "bg-ink text-paper-raised",
        outline: "shadow-[var(--shadow-border)] text-ink-soft bg-paper-raised",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
