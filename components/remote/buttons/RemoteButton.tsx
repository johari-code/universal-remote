"use client"

import React from "react";
import { cn } from "@/lib/utils";

interface RemoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "power" | "color" | "flat";
  active?: boolean;
  children: React.ReactNode;
}

export const RemoteButton = React.forwardRef<HTMLButtonElement, RemoteButtonProps>(
  ({ className, variant = "default", active = false, children, ...props }, ref) => {
    const baseStyles =
    "relative w-full h-full transition-all duration-200 flex items-center justify-center font-medium focus:outline-none active:scale-95 shadow-inner shadow-black/20 border-t border-white/5";

  const variants = {
    default: "bg-gray-700/50 hover:bg-gray-700/80 text-gray-100 rounded-lg",
      power: "bg-gray-700/50 hover:bg-red-600 text-white rounded-lg",
      color: "rounded-lg",
      flat: "bg-transparent hover:bg-gray-700/50 text-gray-200 rounded-lg shadow-none border-none",
  };

  return (
    <button
    ref={ref}
    className={cn(
      baseStyles,
      variants[variant],
      active && "ring-2 ring-blue-500 bg-gray-700",
      className,
    )}
    {...props}
    >
    <span className="relative z-10">{children}</span>
    </button>
  );
  },
);

RemoteButton.displayName = "RemoteButton";
