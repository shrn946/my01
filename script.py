import re

file_path = 'app/dashboard/lead-finder/actions.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update canUseSerpApiSearch to include other canUse functions
can_use_serp_api = '''export async function canUseSerpApiSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.serpApiSearchEnabled) return false;

    const apiKey = settings.serpApiKey || process.env.SERP_API_KEY;
    if (!apiKey) return false;

    const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.serpCount || 0;
    return count < settings.serpApiSearchLimit;
  } catch (error) {
    return false;
  }
}'''

new_can_use_functions = can_use_serp_api + '''

export async function canUseTomTomSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.tomTomEnabled) return false;

    const apiKey = settings.tomTomApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.tomTomCount || 0;
    return count < settings.tomTomSearchLimit;
  } catch (error) {
    return false;
  }
}

export async function canUseYelpSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.yelpEnabled) return false;

    const apiKey = settings.yelpApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.yelpCount || 0;
    return count < settings.yelpSearchLimit;
  } catch (error) {
    return false;
  }
}

export async function canUseApolloSearch(): Promise<boolean> {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings || !settings.apolloEnabled) return false;

    const apiKey = settings.apolloApiKey;
    if (!apiKey) return false;

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const count = usage?.apolloCount || 0;
    return count < settings.apolloSearchLimit;
  } catch (error) {
    return false;
  }
}'''

content = content.replace(can_use_serp_api, new_can_use_functions)

# 2. Update incrementSearchUsage
old_increment = '''export async function incrementSearchUsage(provider: "google" | "serpapi") {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    if (provider === "google") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { googleCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 1, serpCount: 0 }
      });
    } else if (provider === "serpapi") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { serpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 1 }
      });
    }
    return true;
  } catch (error) {
    console.error("INCREMENT_SEARCH_USAGE_ERROR:", error);
    return false;
  }
}'''

new_increment = '''export async function incrementSearchUsage(provider: "google" | "serpapi" | "tomtom" | "yelp" | "apollo") {
  const prisma = getPrisma();
  const todayStr = getTodayString();
  try {
    if (provider === "google") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { googleCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 1, serpCount: 0, tomTomCount: 0, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "serpapi") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { serpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 1, tomTomCount: 0, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "tomtom") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { tomTomCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 1, yelpCount: 0, apolloCount: 0 }
      });
    } else if (provider === "yelp") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { yelpCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 0, yelpCount: 1, apolloCount: 0 }
      });
    } else if (provider === "apollo") {
      await prisma.searchUsage.upsert({
        where: { date: todayStr },
        update: { apolloCount: { increment: 1 } },
        create: { date: todayStr, googleCount: 0, serpCount: 0, tomTomCount: 0, yelpCount: 0, apolloCount: 1 }
      });
    }
    return true;
  } catch (error) {
    console.error("INCREMENT_SEARCH_USAGE_ERROR:", error);
    return false;
  }
}'''

content = content.replace(old_increment, new_increment)

# 3. Update getSearchProvider
old_get_provider = '''export async function getSearchProvider(): Promise<"google" | "serpapi" | "none"> {
  const prisma = getPrisma();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const mode = settings?.searchProviderMode || "Auto";

    const googleAllowed = await canUseGoogleSearch();
    const serpAllowed = await canUseSerpApiSearch();

    if (mode === "Google Only") {
      return googleAllowed ? "google" : "none";
    }
    if (mode === "SerpAPI Only") {
      return serpAllowed ? "serpapi" : "none";
    }

    // Auto Mode Logic (Google -> SerpAPI Fallback)
    if (googleAllowed) return "google";
    if (serpAllowed) return "serpapi";

    return "none";
  } catch (error) {
    return "none";
  }
}'''

new_get_provider = '''export async function getSearchProvider(): Promise<"google" | "serpapi" | "tomtom" | "yelp" | "apollo" | "none"> {
  const prisma = getPrisma();
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    const mode = settings?.searchProviderMode || "Auto";

    const googleAllowed = await canUseGoogleSearch();
    const serpAllowed = await canUseSerpApiSearch();
    const tomTomAllowed = await canUseTomTomSearch();
    const yelpAllowed = await canUseYelpSearch();
    const apolloAllowed = await canUseApolloSearch();

    if (mode === "Google Only") return googleAllowed ? "google" : "none";
    if (mode === "SerpAPI Only") return serpAllowed ? "serpapi" : "none";
    if (mode === "TomTom Only") return tomTomAllowed ? "tomtom" : "none";
    if (mode === "Yelp Only") return yelpAllowed ? "yelp" : "none";
    if (mode === "Apollo Only") return apolloAllowed ? "apollo" : "none";

    // Auto Mode Logic
    if (googleAllowed) return "google";
    if (serpAllowed) return "serpapi";
    if (tomTomAllowed) return "tomtom";
    if (yelpAllowed) return "yelp";
    if (apolloAllowed) return "apollo";

    return "none";
  } catch (error) {
    return "none";
  }
}'''

content = content.replace(old_get_provider, new_get_provider)

# 4. Add query functions after querySerpApiSearch
old_query_serp_end = '''  const data = await res.json();
  const organicResults = data.organic_results || [];
  return organicResults.map((item: any) => ({
    title: item.title,
    link: item.link,
    snippet: item.snippet
  }));
}'''

new_queries = old_query_serp_end + '''

async function queryTomTomSearch(query: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.tomTomApiKey;

  if (!apiKey) throw new Error("TomTom API key is missing.");

  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${encodeURIComponent(apiKey)}&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TomTom returned status ${res.status}`);

  const data = await res.json();
  const results = data.results || [];
  return results.map((item: any) => ({
    title: item.poi?.name || "Unknown Business",
    link: item.poi?.url || item.poi?.phone || "",
    snippet: item.address?.freeformAddress || ""
  }));
}

async function queryYelpSearch(query: string, location: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.yelpApiKey;

  if (!apiKey) throw new Error("Yelp API key is missing.");

  const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&limit=${limit}`;
  const res = await fetch(url, { 
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store" 
  });
  if (!res.ok) throw new Error(`Yelp returned status ${res.status}`);

  const data = await res.json();
  const businesses = data.businesses || [];
  return businesses.map((item: any) => ({
    title: item.name || "Unknown Business",
    link: item.url || "",
    snippet: item.location?.display_address?.join(", ") || ""
  }));
}

async function queryApolloSearch(query: string, limit: number = 10) {
  const prisma = getPrisma();
  const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });
  const apiKey = settings?.apolloApiKey;

  if (!apiKey) throw new Error("Apollo API key is missing.");

  const url = `https://api.apollo.io/api/v1/mixed_people/search`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      q_keywords: query,
      per_page: limit
    }),
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`Apollo returned status ${res.status}`);

  const data = await res.json();
  const people = data.people || [];
  return people.map((item: any) => ({
    title: item.organization?.name || item.name || "Unknown Business",
    link: item.organization?.website_url || "",
    snippet: item.title || ""
  }));
}'''

content = content.replace(old_query_serp_end, new_queries)

# 5. Update searchAndAnalyzeLeads routing logic
old_search_logic = '''    let searchItems: any[] = [];
    let activeProvider: "google" | "serpapi" = "google";

    const usage = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });

    const randomPage = Math.floor(Math.random() * 5); // 0 to 4 (page 1 to 5)

    if (provider === "google") {'''

new_search_logic = '''    let searchItems: any[] = [];
    let activeProvider: string = "google";

    const usage: any = await prisma.searchUsage.findUnique({ where: { date: todayStr } });
    const settings: any = await prisma.settings.findUnique({ where: { id: "default" } });

    const randomPage = Math.floor(Math.random() * 5); // 0 to 4 (page 1 to 5)

    if (provider === "tomtom") {
      try {
        console.log("Searching TomTom...");
        searchItems = await queryTomTomSearch(searchQuery, maxResults);
        await incrementSearchUsage("tomtom");
        activeProvider = "tomtom";
      } catch (err: any) {
        console.error("TomTom request failed:", err);
        throw err;
      }
    } else if (provider === "yelp") {
      try {
        console.log("Searching Yelp...");
        searchItems = await queryYelpSearch(niche, searchLocation, maxResults);
        await incrementSearchUsage("yelp");
        activeProvider = "yelp";
      } catch (err: any) {
        console.error("Yelp request failed:", err);
        throw err;
      }
    } else if (provider === "apollo") {
      try {
        console.log("Searching Apollo...");
        searchItems = await queryApolloSearch(searchQuery, maxResults);
        await incrementSearchUsage("apollo");
        activeProvider = "apollo";
      } catch (err: any) {
        console.error("Apollo request failed:", err);
        throw err;
      }
    } else if (provider === "google") {'''

content = content.replace(old_search_logic, new_search_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS!")
