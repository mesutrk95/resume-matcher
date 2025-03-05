import { ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import React from "react";

const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { loading?: boolean; loadingText?: string }
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {" "}
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />{" "}
            {loadingText || props.children}
          </div>
        ) : (
          props.children
        )}
      </Comp>
    );
  }
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
