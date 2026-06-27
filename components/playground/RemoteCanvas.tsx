"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Wifi,
  Signal,
  Home,
  Menu,
  Settings,
  Mic,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PowerButton,
  DirectionalPad,
  VolumeControl,
  ChannelControls,
  RemoteButton,
} from "@/components/remote/buttons";
import { CustomTextModal } from "./CustomTextModal";

interface RemoteItem {
  id: string;
  type: string;
  label: string;
  gridX: number;
  gridY: number;
  colSpan: number;
  rowSpan: number;
  shape?: { x: number; y: number }[];
}

interface RemoteCanvasProps {
  onLayoutChange?: (layout: { items: RemoteItem[] }) => void;
  initialLayout?: { items: RemoteItem[] };
}

const GRID_COLS = 3;
const GRID_ROWS = 11;

export function RemoteCanvas({
  onLayoutChange,
  initialLayout,
}: RemoteCanvasProps) {
  const [items, setItems] = useState<RemoteItem[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingComponent, setPendingComponent] = useState<any>(null);
  const [draggedItem, setDraggedItem] = useState<RemoteItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewShape, setPreviewShape] = useState<{
    colSpan: number;
    rowSpan: number;
    shape?: { x: number; y: number }[];
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Load initial layout when provided
  useEffect(() => {
    if (initialLayout?.items && initialLayout.items.length > 0) {
      setItems(initialLayout.items);
    }
  }, [initialLayout]);

  // Notify parent of layout changes
  useEffect(() => {
    if (onLayoutChange) {
      onLayoutChange({ items });
    }
  }, [items]);

  const getGridCoordinates = (
    e: React.DragEvent,
  ): { x: number; y: number } | null => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
      return null;
    }

    const cellWidth = rect.width / GRID_COLS;
    const cellHeight = rect.height / GRID_ROWS;

    const gridX = Math.min(
      Math.max(0, Math.floor(x / cellWidth)),
      GRID_COLS - 1,
    );
    const gridY = Math.min(
      Math.max(0, Math.floor(y / cellHeight)),
      GRID_ROWS - 1,
    );

    return { x: gridX, y: gridY };
  };

  const isCellOccupied = (
    x: number,
    y: number,
    width: number,
    height: number,
    shape?: { x: number; y: number }[],
    excludeId?: string,
  ): boolean => {
    // Check bounds
    if (x < 0 || y < 0 || x + width > GRID_COLS || y + height > GRID_ROWS) {
      return true;
    }

    // Get cells to check based on shape or rectangle
    const cellsToCheck = shape
      ? shape.map((p) => ({ x: x + p.x, y: y + p.y }))
      : Array.from({ length: width * height }, (_, i) => ({
          x: x + (i % width),
          y: y + Math.floor(i / width),
        }));

    // Check collision with other items
    for (const item of items) {
      if (excludeId && item.id === excludeId) continue;

      const itemCells = item.shape
        ? item.shape.map((p) => ({ x: item.gridX + p.x, y: item.gridY + p.y }))
        : Array.from({ length: item.colSpan * item.rowSpan }, (_, i) => ({
            x: item.gridX + (i % item.colSpan),
            y: item.gridY + Math.floor(i / item.colSpan),
          }));

      // Check if any cells overlap
      for (const checkCell of cellsToCheck) {
        for (const itemCell of itemCells) {
          if (checkCell.x === itemCell.x && checkCell.y === itemCell.y) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const handleItemDragStart = (e: React.DragEvent, item: RemoteItem) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("moveItem", "true");

    setDraggedItem(item);
    setIsDragging(true);
    setPreviewShape({
      colSpan: item.colSpan,
      rowSpan: item.rowSpan,
      shape: item.shape,
    });
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    // Check if this is a new component being dragged in
    if (!draggedItem) {
      setIsDragging(true);

      // Try to get component data to set preview shape
      try {
        const data = e.dataTransfer.getData("component");
        if (data) {
          const component = JSON.parse(data);
          setPreviewShape({
            colSpan: component.colSpan || 1,
            rowSpan: component.rowSpan || 1,
            shape: component.shape,
          });
        }
      } catch {
        // Can't access data during drag, set default preview
        setPreviewShape({
          colSpan: 1,
          rowSpan: 1,
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedItem ? "move" : "copy";

    const coords = getGridCoordinates(e);
    setHoveredCell(coords);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX;
      const y = e.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        setHoveredCell(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const coords = getGridCoordinates(e);
    if (!coords) {
      resetDragState();
      return;
    }

    const { x: gridX, y: gridY } = coords;

    // Check if we're moving an existing item
    const isMoveOperation = e.dataTransfer.getData("moveItem") === "true";

    if (isMoveOperation && draggedItem) {
      // Handle moving existing item
      const newX = Math.min(gridX, GRID_COLS - draggedItem.colSpan);
      const newY = Math.min(gridY, GRID_ROWS - draggedItem.rowSpan);

      if (
        !isCellOccupied(
          newX,
          newY,
          draggedItem.colSpan,
          draggedItem.rowSpan,
          draggedItem.shape,
          draggedItem.id,
        )
      ) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === draggedItem.id
              ? { ...item, gridX: newX, gridY: newY }
              : item,
          ),
        );
      }
    } else {
      // Handle adding new component
      try {
        const componentData = e.dataTransfer.getData("component");
        if (componentData) {
          const component = JSON.parse(componentData);
          const colSpan = component.colSpan || 1;
          const rowSpan = component.rowSpan || 1;
          const adjustedX = Math.min(gridX, GRID_COLS - colSpan);
          const adjustedY = Math.min(gridY, GRID_ROWS - rowSpan);

          if (
            !isCellOccupied(
              adjustedX,
              adjustedY,
              colSpan,
              rowSpan,
              component.shape,
            )
          ) {
            if (component.type === "custom-text") {
              setPendingComponent({
                ...component,
                gridX: adjustedX,
                gridY: adjustedY,
              });
              setIsModalOpen(true);
            } else {
              const newItem: RemoteItem = {
                id: `${component.type}-${Date.now()}-${Math.random()}`,
                type: component.type,
                label: component.label || "",
                gridX: adjustedX,
                gridY: adjustedY,
                colSpan: colSpan,
                rowSpan: rowSpan,
                shape: component.shape,
              };
              setItems((prev) => [...prev, newItem]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse component data:", err);
      }
    }

    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setIsDragging(false);
    setHoveredCell(null);
    setPreviewShape(null);
  };

  const handleModalSubmit = (labelText: string) => {
    if (pendingComponent) {
      const newItem: RemoteItem = {
        id: `custom-text-${Date.now()}`,
        type: "custom-text",
        label: labelText,
        gridX: pendingComponent.gridX,
        gridY: pendingComponent.gridY,
        colSpan: pendingComponent.colSpan || 1,
        rowSpan: pendingComponent.rowSpan || 1,
        shape: pendingComponent.shape,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setIsModalOpen(false);
    setPendingComponent(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPendingComponent(null);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const renderButton = (item: RemoteItem) => {
    const specialComponents: { [key: string]: JSX.Element } = {
      power: <PowerButton />,
      dpad: <DirectionalPad />,
      volume: <VolumeControl />,
      channel: <ChannelControls />,
    };

    if (specialComponents[item.type]) {
      return specialComponents[item.type];
    }

    const iconComponents: { [key: string]: React.ElementType } = {
      home: Home,
      menu: Menu,
      settings: Settings,
      voice: Mic,
      play: Play,
      pause: Pause,
      stop: Square,
      next: SkipForward,
      prev: SkipBack,
    };

    const Icon = iconComponents[item.type];
    if (Icon) {
      return (
        <RemoteButton>
          <Icon />
        </RemoteButton>
      );
    }

    // Numeric buttons
    if (item.type.startsWith("num-")) {
      const label =
        item.type === "num-star"
          ? "*"
          : item.type === "num-hash"
            ? "#"
            : item.type.replace("num-", "");
      return <RemoteButton>{label}</RemoteButton>;
    }

    // Color buttons
    const colorClasses: { [key: string]: string } = {
      "red-btn": "bg-red-600 hover:bg-red-700",
      "green-btn": "bg-green-600 hover:bg-green-700",
      "yellow-btn": "bg-yellow-500 hover:bg-yellow-600",
      "blue-btn": "bg-blue-600 hover:bg-blue-700",
    };

    if (colorClasses[item.type]) {
      return (
        <RemoteButton variant="color" className={colorClasses[item.type]} />
      );
    }

    // Custom text button
    if (item.type === "custom-text") {
      return <RemoteButton>{item.label}</RemoteButton>;
    }

    return <RemoteButton>{item.label || item.type}</RemoteButton>;
  };

  // Ghost preview for drag feedback
  const renderGhostPreview = () => {
    if (!isDragging || !hoveredCell || !previewShape) return null;

    const { colSpan, rowSpan, shape } = previewShape;
    const adjustedX = Math.min(hoveredCell.x, GRID_COLS - colSpan);
    const adjustedY = Math.min(hoveredCell.y, GRID_ROWS - rowSpan);

    const isValid = !isCellOccupied(
      adjustedX,
      adjustedY,
      colSpan,
      rowSpan,
      shape,
      draggedItem?.id,
    );

    // Render cells based on shape or rectangle
    const cellsToRender = shape
      ? shape.map((p) => ({
          x: adjustedX + p.x,
          y: adjustedY + p.y,
          width: 1,
          height: 1,
        }))
      : [
          {
            x: adjustedX,
            y: adjustedY,
            width: colSpan,
            height: rowSpan,
          },
        ];

    return (
      <>
        {cellsToRender.map((cell, index) => (
          <div
            key={index}
            className={cn(
              "pointer-events-none border-2 rounded-lg transition-all duration-200 z-30",
              isValid
                ? "bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20"
                : "bg-red-500/20 border-red-500 animate-pulse",
            )}
            style={{
              gridColumn: `${cell.x + 1} / span ${cell.width}`,
              gridRow: `${cell.y + 1} / span ${cell.height}`,
            }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <CustomTextModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />

      <div className="w-full h-full bg-black rounded-[3.5rem] flex flex-col">
        {/* Status Bar */}
        <div className="flex-shrink-0 h-10 px-8 flex justify-between items-center text-white font-sans text-sm">
          <div className="font-medium">9:41</div>
          <div className="flex items-center gap-1.5">
            <Signal size={14} />
            <Wifi size={14} />
            <div className="w-6 h-2.5 border border-white/30 rounded-full flex items-center p-0.5">
              <div className="w-full h-full bg-white rounded-sm" />
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div
          className="flex-1 relative p-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragEnd={handleDragEnd}
        >
          {/* Grid Background - Fixed grid that doesn't change */}
          <div
            ref={gridRef}
            className="absolute inset-4 grid grid-cols-3 gap-2"
            style={{
              gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
            }}
          >
            {/* Grid cells - these stay fixed */}
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
              const col = (i % GRID_COLS) + 1;
              const row = Math.floor(i / GRID_COLS) + 1;
              return (
                <div
                  key={i}
                  className={cn(
                    "border rounded-lg transition-all duration-200",
                    isDragging
                      ? "border-gray-700/50 border-dashed"
                      : "border-gray-800 border-dashed",
                  )}
                  style={{
                    gridColumn: col,
                    gridRow: row,
                  }}
                />
              );
            })}

            {/* Ghost preview */}
            {renderGhostPreview()}

            {/* Placed items - positioned within the grid */}
            {items.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item)}
                className={cn(
                  "group relative cursor-move transition-all duration-200 z-10",
                  draggedItem?.id === item.id
                    ? "opacity-30 scale-95"
                    : "hover:scale-[1.02] hover:z-20",
                )}
                style={{
                  gridColumn: `${item.gridX + 1} / span ${item.colSpan}`,
                  gridRow: `${item.gridY + 1} / span ${item.rowSpan}`,
                }}
              >
                {renderButton(item)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {items.length === 0 && !isDragging && (
            <div className="absolute inset-4 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500">
                <p className="text-lg mb-2">Drag components here</p>
                <p className="text-sm">They will snap to the grid</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
