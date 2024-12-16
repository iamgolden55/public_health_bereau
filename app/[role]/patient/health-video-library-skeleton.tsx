'use client'

import React from 'react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const SkeletonThumbnail = () => (
  <div className="flex-none w-[160px] h-[240px] bg-gray-800 rounded-md animate-pulse" />
)

const SkeletonSection = () => (
  <section className="px-4 py-4">
    <div className="h-8 w-48 bg-gray-800 rounded mb-4 animate-pulse" />
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonThumbnail key={i} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </section>
)

export default function HealthVideoLibrarySkeleton() {
  return (
    <div className="w-full bg-black text-white">
      <header className="p-4 flex items-center justify-between">
        <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-800 rounded animate-pulse" />
      </header>

      <div className="relative h-[70vh] w-full bg-gray-900 animate-pulse">
        <div className="absolute bottom-[20%] left-[5%] z-20 max-w-xl">
          <div className="h-12 w-3/4 bg-gray-800 rounded mb-4 animate-pulse" />
          <div className="h-6 w-1/2 bg-gray-800 rounded mb-4 animate-pulse" />
          <div className="h-8 w-1/3 bg-gray-800 rounded mb-6 animate-pulse" />
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-800 rounded animate-pulse" />
            <div className="h-12 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-16 pb-10 bg-black">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    </div>
  )
}