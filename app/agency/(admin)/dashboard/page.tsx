import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Send, 
  MessageSquare, 
  Heart, 
  Eye, 
  Award, 
  AlertCircle,
  Plus,
  FileCode,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { getAgencyDashboardMetrics } from "@/lib/agency-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AgencyDashboardPage() {
  const metrics = await getAgencyDashboardMetrics();

  const cards = [
    { title: "Agencies Added", value: metrics.totalAgencies, icon: Building2, color: "text-blue-600", bg: "bg-blue-50", border: "border-slate-200" },
    { title: "Emails Drafted", value: metrics.emailsDrafted, icon: Mail, color: "text-amber-600", bg: "bg-amber-50", border: "border-slate-200" },
    { title: "Emails Sent", value: metrics.emailsSent, icon: Send, color: "text-green-600", bg: "bg-green-50", border: "border-slate-200" },
    { title: "Replies", value: metrics.replies, icon: MessageSquare, color: "text-teal-600", bg: "bg-teal-50", border: "border-slate-200" },
    { title: "Interested", value: metrics.interested, icon: Heart, color: "text-rose-600", bg: "bg-rose-50", border: "border-slate-200" },
    { title: "Proposal Views", value: metrics.proposalViews, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-slate-200" },
    { title: "Clients Won", value: metrics.clientsWon, icon: Award, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-slate-200" },
    { title: "Follow-ups Due", value: metrics.followupsDue, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-slate-200" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Agency Outreach CRM
          </h1>
          <p className="text-slate-500 mt-1">
            Grow your white-label partnership pipeline. Monitor templates, campaigns, and stats.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/10">
            <Link href="/agency/agencies/new">
              <Plus className="w-4 h-4 mr-1.5" /> Add Agency
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`bg-white border ${card.border} shadow-sm transition-all hover:translate-y-[-2px] hover:shadow-md`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Grid: Lists & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Agencies */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Recent Agencies
            </CardTitle>
            <Link href="/agency/agencies" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4 px-0">
            {metrics.recentAgencies.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">
                No agencies added yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {metrics.recentAgencies.map((agency) => (
                  <div key={agency.id} className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50 transition-colors">
                    <div>
                      <Link href={`/agency/agencies/${agency.id}`} className="font-semibold text-sm text-slate-800 hover:text-indigo-600 block transition-colors">
                        {agency.name}
                      </Link>
                      <span className="text-xs text-slate-400">{agency.website}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        agency.status === "Client" ? "bg-emerald-50 text-emerald-700 border border-emerald-250" :
                        agency.status === "Interested" ? "bg-rose-50 text-rose-700 border border-rose-250" :
                        agency.status === "Proposal Viewed" ? "bg-indigo-50 text-indigo-700 border border-indigo-250" :
                        agency.status === "Email Sent" ? "bg-green-55 text-green-700 border border-green-250" :
                        agency.status === "Email Draft" ? "bg-amber-50 text-amber-700 border border-amber-250" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {agency.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Upcoming Follow-ups */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 gap-2">
              <Button asChild variant="outline" className="w-full justify-start text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                <Link href="/agency/agencies/new">
                  <Plus className="w-4 h-4 mr-2.5 text-blue-600" /> Add New Agency
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                <Link href="/agency/templates">
                  <FileCode className="w-4 h-4 mr-2.5 text-indigo-600" /> Create Template
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                <Link href="/agency/emails">
                  <Send className="w-4 h-4 mr-2.5 text-green-600" /> Draft or Send Email
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Followups */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-rose-600" /> Follow-ups Due
              </CardTitle>
              <Link href="/agency/followups" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              {metrics.upcomingFollowups.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">
                  No upcoming follow-ups!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {metrics.upcomingFollowups.map((fu) => (
                    <div key={fu.id} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <Link href={`/agency/agencies/${fu.agency.id}`} className="font-semibold text-xs text-slate-800 hover:text-indigo-600">
                          {fu.agency.name}
                        </Link>
                        <span className="text-[10px] text-red-600 font-mono font-semibold">
                          {new Date(fu.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{fu.notes || "No notes added."}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
