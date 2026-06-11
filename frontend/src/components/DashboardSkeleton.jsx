import React from "react";
import { PageTransition } from "./ui/PageTransition";

function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-transparent bg-background p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-16 bg-background rounded animate-pulse" />
          <div className="h-5 w-24 bg-background/[0.08] rounded animate-pulse" />
        </div>
      </div>
      <div className="h-3 w-20 bg-background rounded animate-pulse" />
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="rounded-2xl border border-transparent bg-background p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-background animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-background rounded animate-pulse" />
          <div className="h-8 w-40 bg-background/[0.08] rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-32 bg-background rounded animate-pulse" />
        <div className="h-3 w-48 bg-background rounded animate-pulse" />
      </div>
    </div>
  );
}

function HoldingsTableSkeleton() {
  return (
    <div className="rounded-2xl border border-transparent bg-background shadow-elevation-md overflow-hidden">
      <div className="bg-background/20 border-b border-transparent px-6 py-4 flex gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-3 w-16 bg-background rounded animate-pulse" />
        ))}
      </div>
      <div className="divide-y divide-hairline-on-dark">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-background animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3 w-16 bg-background rounded animate-pulse" />
                <div className="h-2 w-12 bg-background rounded animate-pulse" />
              </div>
            </div>
            <div className="h-3 w-20 bg-background rounded animate-pulse" />
            <div className="h-3 w-20 bg-background rounded animate-pulse" />
            <div className="h-3 w-12 bg-background rounded animate-pulse" />
            <div className="h-3 w-12 bg-background rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-2 bg-background border border-transparent rounded-2xl p-4">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className="w-5 h-5 rounded bg-background animate-pulse" />
          <div className="h-3 w-20 bg-background rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function UserHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-background border border-transparent rounded-2xl p-6">
      <div className="w-14 h-14 rounded-full bg-background animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-40 bg-background/[0.08] rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="h-3 w-24 bg-background rounded animate-pulse" />
          <div className="h-3 w-24 bg-background rounded animate-pulse" />
        </div>
      </div>
      <div className="flex gap-6">
        <div className="space-y-1 text-right">
          <div className="h-2 w-8 bg-background rounded animate-pulse" />
          <div className="h-4 w-8 bg-background/[0.08] rounded animate-pulse" />
        </div>
        <div className="space-y-1 text-right border-l border-transparent pl-6">
          <div className="h-2 w-8 bg-background rounded animate-pulse" />
          <div className="h-4 w-8 bg-background/[0.08] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-3">
            <SidebarSkeleton />
          </div>

          {/* Main content */}
          <div className="lg:col-span-9 space-y-6" aria-busy="true" aria-label="Loading dashboard">
            {/* User header skeleton */}
            <UserHeaderSkeleton />

            {/* Balance skeleton */}
            <BalanceSkeleton />

            {/* Holdings table skeleton */}
            <HoldingsTableSkeleton />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}