import { getPrisma } from "@/lib/prisma";
import { getAgencyDashboardMetrics } from "@/lib/agency-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Mail, 
  Send, 
  MessageSquare, 
  Heart, 
  Eye, 
  Award, 
  Globe, 
  Cpu, 
  TrendingUp 
} from "lucide-react";

export const revalidate = 0;

export default async function AgencyAnalyticsPage() {
  const prisma = getPrisma();
  const metrics = await getAgencyDashboardMetrics();

  // Query raw data to group countries and tech stack
  const agencies = await prisma.agency.findMany({
    select: {
      country: true,
      techStack: true,
      status: true
    }
  });

  // Calculate Country stats
  const countryCounts: Record<string, number> = {};
  agencies.forEach((a) => {
    const c = a.country || "Unknown";
    countryCounts[c] = (countryCounts[c] || 0) + 1;
  });

  const sortedCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate Tech stats
  const techCounts: Record<string, number> = {};
  agencies.forEach((a) => {
    (a.techStack || []).forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });

  const sortedTech = Object.entries(techCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Conversion rate (Client / Total)
  const conversionRate = metrics.totalAgencies > 0 
    ? ((metrics.clientsWon / metrics.totalAgencies) * 100).toFixed(1) 
    : "0.0";

  // Replied rate (Replies / Emails Sent)
  const repliedRate = metrics.emailsSent > 0
    ? ((metrics.replies / metrics.emailsSent) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
          CRM & Outreach Analytics
        </h1>
        <p className="text-slate-400 mt-1">
          Perform depth analysis on outreach metrics, country demographics, and conversions.
        </p>
      </div>

      {/* Conversion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0c1220]/60 border-slate-800 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase">Conversion Rate (Wins)</CardTitle>
            <Award className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100">{conversionRate}%</div>
            <p className="text-xs text-slate-500 mt-2">Percentage of won clients from all pipeline entries.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0c1220]/60 border-slate-800 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase">Response Rate</CardTitle>
            <MessageSquare className="w-5 h-5 text-teal-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100">{repliedRate}%</div>
            <p className="text-xs text-slate-500 mt-2">Replies relative to the total number of sent emails.</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0c1220]/60 border-slate-800 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-400 uppercase">Proposal Views Engagement</CardTitle>
            <Eye className="w-5 h-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-100">{metrics.proposalViews}</div>
            <p className="text-xs text-slate-500 mt-2">Total landing page partnership views across proposals.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Demographics */}
        <Card className="bg-[#0c1220]/50 border border-slate-800 p-6 rounded-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-base font-bold text-slate-200">Top Target Countries</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {sortedCountries.length === 0 ? (
              <p className="text-sm text-slate-550 py-6 text-center">No location demographics logged yet.</p>
            ) : (
              sortedCountries.map((c, index) => {
                const percentage = ((c.count / agencies.length) * 100).toFixed(0);
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span>{c.name}</span>
                      <span>{c.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Top Technologies */}
        <Card className="bg-[#0c1220]/50 border border-slate-800 p-6 rounded-xl backdrop-blur-md">
          <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-base font-bold text-slate-200">Top Technology Stacks</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {sortedTech.length === 0 ? (
              <p className="text-sm text-slate-550 py-6 text-center">No technology stack tags declared.</p>
            ) : (
              sortedTech.map((t, index) => {
                const totalTechCount = Object.values(techCounts).reduce((acc, cur) => acc + cur, 0);
                const percentage = totalTechCount > 0 ? ((t.count / totalTechCount) * 100).toFixed(0) : "0";
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span>{t.name}</span>
                      <span>{t.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
