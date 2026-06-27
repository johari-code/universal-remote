// app/(authenticated)/remotes/[id]/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import { useMQTTRemote } from "@/hooks/useMQTTRemote";
import { Remote, RemoteButton as RemoteButtonType } from "@/lib/supabase/types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  Settings,
  Home,
  Mic,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Power,
  Volume2,
  VolumeX,
  List,
  Tv,
  Wind,
  Music,
  Wifi,
  Smartphone,
  GraduationCap,
  X,
  Cloud,
  CloudOff,
  Loader2,
  Check,
  Zap,
  Info,
  Circle,
  FastForward,
  Rewind,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RemoteControlPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  // MQTT connection
  const {
    isConnected,
    deviceStatus,
    isLearning,
    sendCommand,
    startLearning,
    stopLearning,
  } = useMQTTRemote("ESP32_IR_001");

  // States
  const [remote, setRemote] = useState<Remote | null>(null);
  const [buttons, setButtons] = useState<RemoteButtonType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentLearningButton, setCurrentLearningButton] = useState<
    string | null
  >(null);
  const [sendingCommand, setSendingCommand] = useState<string | null>(null);
  const [showRemotesList, setShowRemotesList] = useState(false);
  const [allRemotes, setAllRemotes] = useState<Remote[]>([]);

  // Refs
  const realtimeChannelRef = useRef<any>(null);
  const learningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load remote and buttons
  const loadRemote = useCallback(async () => {
    if (!user || !params.id) return;

    try {
      const { data: remoteData, error: remoteError } = await supabase
        .from("remotes")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (remoteError) throw remoteError;

      const { data: buttonsData, error: buttonsError } = await supabase
        .from("remote_buttons")
        .select("*")
        .eq("remote_id", params.id)
        .order("button_id");

      if (buttonsError) throw buttonsError;

      setRemote(remoteData);
      setButtons(buttonsData || []);
    } catch (error: any) {
      console.error("Error loading remote:", error);
      toast.error("Failed to load remote");
      router.push("/remotes");
    } finally {
      setLoading(false);
    }
  }, [user, params.id, router]);

  // Load all remotes for sidebar
  const loadAllRemotes = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("remotes")
        .select("id, name, device_type, brand")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllRemotes(data || []);
    } catch (error) {
      console.error("Error loading remotes list:", error);
    }
  }, [user]);

  // Subscribe to realtime updates for button changes
  const subscribeToUpdates = useCallback(() => {
    const channel = supabase
      .channel(`remote-${params.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "remote_buttons",
          filter: `remote_id=eq.${params.id}`,
        },
        async (payload) => {
          console.log("Button update:", payload);

          // Reload buttons to get fresh data
          const { data: buttonsData } = await supabase
            .from("remote_buttons")
            .select("*")
            .eq("remote_id", params.id)
            .order("button_id");

          if (buttonsData) {
            setButtons(buttonsData);
          }

          // Check if this was a learning completion
          if (payload.new.hex_code && !payload.old.hex_code) {
            if (currentLearningButton === payload.new.button_id) {
              toast.success("Button programmed successfully!", {
                description: `Code: ${payload.new.hex_code}`,
                icon: <Zap className="w-4 h-4" />,
              });
              setCurrentLearningButton(null);

              // Clear learning timeout
              if (learningTimeoutRef.current) {
                clearTimeout(learningTimeoutRef.current);
                learningTimeoutRef.current = null;
              }
            }
          }
        },
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, [params.id, currentLearningButton]);

  // Toggle learning mode
  const toggleLearningMode = () => {
    if (deviceStatus !== "online") {
      toast.error("ESP32 device is offline");
      return;
    }

    const newMode = !isLearningMode;
    setIsLearningMode(newMode);
    setCurrentLearningButton(null);

    if (newMode) {
      toast.info("Learning mode activated. Tap any button to program it.");
    } else {
      stopLearning();
      toast.info("Learning mode deactivated.");

      if (learningTimeoutRef.current) {
        clearTimeout(learningTimeoutRef.current);
        learningTimeoutRef.current = null;
      }
    }
  };

  // Send or learn IR command - INSTANT with MQTT
  const sendIRCommand = async (buttonId: string) => {
    // Haptic feedback immediately
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Check device
    if (!isConnected || deviceStatus !== "online") {
      toast.error("Device offline");
      return;
    }

    if (isLearningMode) {
      // Start learning
      setCurrentLearningButton(buttonId);

      const success = startLearning(buttonId, params.id as string);

      if (success) {
        // Set timeout
        learningTimeoutRef.current = setTimeout(() => {
          if (currentLearningButton === buttonId) {
            setCurrentLearningButton(null);
            toast.error("Learning timeout");
          }
        }, 30000); // 30 seconds
      }
      return;
    }

    // Normal send
    const button = buttons.find((b) => b.button_id === buttonId);

    if (!button?.hex_code) {
      toast.error("Button not programmed");
      return;
    }

    // Visual feedback
    setSendingCommand(buttonId);

    // Send via MQTT - INSTANT!
    sendCommand(button.hex_code, button.protocol || "NEC");

    // Clear visual feedback
    setTimeout(() => setSendingCommand(null), 150);
  };

  // Initialize
  useEffect(() => {
    if (user && params.id) {
      loadRemote();
      loadAllRemotes();
      subscribeToUpdates();
    }

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
      if (learningTimeoutRef.current) {
        clearTimeout(learningTimeoutRef.current);
      }
    };
  }, [user, params.id, loadRemote, loadAllRemotes, subscribeToUpdates]);

  // Get device icon
  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case "TV":
        return Tv;
      case "AC":
        return Wind;
      case "Audio":
        return Music;
      case "STB":
        return Wifi;
      default:
        return Smartphone;
    }
  };

  // Render button - COMPLETELY FIXED VERSION
  const renderButton = (item: any) => {
    if (!item) return null;

    // Helper to get button data
    const getButtonData = (buttonId: string) => {
      const button = buttons.find((b) => b.button_id === buttonId);
      return {
        isProgrammed:
          button?.hex_code !== null && button?.hex_code !== undefined,
        isCurrentLearning: currentLearningButton === buttonId,
        isSending: sendingCommand === buttonId,
      };
    };

    // Helper to get button classes
    const getButtonClass = (buttonId: string, additionalClasses = "") => {
      const { isProgrammed, isCurrentLearning, isSending } =
        getButtonData(buttonId);

      return cn(
        "w-full h-full flex items-center justify-center transition-all active:scale-95 relative",
        additionalClasses,
        isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
        isLearningMode &&
          !isCurrentLearning &&
          !isProgrammed &&
          "ring-2 ring-blue-500/30",
        isSending && "scale-95",
      );
    };

    // D-pad navigation
    if (item.type === "dpad") {
      return (
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full h-full">
          <div className="col-start-2 row-start-1">
            <button
              onClick={() => sendIRCommand(`${item.id}-up`)}
              className={getButtonClass(
                `${item.id}-up`,
                "bg-zinc-800 hover:bg-zinc-700 rounded-t-lg",
              )}
              disabled={!isConnected || deviceStatus !== "online"}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
          <div className="col-start-1 row-start-2">
            <button
              onClick={() => sendIRCommand(`${item.id}-left`)}
              className={getButtonClass(
                `${item.id}-left`,
                "bg-zinc-800 hover:bg-zinc-700 rounded-l-lg",
              )}
              disabled={!isConnected || deviceStatus !== "online"}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="col-start-2 row-start-2">
            <button
              onClick={() => sendIRCommand(`${item.id}-ok`)}
              className={getButtonClass(
                `${item.id}-ok`,
                "bg-zinc-800 hover:bg-zinc-700 font-bold text-sm",
              )}
              disabled={!isConnected || deviceStatus !== "online"}
            >
              OK
            </button>
          </div>
          <div className="col-start-3 row-start-2">
            <button
              onClick={() => sendIRCommand(`${item.id}-right`)}
              className={getButtonClass(
                `${item.id}-right`,
                "bg-zinc-800 hover:bg-zinc-700 rounded-r-lg",
              )}
              disabled={!isConnected || deviceStatus !== "online"}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="col-start-2 row-start-3">
            <button
              onClick={() => sendIRCommand(`${item.id}-down`)}
              className={getButtonClass(
                `${item.id}-down`,
                "bg-zinc-800 hover:bg-zinc-700 rounded-b-lg",
              )}
              disabled={!isConnected || deviceStatus !== "online"}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    // Volume controls - 3 buttons (Vol+, Mute, Vol-)
    if (item.type === "volume") {
      return (
        <div className="flex flex-col gap-1 h-full">
          <button
            onClick={() => sendIRCommand(`${item.id}-up`)}
            className={getButtonClass(
              `${item.id}-up`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-t-lg",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => sendIRCommand(`${item.id}-mute`)}
            className={getButtonClass(
              `${item.id}-mute`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <VolumeX className="w-5 h-5" />
          </button>
          <button
            onClick={() => sendIRCommand(`${item.id}-down`)}
            className={getButtonClass(
              `${item.id}-down`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-b-lg",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      );
    }

    // Channel controls - 3 buttons (CH+, Last, CH-)
    if (item.type === "channel") {
      return (
        <div className="flex flex-col gap-1 h-full">
          <button
            onClick={() => sendIRCommand(`${item.id}-up`)}
            className={getButtonClass(
              `${item.id}-up`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-t-lg",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => sendIRCommand(`${item.id}-last`)}
            className={getButtonClass(
              `${item.id}-last`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            CHANNELS
          </button>
          <button
            onClick={() => sendIRCommand(`${item.id}-down`)}
            className={getButtonClass(
              `${item.id}-down`,
              "flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-b-lg",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      );
    }

    // Power button
    if (item.type === "power") {
      const { isProgrammed, isCurrentLearning, isSending } = getButtonData(
        item.id,
      );

      return (
        <button
          onClick={() => sendIRCommand(item.id)}
          className={cn(
            "w-full h-full rounded-full flex items-center justify-center transition-all active:scale-95 relative",
            isProgrammed
              ? "bg-red-600 hover:bg-red-700"
              : "bg-zinc-800 hover:bg-zinc-700",
            isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
            isLearningMode &&
              !isCurrentLearning &&
              !isProgrammed &&
              "ring-2 ring-blue-500/30",
            isSending && "scale-95",
          )}
          disabled={!isConnected || deviceStatus !== "online"}
        >
          <Power className="w-6 h-6 text-white" />
          {isSending && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          )}
        </button>
      );
    }

    // Number buttons
    if (item.type.startsWith("num-")) {
      const { isProgrammed, isCurrentLearning, isSending } = getButtonData(
        item.id,
      );
      const label =
        item.type === "num-star"
          ? "*"
          : item.type === "num-hash"
            ? "#"
            : item.type.replace("num-", "");

      return (
        <button
          onClick={() => sendIRCommand(item.id)}
          className={cn(
            "w-full h-full rounded-lg flex items-center justify-center transition-all active:scale-95 relative text-xl font-medium",
            isProgrammed
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              : "bg-zinc-900 text-zinc-600",
            isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
            isLearningMode &&
              !isCurrentLearning &&
              !isProgrammed &&
              "ring-2 ring-blue-500/30",
            isSending && "scale-95",
          )}
          disabled={!isConnected || deviceStatus !== "online"}
        >
          {label}
          {isSending && (
            <div className="absolute inset-0 rounded-lg bg-white/10 animate-ping" />
          )}
        </button>
      );
    }

    // Color buttons
    const colorClasses: { [key: string]: string } = {
      "red-btn": "bg-red-600 hover:bg-red-700",
      "green-btn": "bg-green-600 hover:bg-green-700",
      "yellow-btn": "bg-yellow-500 hover:bg-yellow-600",
      "blue-btn": "bg-blue-600 hover:bg-blue-700",
    };

    if (colorClasses[item.type]) {
      const { isProgrammed, isCurrentLearning, isSending } = getButtonData(
        item.id,
      );
      return (
        <button
          onClick={() => sendIRCommand(item.id)}
          className={cn(
            "w-full h-full rounded-lg flex items-center justify-center transition-all active:scale-95 relative",
            colorClasses[item.type],
            isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
            isLearningMode &&
              !isCurrentLearning &&
              !isProgrammed &&
              "ring-2 ring-blue-500/30",
            isSending && "scale-95",
          )}
          disabled={!isConnected || deviceStatus !== "online"}
        >
          {isSending && (
            <div className="absolute inset-0 rounded-lg bg-white/10 animate-ping" />
          )}
        </button>
      );
    }

    // Custom text button
    if (item.type === "custom-text") {
      const { isProgrammed, isCurrentLearning, isSending } = getButtonData(
        item.id,
      );
      return (
        <button
          onClick={() => sendIRCommand(item.id)}
          className={cn(
            "w-full h-full rounded-lg flex items-center justify-center transition-all active:scale-95 relative",
            isProgrammed
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              : "bg-zinc-900 text-zinc-600",
            isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
            isLearningMode &&
              !isCurrentLearning &&
              !isProgrammed &&
              "ring-2 ring-blue-500/30",
            isSending && "scale-95",
            "text-sm font-medium",
          )}
          disabled={!isConnected || deviceStatus !== "online"}
        >
          {item.label}
          {isSending && (
            <div className="absolute inset-0 rounded-lg bg-white/10 animate-ping" />
          )}
        </button>
      );
    }

    // Icon mapping for single buttons
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
      back: ChevronLeft,
      info: Info,
      guide: List,
      exit: X,
      source: Tv,
      rec: Circle,
      ff: FastForward,
      rw: Rewind,
      mute: VolumeX,
    };

    const Icon = iconComponents[item.type] || null;
    const { isProgrammed, isCurrentLearning, isSending } = getButtonData(
      item.id,
    );

    // Default single button - ICON ONLY
    return (
      <button
        onClick={() => sendIRCommand(item.id)}
        className={cn(
          "w-full h-full rounded-lg flex items-center justify-center transition-all active:scale-95 relative",
          isProgrammed
            ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            : "bg-zinc-900 text-zinc-600",
          isCurrentLearning && "animate-pulse ring-4 ring-yellow-400",
          isLearningMode &&
            !isCurrentLearning &&
            !isProgrammed &&
            "ring-2 ring-blue-500/30",
          isSending && "scale-95",
        )}
        disabled={!isConnected || deviceStatus !== "online"}
      >
        {Icon ? (
          <Icon className="w-5 h-5" />
        ) : item.label ? (
          // If no icon but has label (shouldn't happen for standard buttons)
          <span className="text-sm font-medium">{item.label}</span>
        ) : (
          // Last fallback - show type name
          <span className="text-xs">{item.type}</span>
        )}
        {isSending && (
          <div className="absolute inset-0 rounded-lg bg-white/10 animate-ping" />
        )}
      </button>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Not found
  if (!remote) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Remote not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
        <button
          onClick={() => setShowRemotesList(!showRemotesList)}
          className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-zinc-400" />
        </button>

        <div className="flex-1 text-center">
          <h1 className="text-sm font-medium text-zinc-100">{remote.name}</h1>
          {remote.brand && (
            <p className="text-xs text-zinc-500">
              {remote.brand} {remote.model}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* MQTT Connection Status */}
          <div
            className={cn(
              "p-2 rounded-lg flex items-center gap-1",
              isConnected && deviceStatus === "online"
                ? "text-green-500"
                : isConnected
                  ? "text-yellow-500"
                  : "text-red-500",
            )}
          >
            {isConnected && deviceStatus === "online" ? (
              <>
                <Zap className="w-4 h-4" />
                <span className="text-xs">Live</span>
              </>
            ) : isConnected ? (
              <CloudOff className="w-4 h-4" />
            ) : (
              <CloudOff className="w-4 h-4" />
            )}
          </div>

          <button
            onClick={toggleLearningMode}
            className={cn(
              "p-2 -mr-2 rounded-lg transition-colors",
              isLearningMode
                ? "bg-blue-600 text-white"
                : "hover:bg-zinc-800 text-zinc-400",
            )}
            disabled={!isConnected || deviceStatus !== "online"}
          >
            <GraduationCap className="w-5 h-5" />
          </button>
        </div>
      </header>

      {isLearningMode && (
        <div className="bg-blue-600 px-4 py-2 text-center">
          <p className="text-xs text-white">
            {currentLearningButton
              ? "Press the button on your physical remote now..."
              : "Learning Mode - Tap any button to program it"}
          </p>
        </div>
      )}

      {(!isConnected || deviceStatus !== "online") && (
        <div className="bg-red-600 px-4 py-2 text-center">
          <p className="text-xs text-white">
            Device offline - Check ESP32 connection
          </p>
        </div>
      )}

      {/* Remote Buttons */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div
          className="grid grid-cols-3 gap-3 max-w-md mx-auto"
          style={{ gridAutoRows: "60px" }}
        >
          {remote.layout?.items?.map((item: any) => (
            <div
              key={item.id}
              className="relative"
              style={{
                gridColumnStart: item.gridX + 1,
                gridColumnEnd: item.gridX + (item.colSpan || 1) + 1,
                gridRowStart: item.gridY + 1,
                gridRowEnd: item.gridY + (item.rowSpan || 1) + 1,
              }}
            >
              {renderButton(item)}
            </div>
          ))}
        </div>
      </div>

      {/* Remote List Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform z-50",
          showRemotesList ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
          <h2 className="text-sm font-medium text-zinc-100">My Remotes</h2>
          <button
            onClick={() => setShowRemotesList(false)}
            className="p-1 hover:bg-zinc-800 rounded"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {allRemotes.map((r) => {
            const DeviceIcon = getDeviceIcon(r.device_type);
            return (
              <button
                key={r.id}
                onClick={() => {
                  router.push(`/remotes/${r.id}`);
                  setShowRemotesList(false);
                }}
                className={cn(
                  "w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-800 transition-colors text-left",
                  r.id === params.id && "bg-zinc-800",
                )}
              >
                <DeviceIcon className="w-5 h-5 text-zinc-500" />
                <div className="flex-1">
                  <p className="text-sm text-zinc-100">{r.name}</p>
                  {r.brand && (
                    <p className="text-xs text-zinc-500">{r.brand}</p>
                  )}
                </div>
                {r.id === params.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showRemotesList && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowRemotesList(false)}
        />
      )}
    </div>
  );
}
