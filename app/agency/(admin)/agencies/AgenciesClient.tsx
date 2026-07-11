"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Search, 
  MapPin, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  ExternalLink, 
  Calendar,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getFilteredAgencies, importAgenciesFromCSV, scanAndUpdateAgencyWebsite } from "./actions";
import { deleteAgency } from "@/lib/agency-actions";

type AgencyItem = {
  id: string;
  name: string;
  website: string;
  contactName: string | null;
  email: string | null;
  linkedin: string | null;
  country: string | null;
  city: string | null;
  services: string[];
  techStack: string[];
  notes: string | null;
  status: string;
  slug: string;
  createdAt: Date;
};

const COUNTRIES = ["All", "United States", "United Kingdom", "Canada", "Germany", "Australia", "New Zealand"];
const STATUSES = ["All", "New", "Email Draft", "Email Sent", "Opened", "Replied", "Interested", "Proposal Viewed", "Client", "Closed"];

const SERVICES = [
  "White-label WordPress Development",
  "Elementor Development",
  "WooCommerce",
  "Website Redesign",
  "Website Maintenance",
  "Performance Optimization",
  "Figma to WordPress",
  "Headless WordPress",
  "Long-term Development Support"
];

export default function AgenciesClient({ initialAgencies }: { initialAgencies: AgencyItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [agencies, setAgencies] = useState<AgencyItem[]>(initialAgencies);
  const [scanningMap, setScanningMap] = useState<Record<string, boolean>>({});

  const handleWebsiteScan = async (id: string) => {
    setScanningMap(prev => ({ ...prev, [id]: true }));
    try {
      const res = await scanAndUpdateAgencyWebsite(id);
      if (res.success) {
        toast({
          title: "Scan & Update Complete",
          description: `Extracted new fields and saved updates.`
        });
        if (res.agency) {
          setAgencies(prev => prev.map(a => a.id === id ? { ...a, ...res.agency } as any : a));
        }
        router.refresh();
      } else {
        toast({
          title: "Scan Failed",
          description: res.error || "Could not retrieve details.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Scan Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setScanningMap(prev => ({ ...prev, [id]: false }));
    }
  };

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [country, setCountry] = useState("All");
  const [selectedService, setSelectedService] = useState("All");

  const [loadingImport, setLoadingImport] = useState(false);

  const fetchAgencies = async (currSearch: string, currStatus: string, currCountry: string, currService: string) => {
    startTransition(async () => {
      const filters: any = {
        search: currSearch || undefined,
        status: currStatus,
        country: currCountry,
        services: currService !== "All" ? [currService] : undefined
      };
      const results = await getFilteredAgencies(filters);
      setAgencies(results as any);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    fetchAgencies(val, status, country, selectedService);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatus(val);
    fetchAgencies(search, val, country, selectedService);
  };

  const handleCountryFilterChange = (val: string) => {
    setCountry(val);
    fetchAgencies(search, status, val, selectedService);
  };

  const handleServiceFilterChange = (val: string) => {
    setSelectedService(val);
    fetchAgencies(search, status, country, val);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agency? All proposal records and emails will be deleted.")) return;

    try {
      const res = await deleteAgency(id);
      if (res.success) {
        toast({ title: "Agency Deleted" });
        setAgencies((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        toast({ title: "Error", description: "Failed to delete agency.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingImport(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const res = await importAgenciesFromCSV(text);
        if (res.success) {
          toast({
            title: "CSV Import Success",
            description: `Successfully imported ${res.count} web design agencies and generated initial outreach drafts.`
          });
          const fresh = await getFilteredAgencies({});
          setAgencies(fresh as any);
          router.refresh();
        } else {
          toast({ title: "Import Failed", description: res.error, variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Error Parsing CSV", description: err.message, variant: "destructive" });
      } finally {
        setLoadingImport(false);
      }
    };
    reader.readAsText(file);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Website", "Contact Name", "Email", "LinkedIn", "Country", "City", "Services", "Tech Stack", "Status", "Proposal Link"];
    const rows = agencies.map((a) => [
      `"${a.name.replace(/"/g, '""')}"`,
      `"${a.website}"`,
      `"${(a.contactName || "").replace(/"/g, '""')}"`,
      `"${a.email || ""}"`,
      `"${a.linkedin || ""}"`,
      `"${a.country || ""}"`,
      `"${a.city || ""}"`,
      `"${a.services.join("; ")}"`,
      `"${a.techStack.join("; ")}"`,
      `"${a.status}"`,
      `"${window.location.origin}/agency/proposal/${a.slug}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `agencies_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Agencies Pipeline
          </h1>
          <p className="text-slate-500 mt-1">
            Manage, filter, import/export, and track agency partnership proposals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer">
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleImportCSV} 
              disabled={loadingImport}
            />
            <Button variant="outline" size="sm" asChild className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
              <span>
                {loadingImport ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-1.5 text-blue-600" />
                )}
                Import CSV
              </span>
            </Button>
          </label>

          <Button variant="outline" size="sm" onClick={exportToCSV} className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
            <Download className="w-4 h-4 mr-1.5 text-green-600" /> Export CSV
          </Button>

          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Link href="/agency/agencies/new">
              <Plus className="w-4 h-4 mr-1.5" /> Add Agency
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Agency, email, website..."
              className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">Status</Label>
          <Select onValueChange={handleStatusFilterChange} defaultValue={status}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800">
              {STATUSES.map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">Country</Label>
          <Select onValueChange={handleCountryFilterChange} defaultValue={country}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800">
              {COUNTRIES.map((co) => (
                <SelectItem key={co} value={co}>{co}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">Service Filter</Label>
          <Select onValueChange={handleServiceFilterChange} defaultValue={selectedService}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800">
              <SelectItem value="All">All Services</SelectItem>
              {SERVICES.map((se) => (
                <SelectItem key={se} value={se}>{se}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agencies List Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isPending ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
          </div>
        ) : agencies.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No web design agencies found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-750">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Agency</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Services</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{agency.name}</div>
                      <a 
                        href={agency.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1.5 mt-0.5"
                      >
                        {agency.website.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800 font-semibold">{agency.contactName || "—"}</div>
                      <div className="text-xs text-slate-450">{agency.email || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-650">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{agency.city ? `${agency.city}, ` : ""}{agency.country || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[280px]">
                        {agency.services.slice(0, 2).map((s) => (
                          <span key={s} className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                        {agency.services.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-semibold self-center">
                            +{agency.services.length - 2} more
                          </span>
                        )}
                        {agency.services.length === 0 && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        agency.status === "Client" ? "bg-emerald-50 text-emerald-700 border border-emerald-250" :
                        agency.status === "Interested" ? "bg-rose-55 text-rose-700 border border-rose-250" :
                        agency.status === "Proposal Viewed" ? "bg-indigo-50 text-indigo-700 border border-indigo-250" :
                        agency.status === "Email Sent" ? "bg-green-55 text-green-700 border border-green-250" :
                        agency.status === "Email Draft" ? "bg-amber-50 text-amber-700 border border-amber-250" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {agency.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={scanningMap[agency.id]}
                          onClick={() => handleWebsiteScan(agency.id)} 
                          className="text-emerald-605 hover:text-emerald-700 hover:bg-emerald-50 h-8 font-medium"
                        >
                          {scanningMap[agency.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500" />}
                          Scan
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="text-indigo-650 hover:text-indigo-700 hover:bg-indigo-50 h-8">
                          <Link href={`/agency/agencies/${agency.id}`}>
                            Details
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(agency.id)} 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
