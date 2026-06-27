// app/(authenticated)/remotes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import { Remote } from "@/lib/supabase/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tv,
  Wind,
  Music,
  Wifi,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RemotesPage() {
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRemote, setSelectedRemote] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadRemotes();
    }
  }, [user]);

  const loadRemotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("remotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRemotes(data || []);
    } catch (error: any) {
      console.error("Error loading remotes:", error);
      toast.error("Failed to load remotes");
    } finally {
      setLoading(false);
    }
  };

  const deleteRemote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this remote?")) return;

    try {
      const { error } = await supabase
        .from("remotes")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;

      setRemotes(remotes.filter((r) => r.id !== id));
      toast.success("Remote deleted");
    } catch (error: any) {
      console.error("Error deleting remote:", error);
      toast.error("Failed to delete remote");
    }
  };

  const duplicateRemote = async (remote: Remote) => {
    if (!user) return;

    try {
      // First, get the original remote's button configurations
      const { data: originalButtons, error: buttonsError } = await supabase
        .from("remote_buttons")
        .select("*")
        .eq("remote_id", remote.id);

      if (buttonsError) throw buttonsError;

      // Create the duplicate remote
      const { data, error } = await supabase
        .from("remotes")
        .insert({
          user_id: user.id,
          name: `${remote.name} (Copy)`,
          description: remote.description,
          device_type: remote.device_type,
          brand: remote.brand,
          model: remote.model,
          layout: remote.layout,
        })
        .select()
        .single();

      if (error) throw error;

      // If there are button configurations, duplicate them too
      if (data && originalButtons && originalButtons.length > 0) {
        const newButtons = originalButtons.map((btn) => ({
          remote_id: data.id,
          button_id: btn.button_id,
          button_type: btn.button_type,
          hex_code: btn.hex_code,
          protocol: btn.protocol,
          frequency: btn.frequency,
        }));

        await supabase.from("remote_buttons").insert(newButtons);
      }

      setRemotes([data, ...remotes]);
      toast.success("Remote duplicated");
    } catch (error: any) {
      console.error("Error duplicating remote:", error);
      toast.error("Failed to duplicate remote");
    }
  };

  const editRemote = (remoteId: string) => {
    router.push(`/playground?edit=${remoteId}`);
  };

  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case "TV":
        return <Tv className="w-5 h-5" />;
      case "AC":
        return <Wind className="w-5 h-5" />;
      case "Audio":
        return <Music className="w-5 h-5" />;
      case "STB":
        return <Wifi className="w-5 h-5" />;
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500">Loading remotes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold text-zinc-100">
            Universal IR Remote
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/playground"
              className="text-sm text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Playground
            </Link>
            <Link href="/remotes" className="text-sm text-zinc-100">
              My Remotes
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">My Remotes</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage and control your saved remotes
            </p>
          </div>
          <Link
            href="/playground"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Remote
          </Link>
        </div>

        {/* Remotes Grid */}
        {remotes.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800 rounded-lg p-12 text-center">
            <Smartphone className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-400 mb-2">
              No remotes yet
            </h3>
            <p className="text-sm text-zinc-600 mb-6">
              Create your first remote control in the playground
            </p>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Go to Playground
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {remotes.map((remote) => (
              <div
                key={remote.id}
                className={cn(
                  "group bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all",
                  selectedRemote === remote.id && "border-blue-600",
                )}
              >
                {/* Remote Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                      {getDeviceIcon(remote.device_type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-zinc-100">
                        {remote.name}
                      </h3>
                      {remote.brand && (
                        <p className="text-xs text-zinc-500">
                          {remote.brand} {remote.model}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {remote.description && (
                  <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                    {remote.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-zinc-600 mb-4">
                  <span>{remote.layout.items.length} buttons</span>
                  <span>•</span>
                  <span>
                    {new Date(remote.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/remotes/${remote.id}`}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors text-center"
                  >
                    Control
                  </Link>
                  <button
                    onClick={() => editRemote(remote.id)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <button
                    onClick={() => duplicateRemote(remote)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                  <button
                    onClick={() => deleteRemote(remote.id)}
                    className="p-1.5 bg-zinc-800 hover:bg-red-900 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
