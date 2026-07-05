import Link from "next/link";
import { LayoutDashboard, Users, Settings, Search, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { requireRole } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b h-16 flex items-center">
          <h2 className="text-xl font-bold text-primary">LeadGenius</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/dashboard/lead-finder" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <Search className="w-4 h-4" /> Lead Finder
          </Link>
          <Link href="/dashboard/leads" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <Users className="w-4 h-4" /> Leads
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
      </aside>


      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <h2 className="text-xl font-bold text-primary">LeadGenius</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b h-16 flex items-center">
                <h2 className="text-xl font-bold text-primary">LeadGenius</h2>
              </div>
              <nav className="p-4 space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link href="/dashboard/lead-finder" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                  <Search className="w-4 h-4" /> Lead Finder
                </Link>
                <Link href="/dashboard/leads" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                  <Users className="w-4 h-4" /> Leads
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium">
                  <Settings className="w-4 h-4" /> Settings
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
