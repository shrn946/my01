"use client";

import { useState, useEffect } from "react";
import { 
  getLeads, 
  bulkUpdateLeadStatus, 
  bulkDeleteLeads,
  updateLeadStatus,
  updateLeadEmail,
  updateLeadCategory,
  bulkUpdateLeadCategory,
  getTemplates,
  sendLeadEmailFromDashboard,
  deleteLead,
  getLeadStats
} from "../actions";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  Trash2, 
  Mail, 
  Eye, 
  Filter,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Globe,
  Phone,
  MapPin,
  Send,
  History,
  RefreshCcw,
  Save,
  Monitor,
  Smartphone,
  Loader2,
  X,
  ExternalLink,
  Edit3,
  Zap,
  ArrowRight,
  AlertCircle,
  Users,
  Tag,
  ArrowUpDown,
  MailQuestion,
  Check
} from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Dentist", "Lawyer", "Restaurant", "Real Estate", "Plumber", "Electrician", 
  "Roofing", "Medical Clinic", "Fitness Gym", "E-commerce", "Marketing Agency", 
  "Web Design Agency", "Accounting", "Insurance", "Automotive", "Other"
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Sorting states
  const [sortBy, setSortBy] = useState<"createdAt" | "businessName" | "websiteScore" | "leadScore">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  
  // Stats state
  const [stats, setStats] = useState({
    totalLeads: 0,
    withEmail: 0,
    withoutEmail: 0,
    categoryCounts: {} as Record<string, number>,
    recentlyAdded: 0
  });

  // Email states
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false);

  // Pagination & Deletion states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Floating Bulk Actions states
  const [bulkStatusToApply, setBulkStatusToApply] = useState("");
  const [bulkCategoryToApply, setBulkCategoryToApply] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchLeadsAndStats();
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, pageSize]);

  const fetchLeadsAndStats = async () => {
    setIsLoading(true);
    try {
      const leadsData = await getLeads({ 
        search, 
        status: statusFilter, 
        category: categoryFilter 
      });
      setLeads(Array.isArray(leadsData) ? leadsData : []);
      
      const statsData = await getLeadStats();
      setStats(statsData);
      
      const templatesData = await getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Failed to fetch leads or stats:", error);
      toast({
        title: "Error",
        description: "Could not load leads database. Please try again.",
        variant: "destructive",
      });
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && selectedLead) {
      let subject = template.subject
        .replace(/{businessName}/gi, selectedLead.businessName || "")
        .replace(/{website}/gi, selectedLead.website || "");

      let body = template.body
        .replace(/{businessName}/gi, selectedLead.businessName || "")
        .replace(/{website}/gi, selectedLead.website || "")
        .replace(/{phone}/gi, selectedLead.phone || "")
        .replace(/{address}/gi, selectedLead.address || "")
        .replace(/{score}/gi, (selectedLead.websiteScore || 0).toString())
        .replace(/{performanceScore}/gi, (selectedLead.performanceScore || selectedLead.pageSpeedPerformance || 0).toString())
        .replace(/{seoScore}/gi, (selectedLead.seoScore || selectedLead.pageSpeedSeo || 0).toString())
        .replace(/{accessibilityScore}/gi, (selectedLead.accessibilityScore || selectedLead.pageSpeedAccessibility || 0).toString())
        .replace(/{bestPracticesScore}/gi, (selectedLead.bestPracticesScore || selectedLead.pageSpeedBestPractices || 0).toString());
      
      setEmailSubject(subject);
      setEmailBody(body);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast({ title: "No Email", description: "Recipient email is required.", variant: "destructive" });
      return;
    }
    
    setIsSending(true);
    const res = await sendLeadEmailFromDashboard(
      selectedLead.id,
      emailSubject,
      emailBody,
      recipientEmail.trim()
    );
    
    if (res.success) {
      toast({ title: "Email Sent", description: "Proposal has been sent successfully." });
      setShowEmailSection(false);
      fetchLeadsAndStats();
    } else {
      toast({ title: "Failed", description: res.error, variant: "destructive" });
    }
    setIsSending(false);
  };

  const handleUpdateEmail = async () => {
    if (!recipientEmail || !selectedLead) return;
    setIsUpdatingEmail(true);
    const res = await updateLeadEmail(selectedLead.id, recipientEmail.trim());
    if (res.success) {
      toast({ title: "Email Updated", description: "Lead's email address has been saved." });
      setSelectedLead((prev: any) => ({ ...prev, email: recipientEmail.trim() }));
      fetchLeadsAndStats();
    } else {
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
    setIsUpdatingEmail(false);
  };

  const handleUpdateCategory = async (cat: string) => {
    if (!selectedLead) return;
    setIsUpdatingCategory(true);
    const res = await updateLeadCategory(selectedLead.id, cat);
    if (res.success) {
      toast({ title: "Category Updated", description: "Lead's category has been updated." });
      setSelectedLead((prev: any) => ({ ...prev, category: cat }));
      fetchLeadsAndStats();
    } else {
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
    setIsUpdatingCategory(false);
  };

  const handleExport = () => {
    const dataToExport = leads.map(lead => ({
      "Business Name": lead.businessName,
      "Website": lead.website,
      "Email": lead.email,
      "Phone": lead.phone,
      "Address": lead.address,
      "Category": lead.category || "Other",
      "Website Score": lead.websiteScore,
      "Lead Score": lead.leadScore,
      "Status": lead.status,
      "Created Date": format(new Date(lead.createdAt), "yyyy-MM-dd")
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads-export-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
    toast({ title: "Exported", description: "Leads exported to Excel successfully." });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(i => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedLeads.length === 0 || !status) return;
    const res = await bulkUpdateLeadStatus(selectedLeads, status);
    if (res.success) {
      toast({ title: "Updated", description: `Marked ${selectedLeads.length} leads as ${status}.` });
      fetchLeadsAndStats();
      setSelectedLeads([]);
      setBulkStatusToApply("");
    }
  };

  const handleBulkCategory = async (cat: string) => {
    if (selectedLeads.length === 0 || !cat) return;
    const res = await bulkUpdateLeadCategory(selectedLeads, cat);
    if (res.success) {
      toast({ title: "Updated", description: `Updated ${selectedLeads.length} leads to category ${cat}.` });
      fetchLeadsAndStats();
      setSelectedLeads([]);
      setBulkCategoryToApply("");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handlePerformBulkDelete = async () => {
    setIsBulkDeleting(true);
    const res = await bulkDeleteLeads(selectedLeads);
    if (res.success) {
      toast({ title: "Leads Deleted", description: `${selectedLeads.length} leads have been permanently removed.` });
      setShowBulkDeleteConfirm(false);
      fetchLeadsAndStats();
      setSelectedLeads([]);
    } else {
      toast({ title: "Bulk Delete Failed", description: res.error || "An error occurred.", variant: "destructive" });
    }
    setIsBulkDeleting(false);
  };

  const handleDeleteLead = async (leadId: string) => {
    setIsDeleting(true);
    const res = await deleteLead(leadId);
    if (res.success) {
      toast({ title: "Lead Deleted", description: "The lead has been permanently removed." });
      setDeleteConfirmLeadId(null);
      fetchLeadsAndStats();
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    } else {
      toast({ title: "Delete Failed", description: res.error || "An error occurred.", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hot Lead": return <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Hot Lead</Badge>;
      case "Warm Lead": return <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Warm Lead</Badge>;
      case "Good Website": return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Good Website</Badge>;
      case "Email Later": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Email Later</Badge>;
      case "Contacted": return <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Contacted</Badge>;
      case "Won": return <Badge className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">Won</Badge>;
      default: return <Badge variant="outline" className="font-bold px-2.5 py-0.5 rounded-full text-[10px]">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
    if (score >= 50) return "text-amber-500 border-amber-500/20 bg-amber-500/10";
    return "text-red-500 border-red-500/20 bg-red-500/10";
  };

  const getCategoryColor = (cat: string) => {
    const hash = cat.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hues = [200, 260, 320, 25, 140, 45, 180, 220, 280, 340, 90];
    const hue = hues[hash % hues.length];
    return `hsl(${hue}, 85%, 35%)`;
  };

  // Client-side Sorting
  const sortedLeads = [...leads].sort((a, b) => {
    let valA = a[sortBy] ?? "";
    let valB = b[sortBy] ?? "";

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const totalLeads = sortedLeads.length;
  const totalPages = Math.ceil(totalLeads / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  // Compute unique count of categories found
  const categoriesFoundCount = Object.keys(stats.categoryCounts).filter(cat => stats.categoryCounts[cat] > 0).length;

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto relative">
      {/* Title & Top Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Leads Database
          </h1>
          <p className="text-muted-foreground mt-2">Browse, filter, audit, and launch outbox outreach campaigns on saved prospects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="h-10 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button asChild className="h-10 font-bold shadow-lg shadow-primary/20">
            <a href="/dashboard">
              <Zap className="mr-2 h-4 w-4 animate-pulse" /> Analyze New Site
            </a>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-muted bg-gradient-to-br from-card to-muted/10 shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-black text-foreground mt-1">{stats.totalLeads}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-gradient-to-br from-card to-muted/10 shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">With Email</p>
              <p className="text-2xl font-black text-foreground mt-1">{stats.withEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-gradient-to-br from-card to-muted/10 shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <MailQuestion className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">No Email</p>
              <p className="text-2xl font-black text-foreground mt-1">{stats.withoutEmail}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-gradient-to-br from-card to-muted/10 shadow-sm rounded-2xl overflow-hidden relative">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Categories</p>
              <p className="text-2xl font-black text-foreground mt-1">{categoriesFoundCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-gradient-to-br from-card to-muted/10 shadow-sm rounded-2xl overflow-hidden relative col-span-2 md:col-span-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Last 24h</p>
              <p className="text-2xl font-black text-foreground mt-1">{stats.recentlyAdded}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Category Chips Row */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 px-1">
          <Filter className="h-3.5 w-3.5 text-primary" /> Filter by Category:
        </label>
        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-muted/40 border border-muted/60">
          <Button
            variant={categoryFilter === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("All")}
            className="h-8 text-xs font-bold rounded-xl transition-all"
          >
            All Leads ({stats.totalLeads})
          </Button>
          {CATEGORIES.map(cat => {
            const count = stats.categoryCounts[cat] || 0;
            if (count === 0 && categoryFilter !== cat) return null; // Hide empty categories to save space unless active
            return (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="h-8 text-xs font-bold rounded-xl transition-all"
                style={categoryFilter === cat ? {} : { borderColor: `${getCategoryColor(cat)}20`, color: getCategoryColor(cat), backgroundColor: `${getCategoryColor(cat)}05` }}
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Filter & Spacing Panel */}
      <Card className="border-muted shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search business name, URL, or notes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl"
            />
            {search && (
              <button 
                onClick={() => setSearch("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="md:col-span-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Lead Statuses</SelectItem>
                <SelectItem value="New">New / Imported</SelectItem>
                <SelectItem value="Hot Lead">Hot Leads</SelectItem>
                <SelectItem value="Warm Lead">Warm Leads</SelectItem>
                <SelectItem value="Good Website">Good Website</SelectItem>
                <SelectItem value="Email Later">Email Later</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Won">Won</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="h-10 rounded-xl bg-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Sort by Date Found</SelectItem>
                <SelectItem value="businessName">Sort by Name</SelectItem>
                <SelectItem value="websiteScore">Sort by Web Score</SelectItem>
                <SelectItem value="leadScore">Sort by Lead Score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="h-10 w-full md:w-fit font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowUpDown className="h-4 w-4" /> {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main List Layout */}
      <div>
        {isLoading ? (
          <div className="text-center py-20 bg-card border rounded-3xl border-dashed">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">Loading leads database...</h3>
            <p className="text-muted-foreground mt-1 text-sm">Querying matching records and calculating performance indices.</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 bg-card border rounded-3xl border-dashed">
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground">No leads discovered</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">No saved database leads matched your filter settings. Try clearing filters or searching another keyword.</p>
            {(search || statusFilter !== "All" || categoryFilter !== "All") && (
              <Button 
                variant="link" 
                onClick={() => { setSearch(""); setStatusFilter("All"); setCategoryFilter("All"); }}
                className="mt-3 font-bold text-primary"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3.5 bg-muted/30 border border-muted/80 rounded-xl text-xs font-black uppercase text-muted-foreground tracking-wider items-center">
              <div className="col-span-1 flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={selectedLeads.length === leads.length}
                  onChange={toggleSelectAll}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                />
                <span>Select</span>
              </div>
              <div className="col-span-4">Business Info</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-center">Scores</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Leads Rows */}
            <div className="space-y-4">
              {paginatedLeads.map((lead, idx) => {
                const hasEmail = lead.email && lead.email.trim() !== "";
                const isSelected = selectedLeads.includes(lead.id);

                return (
                  <div
                    key={lead.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationFillMode: "both", animationDelay: `${idx * 30}ms` }}
                  >
                    <Card className={`overflow-hidden border transition-all bg-card ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted hover:shadow-md hover:border-primary/25'}`}>
                      {/* Responsive Card Body */}
                      <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-4 items-stretch lg:items-center relative">
                        {/* Checkbox section */}
                        <div className="p-4 lg:p-0 lg:col-span-1 flex items-center gap-3 bg-muted/10 lg:bg-transparent border-b lg:border-b-0 border-dashed lg:pl-6">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            className="h-5 w-5 lg:h-4.5 lg:w-4.5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-[10px] font-black uppercase text-muted-foreground lg:hidden">Select Lead</span>
                        </div>

                        {/* Column: Business Info */}
                        <div className="p-6 lg:p-0 lg:col-span-4 space-y-2 lg:py-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-extrabold text-lg lg:text-md truncate text-foreground leading-tight" title={lead.businessName}>
                                {lead.businessName}
                              </h3>
                              {hasEmail ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-extrabold text-[8px] uppercase">Email Found</Badge>
                              ) : (
                                <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 font-extrabold text-[8px] uppercase">No Email</Badge>
                              )}
                            </div>
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 mt-1"
                            >
                              <Globe className="h-3 w-3" /> {lead.website.replace(/^https?:\/\//, "").split("/")[0]} <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>

                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {lead.phone && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {lead.phone}</span>}
                            {lead.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {lead.email}</span>}
                            {lead.city && <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {lead.city}{lead.address ? `, ${lead.address}` : ""}</span>}
                          </div>
                        </div>

                        {/* Column: Category */}
                        <div className="px-6 pb-4 lg:p-0 lg:col-span-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground lg:hidden">Category: </span>
                          <span 
                            className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border shrink-0" 
                            style={{ 
                              borderColor: `${getCategoryColor(lead.category || "Other")}30`, 
                              color: getCategoryColor(lead.category || "Other"), 
                              backgroundColor: `${getCategoryColor(lead.category || "Other")}08` 
                            }}
                          >
                            <Tag className="h-3 w-3" /> {lead.category || "Other"}
                          </span>
                        </div>

                        {/* Column: Scores */}
                        <div className="px-6 pb-4 lg:p-0 lg:col-span-2 grid grid-cols-2 gap-4 lg:gap-2 text-center lg:border-x lg:border-dashed lg:px-2">
                          <div className="flex flex-col justify-center">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Web Score</span>
                            <span className={`text-md font-extrabold px-2 py-0.5 mt-1 border rounded-lg mx-auto ${getScoreColor(lead.websiteScore || 0)}`}>
                              {lead.websiteScore || 0}%
                            </span>
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Lead Points</span>
                            <span className="text-md font-extrabold mt-1 text-foreground">
                              {lead.leadScore || 0}
                            </span>
                          </div>
                        </div>

                        {/* Column: Status */}
                        <div className="px-6 pb-4 lg:p-0 lg:col-span-1 flex lg:justify-center items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground lg:hidden">Status: </span>
                          {getStatusBadge(lead.status)}
                        </div>

                        {/* Column: Actions */}
                        <div className="p-4 lg:py-0 lg:pr-5 lg:pl-2 lg:col-span-2 flex items-center justify-end gap-2 bg-muted/5 lg:bg-transparent border-t lg:border-t-0 border-dashed">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0" title="View Report" asChild>
                            <a href={`/report/${lead.id}`} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                          
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                size="icon" 
                                className="h-9 w-9 rounded-xl shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                                title="Actions"
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setRecipientEmail(lead.email?.split(",")[0]?.trim() || "");
                                  setShowEmailSection(false);
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-xl overflow-y-auto">
                              {selectedLead && (
                                <div className="space-y-8 pt-6">
                                  <SheetHeader>
                                    <div className="flex items-center justify-between">
                                      <SheetTitle className="text-2xl truncate max-w-[320px]">{selectedLead.businessName}</SheetTitle>
                                      {getStatusBadge(selectedLead.status)}
                                    </div>
                                    <SheetDescription>
                                      Launch outreach campaign, update category, and view audit details.
                                    </SheetDescription>
                                  </SheetHeader>

                                  <div className="grid gap-6">
                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 rounded-2xl bg-muted/30 border text-center">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Performance Score</p>
                                        <p className={`text-2xl font-black ${getScoreColor(selectedLead.performanceScore || selectedLead.pageSpeedPerformance || 50)}`}>
                                          {(selectedLead.performanceScore || selectedLead.pageSpeedPerformance || 0)}%
                                        </p>
                                      </div>
                                      <div className="p-4 rounded-2xl bg-muted/30 border text-center">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">SEO Score</p>
                                        <p className={`text-2xl font-black ${getScoreColor(selectedLead.seoScore || selectedLead.pageSpeedSeo || 50)}`}>
                                          {(selectedLead.seoScore || selectedLead.pageSpeedSeo || 0)}%
                                        </p>
                                      </div>
                                    </div>

                                    {/* Category Editing */}
                                    <div className="space-y-2 bg-muted/30 p-5 rounded-2xl border">
                                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <Tag className="h-3.5 w-3.5 text-primary" /> Edit Category
                                      </label>
                                      <Select 
                                        value={selectedLead.category || "Other"} 
                                        onValueChange={handleUpdateCategory}
                                        disabled={isUpdatingCategory}
                                      >
                                        <SelectTrigger className="h-10 rounded-xl bg-white">
                                          <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Lead Info */}
                                    <div className="space-y-3">
                                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Lead Details</h4>
                                      <div className="grid gap-3 bg-card border rounded-2xl p-5 shadow-sm text-sm">
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Website</span>
                                          <a href={selectedLead.website} target="_blank" rel="noreferrer" className="font-bold text-primary hover:underline flex items-center gap-1">
                                            Visit Website <ExternalLink className="h-3 w-3" />
                                          </a>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Phone</span>
                                          <span className="font-bold">{selectedLead.phone || "No Phone"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Address / State</span>
                                          <span className="font-bold">{[selectedLead.city, selectedLead.address].filter(Boolean).join(", ") || "Unknown"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Detected Niche</span>
                                          <span className="font-semibold text-primary">{selectedLead.category || "Other"}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Top Audit Findings */}
                                    <div className="space-y-2">
                                      <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Top Audit Findings</h4>
                                      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl text-xs font-mono leading-relaxed max-h-40 overflow-y-auto">
                                        {selectedLead.topIssues || "No critical HTML elements missing."}
                                      </div>
                                    </div>

                                    {/* Campaign Outbox Controls */}
                                    <div className="pt-4 border-t">
                                      {!showEmailSection ? (
                                        <div className="grid gap-3">
                                          <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" className="h-11 rounded-xl font-bold" asChild>
                                              <a href={`/report/${selectedLead.id}`} target="_blank" rel="noreferrer">
                                                <Eye className="mr-2 h-4 w-4" /> View Report
                                              </a>
                                            </Button>
                                            <Button variant="outline" className="h-11 rounded-xl font-bold" asChild>
                                              <a href={`/proposal/${selectedLead.id}`} target="_blank" rel="noreferrer">
                                                <FileText className="mr-2 h-4 w-4" /> Proposal Page
                                              </a>
                                            </Button>
                                          </div>
                                          
                                          <div className="grid grid-cols-2 gap-3">
                                            <Button 
                                              variant="outline" 
                                              className="h-11 rounded-xl font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50"
                                              onClick={() => {
                                                updateLeadStatus(selectedLead.id, "Contacted");
                                                toast({ title: "Status Updated", description: "Lead set to Contacted." });
                                                fetchLeadsAndStats();
                                              }}
                                            >
                                              <CheckCircle2 className="mr-2 h-4 w-4" /> Contacted
                                            </Button>
                                            
                                            <Button 
                                              variant="outline" 
                                              className="h-11 rounded-xl font-bold border-indigo-500/20 text-indigo-600 hover:bg-indigo-50"
                                              onClick={() => {
                                                updateLeadStatus(selectedLead.id, "Won");
                                                toast({ title: "Status Updated", description: "Lead set to Won!" });
                                                fetchLeadsAndStats();
                                              }}
                                            >
                                              <Zap className="mr-2 h-4 w-4" /> Won Campaign
                                            </Button>
                                          </div>
                                          
                                          <Button 
                                            className="h-12 text-md font-bold shadow-md shadow-primary/20 rounded-xl"
                                            onClick={() => setShowEmailSection(true)}
                                            disabled={!selectedLead.email}
                                          >
                                            <Mail className="mr-2 h-5 w-5" /> Launch Proposal Email
                                          </Button>
                                          {!selectedLead.email && (
                                            <p className="text-[10px] text-center text-rose-500 font-semibold mt-1">An email address is required to launch outreach campaigns.</p>
                                          )}
                                        </div>
                                      ) : (
                                        <motion.div 
                                          initial={{ opacity: 0, y: 15 }} 
                                          animate={{ opacity: 1, y: 0 }}
                                          className="space-y-4 bg-primary/5 p-5 rounded-2xl border border-primary/20"
                                        >
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-sm flex items-center gap-1.5">
                                              <Mail className="h-4.5 w-4.5 text-primary" /> Outreach Composer
                                            </h4>
                                            <Button variant="ghost" size="icon" onClick={() => setShowEmailSection(false)} className="rounded-full h-8 w-8">
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>

                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recipient Email Address</label>
                                              <div className="flex gap-2">
                                                <Input 
                                                  placeholder="email@example.com" 
                                                  value={recipientEmail}
                                                  onChange={(e) => setRecipientEmail(e.target.value)}
                                                  className="h-10 rounded-xl"
                                                />
                                                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={handleUpdateEmail} disabled={isUpdatingEmail}>
                                                  {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outreach Template</label>
                                              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                                <SelectTrigger className="h-10 rounded-xl bg-white">
                                                  <SelectValue placeholder="Choose script..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {templates.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject Line</label>
                                              <Input 
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                className="h-10 rounded-xl font-medium"
                                              />
                                            </div>

                                            <div className="space-y-2">
                                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Body</label>
                                              <Textarea 
                                                className="min-h-[200px] rounded-xl resize-none p-3 text-xs leading-relaxed"
                                                value={emailBody}
                                                onChange={(e) => setEmailBody(e.target.value)}
                                              />
                                            </div>

                                            <Button 
                                              className="w-full h-12 text-md font-bold rounded-xl" 
                                              onClick={handleSendEmail}
                                              disabled={isSending || !emailSubject || !emailBody}
                                            >
                                              {isSending ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dispatching...</>
                                              ) : (
                                                <><Send className="mr-2 h-4 w-4" /> Send Audit Proposal</>
                                              )}
                                            </Button>
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </SheetContent>
                          </Sheet>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-xl"
                            onClick={() => setDeleteConfirmLeadId(lead.id)}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card border rounded-2xl shadow-sm mt-6">
                <p className="text-xs font-semibold text-muted-foreground">
                  Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-bold text-foreground">{Math.min(endIndex, totalLeads)}</span> of{" "}
                  <span className="font-bold text-foreground">{totalLeads}</span> leads
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground whitespace-nowrap">Per page:</span>
                    <Select value={pageSize.toString()} onValueChange={(val) => { setPageSize(parseInt(val)); setCurrentPage(1); }}>
                      <SelectTrigger className="w-16 h-8 rounded-lg bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-bold rounded-lg" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>«</Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-bold rounded-lg" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>‹</Button>
                    {(() => {
                      const delta = 2;
                      const pages: (number | string)[] = [];
                      const left = currentPage - delta;
                      const right = currentPage + delta;
                      let lastAdded = 0;
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                          if (lastAdded && i - lastAdded > 1) pages.push("...");
                          pages.push(i);
                          lastAdded = i;
                        }
                      }
                      return pages.map((page, i) =>
                        page === "..." ? (
                          <span key={`e-${i}`} className="h-8 px-1 flex items-center text-xs text-muted-foreground font-bold">…</span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className={`h-8 w-8 p-0 text-xs font-bold rounded-lg ${currentPage === page ? "shadow-md" : ""}`}
                            onClick={() => setCurrentPage(page as number)}
                          >
                            {page}
                          </Button>
                        )
                      );
                    })()}
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-bold rounded-lg" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>›</Button>
                    <Button variant="outline" size="sm" className="h-8 px-2 text-xs font-bold rounded-lg" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>»</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Sliding Bulk Actions Bar */}
      <AnimatePresence>
        {selectedLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-6 left-6 right-6 md:left-1/2 md:right-auto md:-translate-x-1/2 bg-slate-900 border border-slate-800 text-slate-100 px-6 py-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4 z-50 md:min-w-[700px] max-w-[90vw]"
          >
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-primary hover:bg-primary text-white font-black px-2 py-0.5 rounded-md">
                {selectedLeads.length} Selected
              </Badge>
              <span className="text-xs font-bold text-slate-300">Bulk Operations:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full justify-center md:justify-end">
              {/* Change Status select */}
              <div className="w-[140px]">
                <Select value={bulkStatusToApply} onValueChange={(val) => {
                  setBulkStatusToApply(val);
                  handleBulkStatus(val);
                }}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hot Lead">Hot Lead</SelectItem>
                    <SelectItem value="Warm Lead">Warm Lead</SelectItem>
                    <SelectItem value="Good Website">Good Website</SelectItem>
                    <SelectItem value="Email Later">Email Later</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Won">Won</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Change Category select */}
              <div className="w-[140px]">
                <Select value={bulkCategoryToApply} onValueChange={(val) => {
                  setBulkCategoryToApply(val);
                  handleBulkCategory(val);
                }}>
                  <SelectTrigger className="h-9 text-xs rounded-xl bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Update Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="destructive" 
                size="sm" 
                className="h-9 rounded-xl font-bold text-xs flex items-center gap-1.5"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Leads
              </Button>

              <button 
                onClick={() => setSelectedLeads([])} 
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                title="Deselect All"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Single Delete Confirm Dialog */}
      <Dialog open={deleteConfirmLeadId !== null} onOpenChange={(open) => !open && setDeleteConfirmLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Permanently Delete Lead?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This lead and all its associated reports, screenshots, and outreach logs will be permanently deleted from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirmLeadId(null)} disabled={isDeleting} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmLeadId && handleDeleteLead(deleteConfirmLeadId)} 
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirm Dialog */}
      <Dialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Permanently Delete {selectedLeads.length} Leads?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The selected {selectedLeads.length} leads and all their associated reports, screenshots, and outreach logs will be permanently deleted from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)} disabled={isBulkDeleting} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handlePerformBulkDelete} 
              disabled={isBulkDeleting}
              className="rounded-xl"
            >
              {isBulkDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete Selected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
