"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Power,
  Home,
  Menu,
  Settings,
  Mic,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Type,
  Navigation,
  Sliders,
  PlayCircle,
  Hash,
  Palette,
  PenTool,
  Volume2,
  MonitorSpeaker,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentItem {
  id: string;
  type: string;
  label: string;
  category: string;
  colSpan?: number;
  rowSpan?: number;
  component: React.ReactNode;
  shape?: { x: number; y: number }[];
}

const components: ComponentItem[] = [
  // System
  {
    id: "power",
    type: "power",
    label: "Power",
    category: "System",
    component: (
      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
        <Power className="w-4 h-4 text-white" />
      </div>
    ),
  },
  {
    id: "home",
    type: "home",
    label: "Home",
    category: "System",
    component: <Home className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "menu",
    type: "menu",
    label: "Menu",
    category: "System",
    component: <Menu className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "settings",
    type: "settings",
    label: "Settings",
    category: "System",
    component: <Settings className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "voice",
    type: "voice",
    label: "Voice",
    category: "System",
    component: <Mic className="w-5 h-5 text-zinc-400" />,
  },

  // Navigation
  {
    id: "dpad",
    type: "dpad",
    label: "D-Pad",
    category: "Navigation",
    colSpan: 3,
    rowSpan: 3,
    component: <Navigation className="w-5 h-5 text-zinc-400" />,
    shape: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
  },

  // Controls
  {
    id: "volume",
    type: "volume",
    label: "Volume",
    category: "Controls",
    colSpan: 1,
    rowSpan: 3,
    component: <Volume2 className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "channel",
    type: "channel",
    label: "Channel",
    category: "Controls",
    colSpan: 1,
    rowSpan: 3,
    component: <MonitorSpeaker className="w-5 h-5 text-zinc-400" />,
  },

  // Media Controls
  {
    id: "play",
    type: "play",
    label: "Play",
    category: "Media",
    component: <Play className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "pause",
    type: "pause",
    label: "Pause",
    category: "Media",
    component: <Pause className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "stop",
    type: "stop",
    label: "Stop",
    category: "Media",
    component: <Square className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "next",
    type: "next",
    label: "Next",
    category: "Media",
    component: <SkipForward className="w-5 h-5 text-zinc-400" />,
  },
  {
    id: "prev",
    type: "prev",
    label: "Previous",
    category: "Media",
    component: <SkipBack className="w-5 h-5 text-zinc-400" />,
  },

  // Numeric Pad
  ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((n) => ({
    id: `num-${n}`,
    type: `num-${n}`,
    label: n,
    category: "Numeric",
    component: <span className="text-lg font-medium text-zinc-400">{n}</span>,
  })),
  {
    id: "num-star",
    type: "num-star",
    label: "*",
    category: "Numeric",
    component: <span className="text-lg font-medium text-zinc-400">*</span>,
  },
  {
    id: "num-hash",
    type: "num-hash",
    label: "#",
    category: "Numeric",
    component: <span className="text-lg font-medium text-zinc-400">#</span>,
  },

  // Color Buttons
  {
    id: "red-btn",
    type: "red-btn",
    label: "Red",
    category: "Special",
    component: (
      <div className="w-8 h-8 bg-red-600 rounded border border-red-500" />
    ),
  },
  {
    id: "green-btn",
    type: "green-btn",
    label: "Green",
    category: "Special",
    component: (
      <div className="w-8 h-8 bg-green-600 rounded border border-green-500" />
    ),
  },
  {
    id: "yellow-btn",
    type: "yellow-btn",
    label: "Yellow",
    category: "Special",
    component: (
      <div className="w-8 h-8 bg-yellow-500 rounded border border-yellow-400" />
    ),
  },
  {
    id: "blue-btn",
    type: "blue-btn",
    label: "Blue",
    category: "Special",
    component: (
      <div className="w-8 h-8 bg-blue-600 rounded border border-blue-500" />
    ),
  },

  // Custom
  {
    id: "custom-text",
    type: "custom-text",
    label: "Custom",
    category: "Custom",
    component: <Type className="w-5 h-5 text-zinc-400" />,
  },
];

const categoryIcons: { [key: string]: React.ElementType } = {
  System: Power,
  Navigation: Navigation,
  Controls: Sliders,
  Media: PlayCircle,
  Numeric: Hash,
  Special: Palette,
  Custom: PenTool,
};

interface ComponentDrawerProps {
  isOpen?: boolean;
}

export function ComponentDrawer({ isOpen = true }: ComponentDrawerProps = {}) {
  const categories = Array.from(new Set(components.map((c) => c.category)));

  return (
    <div
      className={cn(
        "fixed left-0 top-[120px] h-[calc(100vh-120px)] transition-all duration-300 z-20",
        "bg-zinc-950 border-r border-zinc-800",
      )}
      style={{ width: isOpen ? "420px" : "0" }}
    >
      {isOpen && (
        <div className="h-full flex flex-col">
          {/* Components Grid - No header needed */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-6 space-y-8">
              {categories.map((category) => {
                const Icon = categoryIcons[category];
                const categoryComponents = components.filter(
                  (c) => c.category === category,
                );

                return (
                  <div key={category}>
                    {/* Category Label */}
                    <div className="flex items-center gap-2 mb-4">
                      {Icon && <Icon className="w-3 h-3 text-zinc-600" />}
                      <span className="text-xs font-medium text-zinc-500 tracking-wider uppercase">
                        {category}
                      </span>
                      <div className="flex-1 h-px bg-zinc-800" />
                    </div>

                    {/* Components Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {categoryComponents.map((component) => (
                        <div
                          key={component.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "component",
                              JSON.stringify(component),
                            );
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          className={cn(
                            "relative group cursor-move",
                            "bg-zinc-900 hover:bg-zinc-800 rounded",
                            "border border-zinc-800 hover:border-zinc-700",
                            "transition-all duration-200",
                            "flex flex-col items-center justify-center gap-2",
                            "h-[72px]",
                            component.colSpan === 3 && "col-span-3",
                            component.rowSpan === 3 &&
                              component.colSpan !== 3 &&
                              "row-span-2 h-auto",
                          )}
                        >
                          {/* Component Preview */}
                          <div className="flex items-center justify-center">
                            {component.component}
                          </div>

                          {/* Label */}
                          <span className="text-[10px] text-zinc-600 tracking-wide">
                            {component.label}
                          </span>

                          {/* Size indicator */}
                          {(component.colSpan || component.rowSpan) &&
                            component.colSpan !== 1 && (
                              <div className="absolute top-1 right-1 text-[8px] text-zinc-700 bg-zinc-900 px-1 rounded border border-zinc-800">
                                {component.colSpan || 1}×
                                {component.rowSpan || 1}
                              </div>
                            )}

                          {/* Drag indicator */}
                          <div className="absolute inset-0 border border-zinc-600 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <span>{components.length} components available</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
