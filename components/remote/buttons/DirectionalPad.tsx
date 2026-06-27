"use client";

import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface DirectionalPadProps {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onCenter?: () => void;
  className?: string;
}

export function DirectionalPad({ onUp, onDown, onLeft, onRight, onCenter, className }: DirectionalPadProps) {
  return (
    <div className={cn("grid grid-cols-3 grid-rows-3 gap-0.5 w-full h-full", className)}>
    <div className="col-start-2 row-start-1">
    <RemoteButton onClick={onUp} className="rounded-b-none"><ChevronUp /></RemoteButton>
    </div>
    <div className="col-start-1 row-start-2">
    <RemoteButton onClick={onLeft} className="rounded-r-none"><ChevronLeft /></RemoteButton>
    </div>
    <div className="col-start-2 row-start-2">
    <RemoteButton onClick={onCenter} className="rounded-none font-bold">OK</RemoteButton>
    </div>
    <div className="col-start-3 row-start-2">
    <RemoteButton onClick={onRight} className="rounded-l-none"><ChevronRight /></RemoteButton>
    </div>
    <div className="col-start-2 row-start-3">
    <RemoteButton onClick={onDown} className="rounded-t-none"><ChevronDown /></RemoteButton>
    </div>
    </div>
  );
}
