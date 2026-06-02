"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Outer element (track): explicit WHITE border so the control stays
        // visible on the dark, semi-transparent form background.
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-white shadow-xs transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:bg-primary data-[unchecked]:bg-transparent",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Inner element (thumb): white fill + BLACK border so it reads clearly
          // against both the white track border and the checked (primary) fill.
          "pointer-events-none block size-4 rounded-full bg-white border border-black ring-0 shadow-sm transition-transform data-[checked]:translate-x-4 data-[unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
