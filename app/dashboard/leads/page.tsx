"use client";

import { useState, useEffect } from "react";
import { 
  getLeads, 
  bulkUpdateLeadStatus, 
  bulkDeleteLeads,
  updateLeadStatus,
  updateLeadEmail,
  getTemplates,
  sendLeadEmailFromDashboard
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
  ArrowRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  
  // Email states
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
    fetchTemplates();
  }, [search, statusFilter]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const data = await getLeads({ search, status: statusFilter });
      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      toast({
        title: "Error",
        description: "Could not load leads. Please try again.",
        variant: "destructive",
      });
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
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
      fetchLeads();
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
      fetchLeads();
    } else {
      toast({ title: "Update Failed", description: res.error, variant: "destructive" });
    }
    setIsUpdatingEmail(false);
  };

  const handleExport = () => {
    const dataToExport = leads.map(lead => ({
      "Business Name": lead.businessName,
      "Website": lead.website,
      "Email": lead.email,
      "Phone": lead.phone,
      "Address": lead.address,
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
    if (selectedLeads.length === 0) return;
    const res = await bulkUpdateLeadStatus(selectedLeads, status);
    if (res.success) {
      toast({ title: "Updated", description: `Marked ${selectedLeads.length} leads as ${status}.` });
      fetchLeads();
      setSelectedLeads([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm("Are you sure you want to delete selected leads?")) return;
    const res = await bulkDeleteLeads(selectedLeads);
    if (res.success) {
      toast({ title: "Deleted", description: `Deleted ${selectedLeads.length} leads.` });
      fetchLeads();
      setSelectedLeads([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Hot Lead": return <Badge className="bg-red-500 hover:bg-red-600">Hot Lead</Badge>;
      case "Warm Lead": return <Badge className="bg-orange-500 hover:bg-orange-600">Warm Lead</Badge>;
      case "Good Website": return <Badge className="bg-green-500 hover:bg-green-600">Good Website</Badge>;
      case "Email Later": return <Badge className="bg-blue-500 hover:bg-blue-600">Email Later</Badge>;
      case "Contacted": return <Badge className="bg-purple-500 hover:bg-purple-600">Contacted</Badge>;
      case "Won": return <Badge className="bg-green-600 hover:bg-green-700">Won</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground mt-2">Browse and manage all extracted website leads and their audit data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport} className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export to Excel
          </Button>
          <Button asChild className="h-10">
            <a href="/dashboard">
              <Zap className="mr-2 h-4 w-4" /> Analyze New Website
            </a>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Narrow down your lead list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Business, URL, Email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Hot Lead">Hot Leads</SelectItem>
                  <SelectItem value="Warm Lead">Warm Leads</SelectItem>
                  <SelectItem value="Good Website">Good Website</SelectItem>
                  <SelectItem value="Email Later">Email Later</SelectItem>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Won">Won</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedLeads.length > 0 && (
              <div className="pt-4 border-t space-y-3">
                <p className="text-xs font-bold text-primary">{selectedLeads.length} leads selected</p>
                <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => handleBulkStatus("Email Later")}>
                  <Mail className="mr-2 h-4 w-4" /> Bulk Email Later
                </Button>
                <Button size="sm" variant="destructive" className="w-full justify-start" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" /> Bulk Delete
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground font-medium">Fetching leads from database...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
              <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground font-medium">No leads found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearch(""); setStatusFilter("All"); }}>Clear all filters</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {leads.map((lead, idx) => (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className={`overflow-hidden transition-all hover:border-primary/40 hover:shadow-md ${selectedLeads.includes(lead.id) ? 'border-primary bg-primary/5' : ''}`}>
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Selection Checkbox */}
                          <div className="p-4 flex items-center bg-muted/10 border-r border-dashed">
                             <input 
                               type="checkbox" 
                               checked={selectedLeads.includes(lead.id)}
                               onChange={() => toggleSelect(lead.id)}
                               className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                             />
                          </div>

                          {/* Info Body */}
                          <div className="flex-1 p-5 grid sm:grid-cols-4 gap-4 items-center">
                            <div className="sm:col-span-2">
                              <h3 className="font-bold text-lg truncate flex items-center gap-2">
                                {lead.businessName}
                                {getStatusBadge(lead.status)}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                                  <Globe className="h-3 w-3" /> {lead.website.replace(/^https?:\/\//, "").split("/")[0]}
                                </a>
                                {lead.email && (
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {lead.email.split(",")[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center border-x border-dashed px-4">
                              <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Web Score</p>
                                <p className={`text-xl font-black ${getScoreColor(lead.websiteScore)}`}>{lead.websiteScore}%</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground">Lead Pts</p>
                                <p className="text-xl font-black">{lead.leadScore}</p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/report/${lead.id}`} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4 mr-2" /> Report
                                </a>
                              </Button>
                              
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button size="sm" onClick={() => {
                                    setSelectedLead(lead);
                                    setRecipientEmail(lead.email?.split(",")[0]?.trim() || "");
                                    setShowEmailSection(false);
                                  }}>
                                    Actions <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-xl overflow-y-auto">
                                  {selectedLead && (
                                    <div className="space-y-8 pt-6">
                                      <SheetHeader>
                                        <div className="flex items-center justify-between">
                                          <SheetTitle className="text-2xl">{selectedLead.businessName}</SheetTitle>
                                          {getStatusBadge(selectedLead.status)}
                                        </div>
                                        <SheetDescription>
                                          Full details and outreach management.
                                        </SheetDescription>
                                      </SheetHeader>

                                      <div className="grid gap-8">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="p-4 rounded-2xl bg-muted/50 border border-dashed text-center">
                                            <p className="text-xs font-black uppercase text-muted-foreground mb-1">Performance</p>
                                            <p className={`text-2xl font-black ${getScoreColor(selectedLead.performanceScore || selectedLead.pageSpeedPerformance)}`}>
                                              {(selectedLead.performanceScore || selectedLead.pageSpeedPerformance)}%
                                            </p>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-muted/50 border border-dashed text-center">
                                            <p className="text-xs font-black uppercase text-muted-foreground mb-1">SEO</p>
                                            <p className={`text-2xl font-black ${getScoreColor(selectedLead.seoScore || selectedLead.pageSpeedSeo)}`}>
                                              {(selectedLead.seoScore || selectedLead.pageSpeedSeo)}%
                                            </p>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <h4 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Contact Information</h4>
                                          <div className="grid gap-3 bg-card border rounded-2xl p-5 shadow-sm">
                                            <div className="flex justify-between items-center text-sm">
                                              <span className="text-muted-foreground">Website</span>
                                              <a href={selectedLead.website} target="_blank" rel="noreferrer" className="font-bold hover:underline flex items-center gap-1">
                                                Visit Site <ExternalLink className="h-3 w-3" />
                                              </a>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                              <span className="text-muted-foreground">Email</span>
                                              <span className="font-bold">{selectedLead.email || "Unknown"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                              <span className="text-muted-foreground">Phone</span>
                                              <span className="font-bold">{selectedLead.phone || "Unknown"}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                              <span className="text-muted-foreground">Address</span>
                                              <span className="font-bold text-right max-w-[200px] truncate">{selectedLead.address || "Unknown"}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <h4 className="font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Audit Findings</h4>
                                          <div className="bg-slate-950 text-slate-300 p-6 rounded-2xl text-sm font-mono leading-relaxed shadow-xl">
                                            {selectedLead.topIssues}
                                          </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                          {!showEmailSection ? (
                                            <div className="grid gap-3">
                                              <div className="grid grid-cols-2 gap-3">
                                                <Button variant="outline" className="h-12" asChild>
                                                  <a href={`/report/${selectedLead.id}`} target="_blank" rel="noreferrer">
                                                    <Eye className="mr-2 h-4 w-4" /> View Report
                                                  </a>
                                                </Button>
                                                <Button variant="outline" className="h-12" asChild>
                                                  <a href={`/proposal/${selectedLead.id}`} target="_blank" rel="noreferrer">
                                                    <FileText className="mr-2 h-4 w-4" /> View Proposal
                                                  </a>
                                                </Button>
                                              </div>
                                              
                                              <Button 
                                                variant="outline" 
                                                className="h-12 border-primary/20 text-primary hover:bg-primary/5"
                                                onClick={() => {
                                                  updateLeadStatus(selectedLead.id, "Contacted");
                                                  toast({ title: "Updated", description: "Lead marked as contacted." });
                                                  fetchLeads();
                                                }}
                                              >
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Contacted
                                              </Button>
                                              
                                              <Button 
                                                className="h-14 text-lg font-bold"
                                                onClick={() => setShowEmailSection(true)}
                                              >
                                                <Mail className="mr-2 h-5 w-5" /> Send Proposal Email
                                              </Button>
                                            </div>
                                          ) : (
                                            <motion.div 
                                              initial={{ opacity: 0, height: 0 }} 
                                              animate={{ opacity: 1, height: "auto" }}
                                              className="space-y-6 bg-primary/5 p-6 rounded-3xl border border-primary/20"
                                            >
                                              <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-lg flex items-center gap-2">
                                                  <Mail className="h-5 w-5 text-primary" /> Compose Outreach
                                                </h4>
                                                <Button variant="ghost" size="icon" onClick={() => setShowEmailSection(false)} className="rounded-full">
                                                  <X className="h-4 w-4" />
                                                </Button>
                                              </div>

                                              <div className="space-y-4">
                                                <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recipient</label>
                                                  <div className="flex gap-2">
                                                    <Input 
                                                      placeholder="email@example.com" 
                                                      value={recipientEmail}
                                                      onChange={(e) => setRecipientEmail(e.target.value)}
                                                      className="h-11 rounded-xl"
                                                    />
                                                    <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={handleUpdateEmail} disabled={isUpdatingEmail}>
                                                      {isUpdatingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                  </div>
                                                </div>

                                                <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Template</label>
                                                  <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                                    <SelectTrigger className="h-11 rounded-xl">
                                                      <SelectValue placeholder="Choose an outreach script..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      {templates.map(t => (
                                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                  </Select>
                                                </div>

                                                <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subject</label>
                                                  <Input 
                                                    value={emailSubject}
                                                    onChange={(e) => setEmailSubject(e.target.value)}
                                                    className="h-11 rounded-xl font-medium"
                                                  />
                                                </div>

                                                <div className="space-y-2">
                                                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Message Body</label>
                                                  <Textarea 
                                                    className="min-h-[250px] rounded-2xl resize-none p-4 leading-relaxed"
                                                    value={emailBody}
                                                    onChange={(e) => setEmailBody(e.target.value)}
                                                  />
                                                </div>

                                                <Button 
                                                  className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20" 
                                                  onClick={handleSendEmail}
                                                  disabled={isSending || !emailSubject || !emailBody}
                                                >
                                                  {isSending ? (
                                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                                                  ) : (
                                                    <><Send className="mr-2 h-5 w-5" /> Send Proposal</>
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
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
