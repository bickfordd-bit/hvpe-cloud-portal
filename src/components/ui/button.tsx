import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white text-black hover:bg-neutral-200",
      secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
      outline: "border border-neutral-700 bg-transparent hover:bg-neutral-900",
      ghost: "bg-transparent hover:bg-neutral-900",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizeStyles = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
