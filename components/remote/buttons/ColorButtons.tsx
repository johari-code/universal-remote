"use client"

import { RemoteButton } from "./RemoteButton";

interface ColorButtonsProps {
  onRed?: () => void;
  onGreen?: () => void;
  onYellow?: () => void;
  onBlue?: () => void;
}

export function ColorButtons({
  onRed,
  onGreen,
  onYellow,
  onBlue,
}: ColorButtonsProps) {
  return (
    <div className="flex space-x-2">
      <RemoteButton
        variant="color"
        size="sm"
        onClick={onRed}
        className="bg-red-600 hover:bg-red-500"
        aria-label="Red button"
      >
        <span className="sr-only">Red</span>
      </RemoteButton>

      <RemoteButton
        variant="color"
        size="sm"
        onClick={onGreen}
        className="bg-green-600 hover:bg-green-500"
        aria-label="Green button"
      >
        <span className="sr-only">Green</span>
      </RemoteButton>

      <RemoteButton
        variant="color"
        size="sm"
        onClick={onYellow}
        className="bg-yellow-500 hover:bg-yellow-400"
        aria-label="Yellow button"
      >
        <span className="sr-only">Yellow</span>
      </RemoteButton>

      <RemoteButton
        variant="color"
        size="sm"
        onClick={onBlue}
        className="bg-blue-600 hover:bg-blue-500"
        aria-label="Blue button"
      >
        <span className="sr-only">Blue</span>
      </RemoteButton>
    </div>
  );
}
