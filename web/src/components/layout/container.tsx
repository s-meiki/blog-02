import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

export const Container = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn("mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8", className)}>
    {children}
  </div>
);
