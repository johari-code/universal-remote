"use client";

import { RemoteButton } from "./RemoteButton";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberPress?: (number: string) => void;
  className?: string;
}

export function NumberPad({ onNumberPress, className }: NumberPadProps) {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {numbers.map((num) => (
        <RemoteButton
          key={num}
          variant="rounded"
          size="md"
          onClick={() => onNumberPress?.(num)}
          className="font-semibold text-lg"
        >
          {num}
        </RemoteButton>
      ))}
    </div>
  );
}
