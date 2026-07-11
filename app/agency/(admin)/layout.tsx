import Link from "next/link";
import { 
  LayoutDashboard, 
  Building2, 
  PlusCircle, 
  FileText, 
  Send, 
  CalendarClock, 
  BarChart3, 
  Settings as SettingsIcon,
  Menu,
  Sparkles
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";

export default async function AgencyAdminLayout({ children }: { children: React.ReactNode }) {
  // Ensure the user is an admin
  await requireRole("ADMIN");

  const sidebarLinks = [
    { href: "/agency/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agency/agencies", label: "Agencies", icon: Building2 },
    { href: "/agency/agencies/new", label: "Add Agency", icon: PlusCircle },
    { href: "/agency/templates", label: "Email Templates", icon: FileText },
    { href: "/agency/emails", label: "Sent Emails", icon: Send },
    { href: "/agency/followups", label: "Follow Ups", icon: CalendarClock },
    { href: "/agency/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/agency/settings", label: "Settings", icon: SettingsIcon }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar for Desktop */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200 h-16 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-655 animate-pulse" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Agency Outreach
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 text-xs text-slate-400 text-center">
          CoreWebLabs CRM v1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden bg-slate-50">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Agency Outreach
            </h2>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-800 border border-slate-200 bg-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-white border-r border-slate-200 text-slate-800">
              <div className="p-6 border-b border-slate-200 h-16 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Agency Outreach
                </h2>
              </div>
              <nav className="p-4 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 text-slate-650 hover:text-slate-900 transition-all text-sm font-medium"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      {link.label}
                    </Link>
                  );
                })}
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
