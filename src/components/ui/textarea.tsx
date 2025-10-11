import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "flex field-sizing-content min-h-24 w-full rounded-lg border px-4 py-3 text-base",
        "bg-white/50 dark:bg-white/5 backdrop-blur-sm",
        "border-gray-200/60 dark:border-white/10",
        "transition-all duration-300 outline-none",
        "hover:border-[#C8A963]/40 dark:hover:border-[#C8A963]/30 hover:bg-white/80 dark:hover:bg-white/10",
        "focus-visible:border-[#0C2340] dark:focus-visible:border-[#C8A963]",
        "focus-visible:ring-4 focus-visible:ring-[#0C2340]/10 dark:focus-visible:ring-[#C8A963]/20",
        "focus-visible:bg-white dark:focus-visible:bg-white/10",
        "focus-visible:shadow-lg focus-visible:shadow-[#0C2340]/5 dark:focus-visible:shadow-[#C8A963]/10",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
