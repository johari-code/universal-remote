"use client";

import { LabeledButton } from "./LabeledButton";
import {
  Wind,
  Droplets,
  Timer,
  Sun,
  Moon,
  Zap,
  Wifi,
  Bluetooth,
} from "lucide-react";

interface CustomButtonsProps {
  buttons: Array<{
    label: string;
    icon?:
      | "wind"
      | "droplets"
      | "timer"
      | "sun"
      | "moon"
      | "zap"
      | "wifi"
      | "bluetooth"
      | null;
    onClick?: () => void;
  }>;
}

const iconMap = {
  wind: Wind,
  droplets: Droplets,
  timer: Timer,
  sun: Sun,
  moon: Moon,
  zap: Zap,
  wifi: Wifi,
  bluetooth: Bluetooth,
};

export function CustomButtons({ buttons }: CustomButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {buttons.map((button, index) => (
        <LabeledButton
          key={index}
          label={button.label}
          icon={button.icon ? iconMap[button.icon] : undefined}
          onClick={button.onClick}
          variant="rounded"
          size="md"
          labelPosition={button.icon ? "bottom" : "inside"}
        />
      ))}
    </div>
  );
}
