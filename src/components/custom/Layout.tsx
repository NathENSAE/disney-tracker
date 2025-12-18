import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar is fixed on mobile, handled by its own component, 
          but usually we want a spacer or margin-left on desktop if it's fixed. 
          Or we can make it a flex item. Let's make it a flex item for desktop. */}

      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden transition-all duration-300 ease-in-out md:ml-20">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
