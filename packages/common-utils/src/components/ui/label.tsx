import { Root as LabelPrimitiveRoot } from "@radix-ui/react-label";
import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitiveRoot>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitiveRoot>
>(({ className, ...props }, ref) => (
  <LabelPrimitiveRoot
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitiveRoot.displayName;

export { Label };
