"use client";

import { ChevronUp, ChevronDown, VolumeX } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMute?: () => void;
  className?: string;
}

export function VolumeControl({ onVolumeUp, onVolumeDown, onMute, className }: VolumeControlProps) {
  return (
    <div className={cn("flex flex-col items-center gap-0.5 h-full", className)}>
    <RemoteButton onClick={onVolumeUp} aria-label="Volume Up" className="rounded-b-none"><ChevronUp /></RemoteButton>
    <RemoteButton onClick={onMute} aria-label="Mute" className="rounded-none"><VolumeX /></RemoteButton>
    <RemoteButton onClick={onVolumeDown} aria-label="Volume Down" className="rounded-t-none"><ChevronDown /></RemoteButton>
    </div>
  );
}
