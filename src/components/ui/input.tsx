import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "flex h-11 w-full min-w-0 rounded-lg border px-4 py-2.5 text-base",
        "bg-white/50 dark:bg-white/5 backdrop-blur-sm",
        "border-gray-200/60 dark:border-white/10",
        "transition-all duration-300 outline-none",
        "hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 hover:bg-white/80 dark:hover:bg-white/10",
        "focus-visible:border-[#0C2340] dark:focus-visible:border-[#C8A963]",
        "focus-visible:ring-4 focus-visible:ring-[#0C2340]/10 dark:focus-visible:ring-[#C8A963]/20",
        "focus-visible:bg-white dark:focus-visible:bg-white/10",
        "focus-visible:shadow-lg focus-visible:shadow-[#0C2340]/5 dark:focus-visible:shadow-[#C8A963]/10",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
