import { Root, Trigger, Content } from "@radix-ui/react-hover-card";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const HoverCard = Root;

const HoverCardTrigger = Trigger;

const HoverCardContent = forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "animate-in zoom-in-90 z-50 w-64 rounded-md border border-slate-100 bg-white p-4 shadow-md outline-none",
      className
    )}
    {...props}
  />
));

HoverCardContent.displayName = Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
