"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Zap, Image as ImageIcon, FileText, Send, Eye, Save, Clock, Loader2, ArrowRight, Edit3, X, Plus, Trash2, FileImage
} from "lucide-react";
import { quickAnalyzeWebsite, getMediaAssetsAction, updateLeadEmail, getLeadAction, getDashboardStats, getLeads, deleteLead } from "./actions";
import { getFinderLeads } from "./lead-finder/actions";
import { 
  setReportGenerating, actionCaptureScreenshot, actionRecommendations,
  actionProposalPng, actionPublicReport, actionPrepareEmail, saveReportEdits,
  uploadLeadReportMedia, removeLeadReportMedia, lockAfterImage, generateSocialOutreachProposal
} from "./report-actions";
import { AUDIT_CATEGORIES, type AuditCategory } from "@/lib/audit-categories";
import { updateLead } from "@/lib/lead-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [afterUrl, setAfterUrl] = useState("");
  const [isCapturingAfter, setIsCapturingAfter] = useState(false);
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Zap, Image as ImageIcon, FileText, Send, Eye, Save, Clock, Loader2, ArrowRight, Edit3, X, Plus, Trash2, FileImage
} from "lucide-react";
import { quickAnalyzeWebsite, getMediaAssetsAction, updateLeadEmail, getLeadAction, getDashboardStats, getLeads, deleteLead } from "./actions";
import { getFinderLeads } from "./lead-finder/actions";
import { 
  setReportGenerating, actionCaptureScreenshot, actionRecommendations,
  actionProposalPng, actionPublicReport, actionPrepareEmail, saveReportEdits,
  uploadLeadReportMedia, removeLeadReportMedia, lockAfterImage, generateSocialOutreachProposal
} from "./report-actions";
import { AUDIT_CATEGORIES, type AuditCategory } from "@/lib/audit-categories";
import { updateLead } from "@/lib/lead-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [afterUrl, setAfterUrl] = useState("");
  const [isCapturingAfter, setIsCapturingAfter] = useState(false);
  const [isCapturingBefore, setIsCapturingBefore] = useState(false);
  const [socialProposal, setSocialProposal] = useState("");
  const [isShowingProposal, setIsShowingProposal] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentFinderLeads, setRecentFinderLeads] = useState<any[]>([]);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [deleteConfirmLeadId, setDeleteConfirmLeadId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Email States
  const [isEditingEmailContent, setIsEditingEmailContent] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleCaptureAfter = async () => {
    if (!afterUrl || !result?.leadId) return;
    setIsCapturingAfter(true);
    try {
      const originalDesktopImage = result.desktopImage;
      const originalMobileImage = result.mobileImage;

      // Temporarily update the lead with the after URL for screenshot capture
      await updateLead(result.leadId, { website: afterUrl });
      const screenshotRes = await actionCaptureScreenshot(result.leadId);
      
      // Revert the URL back to the original immediately
      await updateLead(result.leadId, { website: result.website });
      if (originalDesktopImage || originalMobileImage) {
        await updateLead(result.leadId, {
          desktopImage: originalDesktopImage,
          mobileImage: originalMobileImage,
        });
      }

      if (screenshotRes.success && screenshotRes.desktopPath) {
        // Save ONLY to reportContent.afterImage — never touch desktopImage/mobileImage
        const updatedReportContent = { 
          ...result.reportContent, 
          afterImage: screenshotRes.desktopPath 
        };
        await updateLead(result.leadId, { 
          reportContent: updatedReportContent as any
        });
        setResult((prev: any) => ({ 
          ...prev, 
          reportContent: updatedReportContent
        }));
        toast({ title: "After Image Captured", description: "Preview image saved to the Before/After section." });
      } else {
        throw new Error(screenshotRes.error || "Failed to capture screenshot");
      }
    } catch (error) {
      toast({ title: "Capture Failed", description: error instanceof Error ? error.message : "Error", variant: "destructive" });
    } finally {
      setIsCapturingAfter(false);
    }
  };

  const handleLockAfter = async () => {
    if (!result?.leadId) return;
    await lockAfterImage(result.leadId);
    setResult((prev: any) => ({ ...prev, reportContent: { ...prev.reportContent, isAfterImageLocked: true } }));
    toast({ title: "After Image Locked", description: "This image will be preserved in future reports." });
  };

  const handleGenerateSocialProposal = async () => {
    if (!result?.leadId) return;
    const res = await generateSocialOutreachProposal(result.leadId);
    if (res.success) {
      setSocialProposal(res.message || "");
      setIsShowingProposal(true);
    }
  };

  const [reportState, setReportState] = useState<{ active: boolean; step: number; completed: boolean; totalSteps: number }>({
    active: false,
    step: 0,
    completed: false,
    totalSteps: 5
  });
  const { toast } = useToast();

  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>([]);

  // Editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditingProposals, setIsEditingProposals] = useState(false);
  const [editProposals, setEditProposals] = useState<string[]>([]);
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [editComments, setEditComments] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [reportMedia, setReportMedia] = useState<any[]>([]);
  const [stats, setStats] = useState({
    searchesUsed: 0,
    remainingSearches: 40,
    totalLeads: 0,
    leadsSaved: 0,
    emailsSent: 0
  });

  const handleSelectLead = async (leadId: string) => {
    setIsLoadingLead(true);
    try {
      const lead = await getLeadAction(leadId);
      if (lead) {
        setResult({ ...lead, leadId: lead.id });
        localStorage.setItem("lastLeadId", lead.id);
        setUrl(lead.website || "");
        setEditEmail(lead.email || "");
        setEditName(lead.businessName || "");
        setEditComments(lead.developerComments || "");
        setSelectedCategories((lead.aiAnalysis as any)?.selected_categories || []);
        setReportMedia((lead.reportMedia as any[]) || []);
        setEditProposals((lead.reportContent as any)?.recommendations?.length
          ? (lead.reportContent as any).recommendations
          : lead.improvementProposals && lead.improvementProposals.length > 0 ? lead.improvementProposals : [
          "Modern Hero Section",
          "Better Typography",
          "Strong CTA Buttons",
          "Mobile First Design",
          "Faster Loading Experience",
          "Better Lead Generation",
          "SEO Friendly Structure",
          "Trust Signals & Reviews"
        ]);
        if ((lead.reportContent as any)?.developerComments) {
          setEditComments((lead.reportContent as any).developerComments);
        }
        toast({ title: "Lead Loaded", description: `${lead.businessName} loaded for analysis.` });
      }
    } catch (err) {
      toast({ title: "Error Loading Lead", description: "Could not fetch lead details.", variant: "destructive" });
    } finally {
      setIsLoadingLead(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteLead(leadId);
      if (res.success) {
        toast({ title: "Lead Deleted", description: "The lead has been permanently removed." });
        setDeleteConfirmLeadId(null);
        // Refresh recent leads list
        const allLeads = await getLeads();
        setRecentLeads(allLeads.slice(0, 5));
        // Refresh finder leads list
        const finderLeads = await getFinderLeads();
        setRecentFinderLeads(finderLeads.slice(0, 10));
        // Refresh stats
        const statsData = await getDashboardStats();
        setStats(statsData);
        // If the deleted lead is currently selected/active, clear the active result
        if (result?.leadId === leadId) {
          setResult(null);
          localStorage.removeItem("lastLeadId");
        }
      } else {
        toast({ title: "Delete Failed", description: res.error || "An error occurred.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      // Load stats
      const statsData = await getDashboardStats();
      setStats(statsData);

      // Load media
      const mediaData = await getMediaAssetsAction();
      setMedia(mediaData);

      // Load recent leads
      try {
        const allLeads = await getLeads();
        setRecentLeads(allLeads.slice(0, 5));
      } catch (err) {
        console.error("Error loading leads:", err);
      }

      // Load finder leads (latest 10)
      try {
        const finderLeads = await getFinderLeads();
        setRecentFinderLeads(finderLeads.slice(0, 10));
      } catch (err) {
        console.error("Error loading finder leads:", err);
      }

      // Load last lead if exists
      const lastLeadId = localStorage.getItem("lastLeadId");
      if (lastLeadId) {
        const lead = await getLeadAction(lastLeadId);
        if (lead) {
          setResult({ ...lead, leadId: lead.id });
          setUrl(lead.website || "");
          setEditEmail(lead.email || "");
          setEditName(lead.businessName || "");
          setEditComments(lead.developerComments || "");
          setSelectedCategories((lead.aiAnalysis as any)?.selected_categories || []);
          setReportMedia((lead.reportMedia as any[]) || []);
          setEditProposals((lead.reportContent as any)?.recommendations?.length
            ? (lead.reportContent as any).recommendations
            : lead.improvementProposals && lead.improvementProposals.length > 0 ? lead.improvementProposals : [
            "Modern Hero Section",
            "Better Typography",
            "Strong CTA Buttons",
            "Mobile First Design",
            "Faster Loading Experience",
            "Better Lead Generation",
            "SEO Friendly Structure",
            "Trust Signals & Reviews"
          ]);
          if ((lead.reportContent as any)?.developerComments) {
            setEditComments((lead.reportContent as any).developerComments);
          }
        }
      }
    }
    loadInitialData();
  }, []);

  const performAnalysis = async (targetUrl: string) => {
    if (!targetUrl) return;
    
    setIsAnalyzing(true);
    setResult(null);
    localStorage.removeItem("lastLeadId"); // Clear old lead while analyzing
    setReportState({ active: false, step: 0, completed: false, totalSteps: 5 });
    
    try {
      const res = await quickAnalyzeWebsite(targetUrl);
      if (res.success && res.data) {
        setResult(res.data);
        localStorage.setItem("lastLeadId", res.data.leadId); // Persist the new lead ID
        setEditEmail(res.data.email || "");
        setEditName(res.data.businessName || "");
        setEditComments("");
        // @ts-ignore - handled in action update next
        setEditProposals(res.data.improvementProposals || [
          "Modern Hero Section",
          "Better Typography",
          "Strong CTA Buttons",
          "Mobile First Design",
          "Faster Loading Experience",
          "Better Lead Generation",
          "SEO Friendly Structure",
          "Trust Signals & Reviews"
        ]);

        // Refresh recent leads list
        try {
          const allLeads = await getLeads();
          setRecentLeads(allLeads.slice(0, 5));
          const finderLeads = await getFinderLeads();
          setRecentFinderLeads(finderLeads.slice(0, 10));
        } catch (err) {
          console.error("Error refreshing recent leads:", err);
        }

        toast({ title: "Analysis Complete", description: "Website data extracted successfully." });
      } else {
        toast({ title: "Analysis Failed", description: res.error || "Unknown error", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!result?.leadId || !result?.email) {
      toast({ title: "No Email", description: "This lead needs an email address first.", variant: "destructive" });
      return;
    }
    
    setIsSendingEmail(true);
    try {
      const { sendLeadEmailFromDashboard } = await import("./leads/actions");
      const res = await sendLeadEmailFromDashboard(
        result.leadId,
        emailSubject || result.aiAnalysis?.proposal_content?.email_subject || "Proposal",
        emailBody || result.aiAnalysis?.proposal_content?.email_body || "",
        result.email
      );
      
      if (res.success) {
        toast({ title: "Email Sent", description: "Proposal has been sent successfully." });
        setIsEditingEmailContent(false);
      } else {
        toast({ title: "Send Failed", description: res.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    await performAnalysis(url);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get("url");
    if (queryUrl) {
      setUrl(queryUrl);
      performAnalysis(queryUrl);
      // Clear URL params to avoid re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleUpdateEmail = async () => {
    if (!result?.leadId) return;
    const res = await updateLeadEmail(result.leadId, editEmail);
    if (res.success) {
      setResult((prev: any) => ({ ...prev, email: editEmail }));
      setIsEditingEmail(false);
      toast({ title: "Email Updated" });
    }
  };

  const handleUpdateName = async () => {
    if (!result?.leadId) return;
    const res = await updateLead(result.leadId, { businessName: editName });
    if (res.success) {
      setResult((prev: any) => ({ ...prev, businessName: editName }));
      setIsEditingName(false);
      toast({ title: "Business Name Updated" });
    }
  };

  const handleSaveProposals = async () => {
    if (!result?.leadId) return;
    const res = await saveReportEdits(result.leadId, editComments, editProposals);
    if (res.success) {
      setResult((prev: any) => ({ ...prev, improvementProposals: editProposals, reportContent: res.reportContent, reportStatus: "Not Generated" }));
      setIsEditingProposals(false);
      toast({ title: "Proposals Updated" });
    }
  };

  const handleSaveComments = async () => {
    if (!result?.leadId) return;
    const res = await saveReportEdits(result.leadId, editComments, editProposals);
    if (res.success) {
      setResult((prev: any) => ({ ...prev, developerComments: editComments, reportContent: res.reportContent, reportStatus: "Not Generated" }));
      setIsEditingComments(false);
      toast({ title: "Developer Comments Saved" });
    }
  };

  const handleReportMediaUpload = async (formData: FormData) => {
    if (!result?.leadId) return;
    setIsUploadingMedia(true);
    formData.set("leadId", result.leadId);
    try {
      const response = await uploadLeadReportMedia(formData);
      if (!response.success || !response.item) {
        throw new Error(response.error || "Upload failed");
      }
      setReportMedia((current) => {
        const next = [...current, response.item];
        setResult((resultState: any) => ({ ...resultState, reportMedia: next, reportStatus: "Not Generated" }));
        return next;
      });
      toast({ title: "Screenshot uploaded", description: "It will be included in the selected report section." });
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Unable to upload image", variant: "destructive" });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveReportMedia = async (mediaId: string) => {
    if (!result?.leadId) return;
    await removeLeadReportMedia(result.leadId, mediaId);
    setReportMedia((current) => current.filter((item) => item.id !== mediaId));
  };

  const handleSelectImage = async (field: string, imageUrl: string) => {
    if (!result?.leadId) return;
    const res = await updateLead(result.leadId, { [field]: imageUrl });
    if (res.success) {
      setResult((prev: any) => ({ ...prev, [field]: imageUrl }));
      toast({ title: "Image updated and saved to lead record" });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const handleGenerateReport = async () => {
    if (!result?.leadId) return;
    if (selectedCategories.length === 0) {
      toast({ title: "Select a category", description: "Choose at least one service category before generation.", variant: "destructive" });
      return;
    }

    setReportState({ active: true, step: 0, completed: false, totalSteps: 5 });
    setResult((prev: any) => ({ ...prev, reportStatus: "Generating" }));

    try {
      await setReportGenerating(result.leadId);
      let currentStep = 0;

      setReportState(s => ({ ...s, step: ++currentStep }));
      
      let beforeImage = result.beforeAfterImage;
      let screenshotRes: any = { success: true, desktopPath: result.desktopImage, mobilePath: result.mobileImage };

      // Step 1: Capture the Before image from the ORIGINAL site URL
      if (!beforeImage || !result.desktopImage) {
        toast({ title: "Capturing Website Screenshot...", description: "Fetching original website screenshot for the Before panel." });
        const beforeRes = await actionCaptureScreenshot(result.leadId);
        if (beforeRes.success && beforeRes.desktopPath) {
          beforeImage = beforeRes.desktopPath;
          screenshotRes = beforeRes;
          await updateLead(result.leadId, { 
            beforeAfterImage: beforeImage,
            desktopImage: beforeRes.desktopPath,
            mobileImage: beforeRes.mobilePath || undefined
          });
        }
      }

      // Step 2: If afterUrl is provided, capture After image SEPARATELY
      // — stored ONLY in reportContent.afterImage, never in desktopImage
      if (afterUrl && !result.reportContent?.isAfterImageLocked) {
        toast({ title: "Capturing After Screenshot...", description: "Fetching proposal URL for the After panel." });
        const originalDesktopImage = result.desktopImage;
        const originalMobileImage = result.mobileImage;
        await updateLead(result.leadId, { website: afterUrl });
        const afterRes = await actionCaptureScreenshot(result.leadId);
        await updateLead(result.leadId, { website: result.website }); // Always revert URL
        if (afterRes.success && afterRes.desktopPath) {
          const updatedReportContent = { ...result.reportContent, afterImage: afterRes.desktopPath };
          await updateLead(result.leadId, { reportContent: updatedReportContent as any });
          if (originalDesktopImage || originalMobileImage) {
            await updateLead(result.leadId, {
              desktopImage: originalDesktopImage,
              mobileImage: originalMobileImage,
            });
          }
          setResult((prev: any) => ({ ...prev, reportContent: updatedReportContent }));
        }
      }
                </CardHeader>
                <CardContent className="space-y-6">
                  <form action={handleReportMediaUpload} className="grid md:grid-cols-2 gap-4 rounded-2xl border bg-slate-50 p-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="report-file">Image</Label>
                      <Input id="report-file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="report-media-type">Image Type</Label>
                      <select id="report-media-type" name="type" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                        <option value="website_issue">Website Issue Screenshot</option>
                        <option value="competitor">Competitor Screenshot</option>
                        <option value="branding">Branding Reference</option>
                        <option value="before_after">Before / After Example</option>
                        <option value="general">General Reference</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="report-section">Place In Section</Label>
                      <select id="report-section" name="section" className="h-10 w-full rounded-md border bg-white px-3 text-sm">
                        <option value="findings">Selected Findings</option>
                        <option value="recommendations">Recommendations</option>
                        <option value="proposal">Proposal Section</option>
                        <option value="email">Email</option>
                        <option value="appendix">Uploaded Screenshots</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="report-caption">Caption / What This Image Shows</Label>
                      <Input id="report-caption" name="caption" placeholder="Example: Mobile navigation overlaps the booking button" required />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" name="includeInEmail" value="true" className="h-4 w-4 accent-primary" />
                      Include this image in the email
                    </label>
                    <Button type="submit" disabled={isUploadingMedia} className="md:justify-self-end">
                      {isUploadingMedia ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading</> : <><Plus className="mr-2 h-4 w-4" /> Upload Image</>}
                    </Button>
                  </form>

                  {reportMedia.length > 0 && (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {reportMedia.map((item) => (
                        <div key={item.id} className="overflow-hidden rounded-2xl border bg-white">
                          <img src={item.url} alt={item.caption} className="aspect-video w-full object-cover" />
                          <div className="p-4">
                            <div className="flex justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold">{item.caption}</p>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.section.replace("_", " ")}</p>
                              </div>
                              <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveReportMedia(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Select Proposal Categories</CardTitle>
                  <CardDescription>Choose one or more. Reports will exclude every unselected category.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {AUDIT_CATEGORIES.map((category) => {
                    const checked = selectedCategories.includes(category.value);
                    return (
                      <label key={category.value} className={`block cursor-pointer rounded-xl border p-3 transition-colors ${checked ? "border-primary bg-primary/5" : "bg-card/50"}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedCategories((current) =>
                              checked
                                ? current.filter((item) => item !== category.value)
                                : [...current, category.value]
                            )}
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <div>
                            <p className="text-sm font-black">{category.label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleGenerateReport}
                    disabled={reportState.active || selectedCategories.length === 0}
                  >
                    {reportState.active ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" /> {result.reportStatus === "Generated" ? "Regenerate Report" : "Start Generation"}</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Outputs</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-2">
                    {result.proposalImage ? (
                      <Button variant="outline" className="justify-start text-xs h-10" asChild>
                        <a href={result.proposalImage} target="_blank" rel="noreferrer">
                          <ImageIcon className="mr-2 h-4 w-4" /> Focused Proposal Image
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="justify-start text-xs h-10" disabled>
                        <ImageIcon className="mr-2 h-4 w-4" /> Proposal Image: Not generated
                      </Button>
                    )}
                    {result.reportImage ? (
                      <Button variant="outline" className="justify-start text-xs h-10" asChild>
                        <a href={result.reportImage} target="_blank" rel="noreferrer">
                          <ImageIcon className="mr-2 h-4 w-4" /> Audit PNG Summary
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="justify-start text-xs h-10" disabled>
                        <ImageIcon className="mr-2 h-4 w-4" /> Audit PNG: Not generated
                      </Button>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    className="justify-start" 
                    disabled={result.reportStatus !== "Generated" && !result.leadId}
                    asChild
                  >
                    <a href={result.leadId ? `/report/${result.leadId}` : "#"} target="_blank" rel="noreferrer">
                      <Eye className="mr-2 h-4 w-4" /> View Public Report
                    </a>
                  </Button>

                  <Button 
                    className="justify-start bg-green-600 hover:bg-green-700" 
                    disabled={!result.leadId}
                    asChild
                  >
                    <a href={result.leadId ? `/admin/leads/${result.leadId}` : "#"} target="_blank" rel="noreferrer">
                      <Send className="mr-2 h-4 w-4" /> Send Proposal
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Progress Tracker */}
              <AnimatePresence>
                {reportState.active && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Card className="border-primary/50 shadow-md">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex justify-between">
                          <span>Generation Progress</span>
                          <span>Step {reportState.step}/{reportState.totalSteps}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <motion.div 
                              className="bg-primary h-full" 
                              initial={{ width: 0 }} 
                              animate={{ width: `${(reportState.step / reportState.totalSteps) * 100}%` }} 
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="space-y-2">
                            {activeSteps.map((step, idx) => {
                              const stepNum = idx + 1;
                              const isPast = reportState.step > stepNum;
                              const isCurrent = reportState.step === stepNum;
                              return (
                                <div key={step} className={`flex items-center text-sm ${isPast ? 'text-primary' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                  {isPast ? <CheckCircle2 className="h-4 w-4 mr-2" /> : isCurrent ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Clock className="h-4 w-4 mr-2 opacity-50" />}
                                  {step}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Proposals Dialog */}
      <Dialog open={isEditingProposals} onOpenChange={setIsEditingProposals}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Improvement Proposals</DialogTitle>
            <DialogDescription>Modify the recommendations that will appear in the report.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {result?.aiAnalysis?.recommendations?.length > 0 && (
              <details className="rounded-xl border bg-slate-50">
                <summary className="cursor-pointer p-3 text-sm font-bold">View preserved original AI recommendations</summary>
                <div className="border-t p-4 space-y-2">
                  {result.aiAnalysis.recommendations.map((item: any) => (
                    <p key={item.title} className="text-sm text-muted-foreground">{item.recommendation}</p>
                  ))}
                </div>
              </details>
            )}
            {editProposals.map((proposal, idx) => (
              <div key={idx} className="flex gap-2">
                <Input 
                  value={proposal} 
                  onChange={e => {
                    const newP = [...editProposals];
                    newP[idx] = e.target.value;
                    setEditProposals(newP);
                  }}
                />
                <Button size="icon" variant="ghost" onClick={() => {
                  setEditProposals(editProposals.filter((_, i) => i !== idx));
                }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setEditProposals([...editProposals, ""])}>
              <Plus className="h-4 w-4 mr-2" /> Add Proposal
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProposals(false)}>Cancel</Button>
            <Button onClick={handleSaveProposals}>Save Proposals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isShowingProposal} onOpenChange={setIsShowingProposal}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Social Outreach Proposal
                </DialogTitle>
                <DialogDescription>
                  AI-generated message tailored to this business's social presence. Copy and send directly via DM.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {socialProposal ? (
                <Textarea 
                  value={socialProposal} 
                  readOnly 
                  className="min-h-[220px] text-sm leading-relaxed font-mono bg-muted/30 resize-none rounded-xl" 
                />
              ) : (
                <div className="min-h-[220px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed">
                  <div className="text-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Generating your proposal...</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsShowingProposal(false)}>Close</Button>
                <Button 
                  onClick={() => { navigator.clipboard.writeText(socialProposal); toast({title: "Copied!", description: "Proposal copied to clipboard."}) }}
                  disabled={!socialProposal}
                  className="font-bold"
                >
                  <Send className="h-4 w-4 mr-2" /> Copy to Clipboard
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button variant="outline" onClick={() => setDeleteConfirmLeadId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmLeadId && handleDeleteLead(deleteConfirmLeadId)} 
              disabled={isDeleting}
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StructureBadge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${active ? 'bg-green-50 border-green-100 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
      <CheckCircle2 className={`h-4 w-4 ${active ? 'opacity-100' : 'opacity-20'}`} />
      <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
      <div className="p-2 bg-primary/10 rounded-md text-primary">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
        <p className="text-sm font-medium truncate" title={value}>{value}</p>
      </div>
    </div>
  );
}

function ScoreItem({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <div className="space-y-1 p-2 rounded-lg border bg-card/50">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className={`text-2xl font-bold ${color}`}>{score}</div>
    </div>
  );
}

function MediaSelector({ currentImage, media, onSelect, label }: { currentImage: string, media: any[], onSelect: (url: string) => void, label: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center bg-muted/20 cursor-pointer overflow-hidden hover:border-primary/50 transition-colors">
          {currentImage ? (
            <>
              <img src={currentImage} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" size="sm"><FileImage className="h-4 w-4 mr-2" /> Change Image</Button>
              </div>
            </>
          ) : (
            <>
              <FileImage className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
              <p className="text-xs text-muted-foreground font-medium text-center px-4">Click to select from media library</p>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select {label} Image</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4">
          {media.map((asset) => (
            <div 
              key={asset.id} 
              className="group relative aspect-square rounded-lg border overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelect(asset.url)}
            >
              <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" size="sm">Select</Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                <p className="text-[10px] text-white truncate">{asset.fileName}</p>
              </div>
            </div>
          ))}
          {media.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No media assets found. Upload some in the media gallery.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
