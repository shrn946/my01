"use client";

import { useState, type ReactNode } from "react";
import { FileText, FolderKanban, Image as ImageIcon, LayoutDashboard, MessageSquare, MonitorUp, Settings, Star, Users } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const tabIcons: Record<string, ReactNode> = {
  Overview: <LayoutDashboard size={16} />,
  Settings: <Settings size={16} />,
  Slider: <MonitorUp size={16} />,
  Media: <ImageIcon size={16} />,
  Users: <Users size={16} />,
  Projects: <FolderKanban size={16} />,
  Blog: <FileText size={16} />,
  Reviews: <Star size={16} />,
  Messages: <MessageSquare size={16} />
};

export function AdminTabs({ tabs }: { tabs: { label: string; children: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.label ?? "");

  return (
    <div className="mt-8">
      <div className="mb-10 overflow-x-auto rounded-2xl border border-black/5 bg-white p-1.5 shadow-soft">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const selected = active === tab.label;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActive(tab.label)}
                className={cn(
                  "relative inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all",
                  selected ? "text-white" : "text-slate-500 hover:text-ink hover:bg-slate-50"
                )}
              >
                {selected && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-primary shadow-lg shadow-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tabIcons[tab.label]}</span>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-12">
        {tabs.map((tab) => (
          <section key={tab.label} hidden={active !== tab.label}>
            {tab.children}
          </section>
        ))}
      </div>
    </div>
  );
}
