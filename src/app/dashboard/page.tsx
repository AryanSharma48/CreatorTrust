"use client";

import { Suspense } from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="w-full relative min-h-[100vh]">
        <div className="flex h-full items-center justify-center mt-32">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xl font-medium text-muted-foreground animate-pulse">Initializing Dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
