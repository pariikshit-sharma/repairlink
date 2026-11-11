import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border border-primary/20",
        primarySolid:
          "bg-primary text-white",
        secondary:
          "bg-secondary/10 text-secondary border border-secondary/20",
        secondarySolid:
          "bg-secondary text-white",
        accent:
          "bg-accent text-accent-foreground border border-emerald-200 font-semibold",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        error:
          "bg-rose-50 text-rose-700 border border-rose-200",
        destructive:
          "bg-rose-50 text-rose-700 border border-rose-200",
        outline:
          "border border-slate-300 text-secondary bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
