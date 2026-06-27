"use client"

import { Power } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface PowerButtonProps {
  isOn?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PowerButton({
  isOn = false,
  onClick,
  className,
}: PowerButtonProps) {
  return (
    <RemoteButton
      variant="power"
      size="lg"
      onClick={onClick}
      className={cn("group", isOn && "hover:bg-red-600", className)}
    >
      <Power
        className={cn(
          "w-6 h-6 transition-colors",
          isOn ? "text-red-500 group-hover:text-white" : "text-gray-300",
        )}
      />
    </RemoteButton>
  );
}
