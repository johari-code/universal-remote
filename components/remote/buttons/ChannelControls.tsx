"use client";

import { ChevronUp, ChevronDown, List } from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface ChannelControlsProps {
  onChannelUp?: () => void;
  onChannelDown?: () => void;
  onChannelList?: () => void;
  className?: string;
}

export function ChannelControls({ onChannelUp, onChannelDown, onChannelList, className }: ChannelControlsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-0.5 h-full", className)}>
    <RemoteButton onClick={onChannelUp} aria-label="Channel Up" className="rounded-b-none"><ChevronUp /></RemoteButton>
    <RemoteButton onClick={onChannelList} aria-label="Channel List" className="rounded-none"><List /></RemoteButton>
    <RemoteButton onClick={onChannelDown} aria-label="Channel Down" className="rounded-t-none"><ChevronDown /></RemoteButton>
    </div>
  );
}
