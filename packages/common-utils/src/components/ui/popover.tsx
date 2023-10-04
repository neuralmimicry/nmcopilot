import {
  Root as PopoverPrimitiveRoot,
  Trigger as PopoverPrimitiveTrigger,
  Content as PopoverPrimitiveContent,
  Portal as PopoverPrimitivePortal,
} from "@radix-ui/react-popover";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Popover = PopoverPrimitiveRoot;
const PopoverTrigger = PopoverPrimitiveTrigger;

const PopoverContent = forwardRef<
  React.ElementRef<typeof PopoverPrimitiveContent>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitiveContent>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitivePortal>
    <PopoverPrimitiveContent
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 z-50 w-72 rounded-md border border-slate-100 bg-white p-4 shadow-md outline-none",
        className,
      )}
      {...props}
    />
  </PopoverPrimitivePortal>
));
PopoverContent.displayName = PopoverPrimitiveContent.displayName;

export { Popover, PopoverTrigger, PopoverContent };
