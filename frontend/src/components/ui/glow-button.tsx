import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ComponentProps {
  label?: string;
  onClick?(): void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export const GlowButton = forwardRef<HTMLButtonElement, ComponentProps>(
  (
    { label = "Generate", onClick, className, type = "button", disabled },
    ref,
  ) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
      onClick?.();
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        disabled={disabled}
        className={cn("glow-btn", className)}
        onClick={handleClick}
        data-state={isClicked ? "clicked" : undefined}
      >
        <span className="flex items-center justify-center">{label}</span>
      </button>
    );
  },
);

GlowButton.displayName = "GlowButton";
