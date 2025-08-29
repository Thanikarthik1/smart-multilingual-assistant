import * as React from "react";

import { cn } from "@/lib/utils";

// Avatar container
const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

// Avatar image
const AvatarImage = ({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={cn("h-full w-full object-cover", className)}
  />
);

// Fallback initials (like U or AI)
const AvatarFallback = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn("text-sm font-medium text-muted-foreground", className)}
  >
    {children}
  </span>
);

export { Avatar, AvatarImage, AvatarFallback };
