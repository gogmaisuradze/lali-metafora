"use client"

import { GlobeSatellites } from "@/components/ui/cobe-globe-satellites"

export default function GlobeSatellitesDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-white p-8 overflow-hidden">
      <div className="w-full max-w-lg">
        <GlobeSatellites />
      </div>
    </div>
  )
}
