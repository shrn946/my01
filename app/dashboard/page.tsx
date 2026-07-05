import { getDashboardStats, getLeads, getMediaAssetsAction } from "./actions";
import { getFinderLeads } from "./lead-finder/actions";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Parallelize server-side fetching to instantly load data
  const [statsData, mediaData, allLeads, finderLeads] = await Promise.all([
    getDashboardStats().catch(() => ({
      searchesUsed: 0,
      remainingSearches: 40,
      totalLeads: 0,
      leadsSaved: 0,
      emailsSent: 0,
    })),
    getMediaAssetsAction().catch(() => []),
    getLeads().catch(() => []),
    getFinderLeads().catch(() => []),
  ]);

  return (
    <DashboardClient
      initialStats={statsData}
      initialRecentLeads={allLeads.slice(0, 5)}
      initialFinderLeads={finderLeads.slice(0, 10)}
      initialMedia={mediaData}
    />
  );
}
