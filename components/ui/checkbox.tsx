"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Outer element: explicit WHITE border so the box stays visible on the
        // dark, semi-transparent form background (border-input blended in).
        "peer size-4 shrink-0 rounded-[4px] border border-white bg-transparent shadow-xs transition-shadow outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-white data-[checked]:text-black aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        // Inner element (shown when checked): BLACK border + black check so the
        // filled state reads clearly against the white outer border / fill.
        className="flex size-full items-center justify-center rounded-[3px] border border-black text-black"
      >
        <CheckIcon className="size-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
