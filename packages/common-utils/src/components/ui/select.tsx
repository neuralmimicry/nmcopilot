import { forwardRef } from "react";
import {
  Root as SelectPrimitiveRoot,
  Group as SelectPrimitiveGroup,
  Value as SelectPrimitiveValue,
  Trigger as SelectPrimitiveTrigger,
  Content as SelectPrimitiveContent,
  Label as SelectPrimitiveLabel,
  Item as SelectPrimitiveItem,
  ItemIndicator as SelectPrimitiveItemIndicator,
  ItemText as SelectPrimitiveItemText,
  Viewport as SelectPrimitiveViewport,
  Separator as SelectPrimitiveSeparator,
  Portal as SelectPrimitivePortal,
} from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";

const Select = SelectPrimitiveRoot;
const SelectGroup = SelectPrimitiveGroup;
const SelectValue = SelectPrimitiveValue;

const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitiveTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveTrigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitiveTrigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </SelectPrimitiveTrigger>
));
SelectTrigger.displayName = SelectPrimitiveTrigger.displayName;

const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitiveContent>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveContent>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitivePortal>
    <SelectPrimitiveContent
      ref={ref}
      className={cn(
        "animate-in fade-in-80 relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-100 bg-white text-slate-700 shadow-md",
        className,
      )}
      {...props}
    >
      <SelectPrimitiveViewport className="p-1">
        {children}
      </SelectPrimitiveViewport>
    </SelectPrimitiveContent>
  </SelectPrimitivePortal>
));
SelectContent.displayName = SelectPrimitiveContent.displayName;

const SelectLabel = forwardRef<
  React.ElementRef<typeof SelectPrimitiveLabel>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveLabel>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveLabel
    ref={ref}
    className={cn(
      "py-1.5 pr-2 pl-8 text-sm font-semibold text-slate-900",
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitiveLabel.displayName;

const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitiveItem>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveItem>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitiveItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm font-medium outline-none focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitiveItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitiveItemIndicator>
    </span>

    <SelectPrimitiveItemText>{children}</SelectPrimitiveItemText>
  </SelectPrimitiveItem>
));
SelectItem.displayName = SelectPrimitiveItem.displayName;

const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitiveSeparator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitiveSeparator>
>(({ className, ...props }, ref) => (
  <SelectPrimitiveSeparator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-slate-100", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitiveSeparator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
