"use client";

import { useState, useEffect, Suspense } from "react";
import { ComponentDrawer } from "@/components/playground/ComponentDrawer";
import { RemoteCanvas } from "@/components/playground/RemoteCanvas";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";
import {
  Save,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  Tv,
  Wind,
  Music,
  Wifi,
  Smartphone,
  Monitor,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const deviceTypes = [
  { value: "TV", label: "Television", icon: Tv },
  { value: "AC", label: "Air Conditioner", icon: Wind },
  { value: "Audio", label: "Audio System", icon: Music },
  { value: "STB", label: "Set-Top Box", icon: Wifi },
  { value: "Other", label: "Other Device", icon: Smartphone },
];

function PlaygroundContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remoteLayout, setRemoteLayout] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Form states
  const [remoteName, setRemoteName] = useState("");
  const [remoteDescription, setRemoteDescription] = useState("");
  const [deviceType, setDeviceType] = useState("TV");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  // Editing state
  const [editingRemoteId, setEditingRemoteId] = useState<string | null>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load remote for editing if ID is in URL
  useEffect(() => {
    const remoteId = searchParams.get("edit");
    if (remoteId && user) {
      loadRemoteForEditing(remoteId);
    }
  }, [searchParams, user]);

  const loadRemoteForEditing = async (remoteId: string) => {
    try {
      const { data, error } = await supabase
        .from("remotes")
        .select("*")
        .eq("id", remoteId)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setEditingRemoteId(data.id);
        setRemoteName(data.name);
        setRemoteDescription(data.description || "");
        setDeviceType(data.device_type || "TV");
        setBrand(data.brand || "");
        setModel(data.model || "");
        setRemoteLayout(data.layout);
        toast.success("Remote loaded for editing");
      }
    } catch (error) {
      console.error("Error loading remote:", error);
      toast.error("Failed to load remote");
      router.push("/playground");
    }
  };

  const handleLayoutChange = (layout: any) => {
    setRemoteLayout(layout);
  };

  const handleSave = () => {
    if (!remoteLayout || remoteLayout.items?.length === 0) {
      toast.error("Please add at least one button to your remote");
      return;
    }
    setShowSaveModal(true);
  };

  // Fixed handleSaveRemote function for playground page
  // Replace the existing handleSaveRemote function with this one

  const handleSaveRemote = async () => {
    if (!user) {
      toast.error("Please sign in to save remotes");
      return;
    }

    if (!remoteName.trim()) {
      toast.error("Please enter a name for your remote");
      return;
    }

    setIsSaving(true);

    try {
      const remoteData = {
        user_id: user.id,
        name: remoteName.trim(),
        description: remoteDescription.trim() || null,
        device_type: deviceType,
        brand: brand.trim() || null,
        model: model.trim() || null,
        layout: remoteLayout,
      };

      let result;

      if (editingRemoteId) {
        // Update existing remote
        const { data, error } = await supabase
          .from("remotes")
          .update(remoteData)
          .eq("id", editingRemoteId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
        toast.success("Remote updated successfully!");
      } else {
        // Create new remote
        const { data, error } = await supabase
          .from("remotes")
          .insert(remoteData)
          .select()
          .single();

        if (error) throw error;
        result = data;

        // Create empty button configurations for each button
        // FIXED: Properly handle multi-button components
        if (result && remoteLayout.items) {
          const buttonConfigs: any[] = [];

          remoteLayout.items.forEach((item: any) => {
            // Handle multi-button components
            if (item.type === "dpad") {
              // Create 5 buttons for d-pad
              ["up", "down", "left", "right", "ok"].forEach((dir) => {
                buttonConfigs.push({
                  remote_id: result.id,
                  button_id: `${item.id}-${dir}`,
                  button_type: `dpad-${dir}`,
                  hex_code: null,
                  protocol: null,
                });
              });
            } else if (item.type === "volume") {
              // Create 3 buttons for volume
              ["up", "mute", "down"].forEach((action) => {
                buttonConfigs.push({
                  remote_id: result.id,
                  button_id: `${item.id}-${action}`,
                  button_type: `volume-${action}`,
                  hex_code: null,
                  protocol: null,
                });
              });
            } else if (item.type === "channel") {
              // Create 3 buttons for channel
              ["up", "last", "down"].forEach((action) => {
                buttonConfigs.push({
                  remote_id: result.id,
                  button_id: `${item.id}-${action}`,
                  button_type: `channel-${action}`,
                  hex_code: null,
                  protocol: null,
                });
              });
            } else {
              // Single button
              buttonConfigs.push({
                remote_id: result.id,
                button_id: item.id,
                button_type: item.type,
                hex_code: null,
                protocol: null,
              });
            }
          });

          const { error: buttonError } = await supabase
            .from("remote_buttons")
            .insert(buttonConfigs);

          if (buttonError) {
            console.error("Error creating button configs:", buttonError);
          }
        }

        toast.success("Remote saved successfully!");
      }

      // Redirect to the remotes page
      router.push("/remotes");
    } catch (error: any) {
      console.error("Error saving remote:", error);
      toast.error(error.message || "Failed to save remote");
    } finally {
      setIsSaving(false);
      setShowSaveModal(false);
    }
  };
  const handleShare = () => {
    toast.info("Share feature coming soon!");
  };

  const handleExport = () => {
    toast.info("Export feature coming soon!");
  };

  // Mobile Lock Screen
  if (isMobile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        {/* Simple Mobile Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4">
          <Link href="/" className="text-base font-semibold text-zinc-100">
            Universal IR Remote
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Mobile Lock Message */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                <Laptop className="w-10 h-10 text-zinc-500" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-zinc-100">
                Desktop Required
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The Remote Builder requires a desktop or laptop computer for the
                best experience. Drag-and-drop functionality and precise
                component placement work best with a mouse and keyboard.
              </p>
            </div>

            {/* Features List */}
            <div className="bg-zinc-900 rounded-lg p-4 space-y-2 border border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-zinc-400 text-left">
                  Drag and drop components to build your remote
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-zinc-400 text-left">
                  Precise positioning and resizing of buttons
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <p className="text-xs text-zinc-400 text-left">
                  Real-time preview in phone mockup
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/remotes"
                className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                View My Remotes
              </Link>
              <Link
                href="/"
                className="block w-full px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors text-sm border border-zinc-800"
              >
                Go to Homepage
              </Link>
            </div>

            {/* Desktop Hint */}
            <p className="text-xs text-zinc-500">
              Please visit this page on a desktop computer to start building
              your custom remote
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Version (unchanged)
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Desktop Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold text-zinc-100">
            Universal IR Remote
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/playground" className="text-sm text-zinc-100">
              Playground
            </Link>
            <Link
              href="/remotes"
              className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              My Remotes
            </Link>
          </nav>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-zinc-800 pr-4">
            <button
              onClick={handleSave}
              disabled={!remoteLayout || remoteLayout.items?.length === 0}
              className={cn(
                "px-3 py-1.5 rounded text-xs transition-all",
                remoteLayout && remoteLayout.items?.length > 0
                  ? "border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-500 cursor-not-allowed",
              )}
            >
              {editingRemoteId ? "Update" : "Save"}
            </button>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Components */}
        <div
          className={cn(
            "border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
            isDrawerOpen ? "w-[420px]" : "w-12",
          )}
        >
          {/* Drawer Toggle */}
          <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-3">
            {isDrawerOpen && (
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Components
              </span>
            )}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              {isDrawerOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Components Content */}
          {isDrawerOpen && (
            <div className="overflow-y-auto scrollbar-hide h-[calc(100vh-7rem)]">
              <ComponentDrawer isDrawerOnly />
            </div>
          )}
        </div>

        {/* Right Section - Canvas */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <Iphone15Pro width={433} height={882}>
              <RemoteCanvas
                onLayoutChange={handleLayoutChange}
                initialLayout={remoteLayout}
              />
            </Iphone15Pro>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {editingRemoteId ? "Update Remote" : "Save Remote"}
            </h2>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Remote Name *
                </label>
                <input
                  type="text"
                  value={remoteName}
                  onChange={(e) => setRemoteName(e.target.value)}
                  placeholder="e.g., Living Room TV"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  value={remoteDescription}
                  onChange={(e) => setRemoteDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Device Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Device Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {deviceTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setDeviceType(type.value)}
                        className={cn(
                          "p-3 rounded-lg border transition-all flex flex-col items-center gap-1",
                          deviceType === type.value
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  // Reset form if not editing
                  if (!editingRemoteId) {
                    setRemoteName("");
                    setRemoteDescription("");
                    setDeviceType("TV");
                    setBrand("");
                    setModel("");
                  }
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemote}
                disabled={!remoteName.trim() || isSaving}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                  remoteName.trim() && !isSaving
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                )}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingRemoteId ? "Update" : "Save Remote"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component wrapped in Suspense
export default function PlaygroundPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      }
    >
      <PlaygroundContent />
    </Suspense>
  );
}
