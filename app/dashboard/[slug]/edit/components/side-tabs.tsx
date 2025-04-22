'use client';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SideTabsProps {
  tabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SideTabs({ tabs, activeTab, onTabChange }: SideTabsProps) {
  return (
    <div className="w-64 border-r h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-1 p-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              activeTab === tab.id && "bg-secondary"
            )}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
