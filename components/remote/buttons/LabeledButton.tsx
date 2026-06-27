"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface LabeledButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function LabeledButton({ label, icon: Icon, onClick, className }: LabeledButtonProps) {
  return (
    <RemoteButton onClick={onClick} className={cn("flex-col text-xs", className)}>
    {Icon && <Icon className="w-5 h-5 mb-1" />}
    <span>{label}</span>
    </RemoteButton>
  );
}
