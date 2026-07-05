import { getSearchLimitStats, getFinderLeads, getSearchSettings } from "./actions";
import { getTemplates } from "../actions";
import LeadFinderClient from "./LeadFinderClient";

export default async function LeadFinderPage() {
  // Parallelize server-side data fetching to prevent loading waterfalls
  const [limitStats, finderLeads, searchSettings, templates] = await Promise.all([
    getSearchLimitStats().catch(() => ({
      googleUsed: 0,
      googleRemaining: 40,
      googleLimit: 40,
      serpUsed: 0,
      serpRemaining: 40,
      serpLimit: 40,
      searchProviderMode: "Auto",
    })),
    getFinderLeads().catch(() => []),
    getSearchSettings().catch(() => null),
    getTemplates().catch(() => []),
  ]);

  return (
    <LeadFinderClient
      initialStats={limitStats}
      initialFinderLeads={finderLeads}
      initialSearchSettings={searchSettings}
      initialTemplates={templates}
    />
  );
}
