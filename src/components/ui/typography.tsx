import * as React from "react";
import { cn } from "@/lib/utils";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl font-extrabold tracking-tight text-secondary sm:text-4xl lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({ children, className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold tracking-tight text-secondary sm:text-3xl",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({ children, className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        "text-lg font-bold tracking-tight text-secondary sm:text-xl",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Lead({ children, className, ...props }: TypographyProps) {
  return (
    <p
      className={cn(
        "text-base sm:text-lg text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Paragraph({ children, className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("text-sm sm:text-base text-secondary/85 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function Caption({ children, className, ...props }: TypographyProps) {
  return (
    <span
      className={cn("text-xs text-muted-foreground font-medium", className)}
      {...props}
    >
      {children}
    </span>
  );
}
