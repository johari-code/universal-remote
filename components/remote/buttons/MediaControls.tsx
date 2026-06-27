"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Circle,
} from "lucide-react";
import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface MediaControlsProps {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onRecord?: () => void;
  className?: string;
  variant?: "default" | "flat";
}

export function MediaControls({
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onRecord,
  className,
  variant = "flat",
}: MediaControlsProps) {
  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <RemoteButton
        variant={variant}
        size="md" // Changed from 'sm' to 'md'
        onClick={onPrevious}
      >
        <SkipBack className="w-5 h-5" />
      </RemoteButton>

      <RemoteButton variant={variant} size="md" onClick={onPlay}>
        <Play className="w-5 h-5" />
      </RemoteButton>

      <RemoteButton variant={variant} size="md" onClick={onPause}>
        <Pause className="w-5 h-5" />
      </RemoteButton>

      <RemoteButton variant={variant} size="md" onClick={onStop}>
        <Square className="w-5 h-5" />
      </RemoteButton>

      <RemoteButton
        variant={variant}
        size="md" // Changed from 'sm' to 'md'
        onClick={onNext}
      >
        <SkipForward className="w-5 h-5" />
      </RemoteButton>

      {onRecord && (
        <RemoteButton
          variant={variant}
          size="md"
          onClick={onRecord}
          className="text-red-500"
        >
          <Circle className="w-5 h-5 fill-current" />
        </RemoteButton>
      )}
    </div>
  );
}
