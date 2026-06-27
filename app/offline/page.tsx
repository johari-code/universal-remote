"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="p-4 bg-zinc-900 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-zinc-600" />
        </div>

        <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
          You're Offline
        </h1>

        <p className="text-zinc-500 mb-8">
          Universal IR Remote needs an internet connection to sync with your
          devices and load your remotes.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>

        <p className="text-xs text-zinc-600 mt-8">
          Tip: Your recently used remotes may still work in offline mode
        </p>
      </div>
    </div>
  );
}
