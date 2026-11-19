import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#06B6D4]/15 text-[#4CD7F6] border-[#06B6D4]/30",
        clinical:
          "border-transparent bg-[#a78bfa]/15 text-[#c4b5fd] border-[#a78bfa]/30",
        secondary:
          "border-transparent bg-[#1E293B] text-[#94A3B8]",
        destructive:
          "border-transparent bg-[#F43F5E]/15 text-[#FB7185] border-[#F43F5E]/30",
        success:
          "border-transparent bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30",
        outline: "text-[#F8FAFC] border-[#334155]",
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

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
