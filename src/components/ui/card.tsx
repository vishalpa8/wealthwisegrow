import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    hover?: boolean;
    variant?: "default" | "elevated" | "outlined" | "glass";
  }
>(({ className, hover = false, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "card",
    elevated: "card bg-white shadow-large border-0",
    outlined: "card border-2 border-neutral-200 shadow-none",
    glass: "glass-card",
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        variantClasses[variant],
        hover && "card-hover",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-header", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-neutral-900", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-600 mt-2 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-content", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-footer", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };