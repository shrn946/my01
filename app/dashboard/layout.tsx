import Link from "next/link";
import { LayoutDashboard, Users, Settings } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
