"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Zap, Image as ImageIcon, FileText, Send, Eye, Save, Clock, Loader2, ArrowRight, Edit3, X, Plus, Trash2, FileImage, Wand2, Sparkles, Upload, Copy, ChevronDown, ChevronUp
} from "lucide-react";
import { quickAnalyzeWebsite, getMediaAssetsAction, updateLeadEmail, getLeadAction, getDashboardStats, getLeads, deleteLead, enhanceDeveloperComments, updateLeadDeveloperComments, autoCorrectText } from "./actions";
import { getFinderLeads } from "./lead-finder/actions";
import { 
  setReportGenerating, actionCaptureScreenshot, actionRecommendations,
  actionProposalPng, actionPublicReport, actionPrepareEmail, saveReportEdits,
  uploadLeadReportMedia, removeLeadReportMedia, lockAfterImage, generateSocialOutreachProposal, updateLeadReportMediaNotes
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
import { PhoneList } from "@/components/phone-list";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [afterUrl, setAfterUrl] = useState("");
  const [isCapturingAfter, setIsCapturingAfter] = useState(false);
  const [isCapturingBefore, setIsCapturingBefore] = useState(false);
  const [socialProposal, setSocialProposal] = useState("");
  const [isShowingProposal, setIsShowingProposal] = useState(false);
  const [shortReportUrl, setShortReportUrl] = useState("");
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
  const [isEnhancingComments, setIsEnhancingComments] = useState(false);
  const [isFullScreenCapture, setIsFullScreenCapture] = useState(true);
  const [isUploadingCustomBefore, setIsUploadingCustomBefore] = useState(false);
  const [isUploadingCustomAfter, setIsUploadingCustomAfter] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleCaptureAfter = async () => {
    if (!afterUrl || !result?.leadId) return;
    setIsCapturingAfter(true);
    try {
      const originalDesktopImage = result.desktopImage;
      const originalMobileImage = result.mobileImage;

      // Temporarily update the lead with the after URL for screenshot capture
      await updateLead(result.leadId, { website: afterUrl });
      const screenshotRes = await actionCaptureScreenshot(result.leadId, isFullScreenCapture);
      
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
    
    setIsShowingProposal(true);
    setSocialProposal("");
    setShortReportUrl("");
    
    // Generate Short URL
    const longUrl = `${window.location.origin}/report/${result.leadId}`;
    try {
       const shortUrlRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
       if (shortUrlRes.ok) {
          const short = await shortUrlRes.text();
          setShortReportUrl(short);
       } else {
          setShortReportUrl(longUrl);
       }
    } catch (e) {
       setShortReportUrl(longUrl);
    }

    const res = await generateSocialOutreachProposal(result.leadId);
    if (res.success) {
      setSocialProposal(res.message || "");
    } else {
      setIsShowingProposal(false);
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

  const [hideEmailCard, setHideEmailCard] = useState(false);
  const [hideMediaCard, setHideMediaCard] = useState(false);
  const [isCorrectingEmailSubject, setIsCorrectingEmailSubject] = useState(false);
  const [isCorrectingEmailBody, setIsCorrectingEmailBody] = useState(false);
  const [correctingMediaNotes, setCorrectingMediaNotes] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");

  const handleSelectLead = async (leadId: string) => {
    setIsLoadingLead(true);
    try {
      const lead = await getLeadAction(leadId);
      if (lead) {
        setResult({ ...lead, leadId: lead.id });
        localStorage.setItem("lastLeadId", lead.id);
        setUrl(lead.website || "");
        setEditEmail(lead.email || "");
        setRecipientEmail(lead.email || "");
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
      // Parallelize fetching to speed up initial load
      const [statsData, mediaData, allLeads, finderLeads] = await Promise.all([
        getDashboardStats().catch(() => ({ searchesUsed: 0, remainingSearches: 40, totalLeads: 0, leadsSaved: 0, emailsSent: 0 })),
        getMediaAssetsAction().catch(() => []),
        getLeads().catch(() => []),
        getFinderLeads().catch(() => [])
      ]);

      setStats(statsData);
      setMedia(mediaData);
      setRecentLeads(allLeads.slice(0, 5));
      setRecentFinderLeads(finderLeads.slice(0, 10));

      // Load last lead if exists
      const lastLeadId = localStorage.getItem("lastLeadId");
      if (lastLeadId) {
        const lead = await getLeadAction(lastLeadId).catch(() => null);
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
    const finalEmail = recipientEmail || result?.email;
    if (!result?.leadId || !finalEmail) {
      toast({ title: "No Email", description: "This lead needs an email address first.", variant: "destructive" });
      return;
    }
    
    setIsSendingEmail(true);
    try {
      const { sendLeadEmailFromDashboard } = await import("./actions");
      const res = await sendLeadEmailFromDashboard(
        result.leadId,
        emailSubject || result.aiAnalysis?.proposal_content?.email_subject || "Proposal",
        emailBody || result.aiAnalysis?.proposal_content?.email_body || "",
        finalEmail
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
    setHideEmailCard(false);
    setHideMediaCard(false);
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

  const handleEnhanceDashboardComments = async () => {
    if (!editComments) {
      toast({ title: "No Comments", description: "Please write some notes first.", variant: "destructive" });
      return;
    }
    setIsEnhancingComments(true);
    try {
      const enhanced = await enhanceDeveloperComments(editComments);
      if (enhanced) {
        setEditComments(enhanced);
        if (result?.leadId) {
           await updateLeadDeveloperComments(result.leadId, enhanced);
        }
        toast({ title: "Enhanced!", description: "Your comments have been professionally rewritten." });
      } else {
        throw new Error("Failed");
      }
    } catch (error: any) {
      toast({ title: "Enhancement Failed", description: error.message || "Failed to rewrite comments.", variant: "destructive" });
    } finally {
      setIsEnhancingComments(false);
    }
  };

  const handleReportMediaUpload = async (formData: FormData) => {
    if (!result?.leadId) return;
    setIsUploadingMedia(true);
    
    const files = formData.getAll("files");
    if (!files || files.length === 0) {
      setIsUploadingMedia(false);
      return;
    }

    try {
      const uploadedItems: any[] = [];
      for (const file of files) {
        if (!(file instanceof File) || file.size === 0) continue;
        
        const singleFormData = new FormData();
        singleFormData.set("leadId", result.leadId);
        singleFormData.set("file", file);
        singleFormData.set("type", formData.get("type") || "general");
        singleFormData.set("section", formData.get("section") || "appendix");
        
        let caption = String(formData.get("caption") || "").trim();
        if (files.length > 1 && caption) caption = `${caption} - ${file.name}`;
        singleFormData.set("caption", caption);
        singleFormData.set("includeInEmail", formData.get("includeInEmail") || "false");

        const response = await uploadLeadReportMedia(singleFormData);
        if (!response.success || !response.item) {
          throw new Error(response.error || `Upload failed for ${file.name}`);
        }
        uploadedItems.push(response.item);
      }

      setReportMedia((current) => {
        const next = [...current, ...uploadedItems];
        setResult((resultState: any) => ({ ...resultState, reportMedia: next, reportStatus: "Not Generated" }));
        return next;
      });
      toast({ title: "Upload complete", description: `Successfully uploaded ${uploadedItems.length} image(s).` });
      
      const form = document.getElementById("report-media-upload-form") as HTMLFormElement;
      if (form) form.reset();
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

  const handleSelectAfterImage = async (url: string) => {
    if (!result?.leadId) return;
    const newContent = { ...(result.reportContent || {}), afterImage: url };
    await updateLead(result.leadId, { reportContent: newContent as any });
    setResult((prev: any) => ({ ...prev, reportContent: newContent }));
    toast({ title: "After Image selected from media" });
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

    setReportState({ active: true, step: 0, completed: false, totalSteps: 4 });
    setResult((prev: any) => ({ ...prev, reportStatus: "Generating" }));

    try {
      await setReportGenerating(result.leadId);
      let currentStep = 0;

      setReportState(s => ({ ...s, step: ++currentStep }));
      const aiRes = await actionRecommendations(result.leadId, selectedCategories);
      if (!aiRes.success) {
        throw new Error("Focused AI analysis failed");
      }

      setReportState(s => ({ ...s, step: ++currentStep }));
      const proposalRes = await actionProposalPng(result.leadId);
      if (!proposalRes.success) {
        throw new Error("Proposal image generation failed");
      }
      setResult((prev: any) => ({ ...prev, proposalImage: proposalRes.path }));
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      const reportRes = await actionPublicReport(result.leadId);
      if (!reportRes.success) {
        throw new Error(reportRes.error || "PDF and PNG report generation failed");
      }
      setResult((prev: any) => ({
        ...prev,
        reportPdf: reportRes.reportPdf,
        reportImage: reportRes.reportImage,
        proposalPdf: reportRes.proposalPdf,
      }));
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionPrepareEmail(result.leadId);
      
      // Final re-fetch for safety
      const updatedLead = await getLeadAction(result.leadId);
      if (updatedLead) {
        setResult((prev: any) => ({ 
          ...prev, 
          ...updatedLead, 
          leadId: updatedLead.id, 
          reportStatus: "Generated" 
        }));
        const aiComments = (updatedLead.aiAnalysis as any)?.developer_comments
          ?.map((comment: any) => `${comment.heading}: ${comment.finding}\nRecommendation: ${comment.recommendation}`)
          .join("\n\n") || "";
        const aiRecommendations = (updatedLead.aiAnalysis as any)?.recommendations
          ?.map((item: any) => item.recommendation) || [];
        setEditComments((updatedLead.reportContent as any)?.developerComments || aiComments);
        setEditProposals((updatedLead.reportContent as any)?.recommendations?.length
          ? (updatedLead.reportContent as any).recommendations
          : aiRecommendations);
        setReportMedia((updatedLead.reportMedia as any[]) || []);
      } else {
        setResult((prev: any) => ({ ...prev, reportStatus: "Generated" }));
      }
      
      setReportState(s => ({ ...s, active: false, completed: true }));
      toast({ title: "Report Generated", description: "All assets have been successfully created and saved." });
    } catch (err) {
      console.error("Report generation error:", err);
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Failed to generate report",
        variant: "destructive"
      });
      setReportState({ active: false, step: 0, completed: false, totalSteps: 4 });
      setResult((prev: any) => ({ ...prev, reportStatus: "Not Generated" }));
    }
  };

  const activeSteps = [
    "Generating Selected Category Analysis",
    "Creating Proposal Image",
    "Building Focused PNG Report",
    "Preparing Email Template"
  ];

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lead Generation Dashboard</h1>
        <p className="text-muted-foreground mt-2">Step 1: Analyze website to extract data. Step 2: Generate comprehensive proposal report.</p>
      </div>

      {/* Statistics Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-primary/10 shadow-sm flex flex-col justify-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Searches Used Today</span>
          <span className="text-2xl font-black text-primary mt-1">{stats.searchesUsed} / 40</span>
        </Card>
        <Card className="p-4 border-muted shadow-sm flex flex-col justify-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Remaining Searches</span>
          <span className="text-2xl font-black text-foreground mt-1">{stats.remainingSearches}</span>
        </Card>
        <Card className="p-4 border-muted shadow-sm flex flex-col justify-center">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Total Leads Found</span>
          <span className="text-2xl font-black text-foreground mt-1">{stats.totalLeads}</span>
        </Card>
        <Card className="p-4 border-primary/10 shadow-sm flex flex-col justify-center bg-primary/5">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Leads Saved</span>
          <span className="text-2xl font-black text-primary mt-1">{stats.leadsSaved}</span>
        </Card>
        <Card className="p-4 border-muted shadow-sm flex flex-col justify-center col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Emails Sent</span>
          <span className="text-2xl font-black text-foreground mt-1">{stats.emailsSent}</span>
        </Card>
      </div>

      {/* Analysis Input */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Enter website URL or select a recent lead" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 text-lg"
                disabled={isAnalyzing || reportState.active}
                list="recent-leads"
              />
              <datalist id="recent-leads">
                {recentLeads.map(lead => (
                  <option key={lead.id} value={lead.website}>{lead.businessName} - {lead.website}</option>
                ))}
                {recentFinderLeads.map(lead => (
                  <option key={`finder-${lead.id}`} value={lead.website}>{lead.businessName} - {lead.website}</option>
                ))}
              </datalist>
            </div>
            <Button type="submit" disabled={isAnalyzing || !url || reportState.active} className="h-12 px-8 text-base w-full sm:w-auto">
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Search className="mr-2 h-5 w-5" /> Analyze Website</>
              )}
            </Button>
          </form>

          {recentLeads.length > 0 && (
            <div className="mt-4 pt-4 border-t flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" /> Recent Saved Leads
              </div>
              <div className="flex flex-wrap gap-2">
                {recentLeads.map((lead) => (
                  <Button 
                    key={lead.id} 
                    variant="outline" 
                    size="sm" 
                    className={`h-8 text-xs font-bold rounded-lg max-w-full truncate ${result?.leadId === lead.id ? "border-primary bg-primary/5 text-primary" : ""}`}
                    onClick={() => handleSelectLead(lead.id)}
                    disabled={isAnalyzing || isLoadingLead}
                  >
                    {isLoadingLead && result?.leadId === lead.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : null}
                    {lead.businessName}
                  </Button>
                ))}
              </div>
            </div>
          )}


        </CardContent>
      </Card>



      {/* Results & Actions Container */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Data */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl">Business Information</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditingEmail(true); setIsEditingName(true); }}>
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Info
                  </Button>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <InfoItem icon={<Globe />} label="Website URL" value={result.website} />
                  <InfoItem icon={<Zap />} label="Technology" value={result.designAnalysis?.technology || "Not Detected"} />
                  
                  <div className="flex flex-col p-3 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Business Name</p>
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <Input size={1} value={editName} onChange={e => setEditName(e.target.value)} className="h-8 flex-1 min-w-0" />
                        <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleUpdateName}><Save className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setIsEditingName(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium break-words min-w-0 flex-1">{result.businessName}</p>
                        <Edit3 className="h-3 w-3 opacity-30 cursor-pointer hover:opacity-100 shrink-0 mt-1" onClick={() => setIsEditingName(true)} />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col p-3 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</p>
                    {isEditingEmail ? (
                      <div className="flex gap-2">
                        <Input size={1} value={editEmail} onChange={e => setEditEmail(e.target.value)} className="h-8 flex-1 min-w-0" />
                        <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleUpdateEmail}><Save className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setIsEditingEmail(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium break-all min-w-0 flex-1">{result.email || "Not Found"}</p>
                        <Edit3 className="h-3 w-3 opacity-30 cursor-pointer hover:opacity-100 shrink-0 mt-1" onClick={() => setIsEditingEmail(true)} />
                      </div>
                    )}
                  </div>

                  <InfoItem icon={<Phone />} label="Phone" value={result.phone ? <PhoneList rawPhone={result.phone} /> : "Not Found"} />
                  <InfoItem icon={<MapPin />} label="Address" value={result.address || "Not Found"} />
                  
                  <div className="flex flex-col p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-xs font-semibold text-muted-foreground uppercase">Social Links</p>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-6 text-xs font-bold text-primary hover:bg-primary/10" 
                         onClick={handleGenerateSocialProposal}
                         disabled={!result.leadId}
                       >
                         <Zap className="h-3 w-3 mr-1" /> Proposal
                       </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        // Handle new structured object format {facebook, instagram, linkedin, twitter, youtube, tiktok}
                        if (result.socialLinks && typeof result.socialLinks === 'object' && !Array.isArray(result.socialLinks)) {
                          const entries = Object.entries(result.socialLinks).filter(([, v]) => v);
                          if (entries.length === 0) return <span className="text-xs text-muted-foreground">None Found</span>;
                          return entries.map(([platform, url]) => {
                            const colors: Record<string, string> = {
                              facebook: "bg-blue-600", instagram: "bg-pink-600",
                              linkedin: "bg-sky-700", twitter: "bg-slate-900",
                              youtube: "bg-red-600", tiktok: "bg-slate-800"
                            };
                            const labels: Record<string, string> = {
                              facebook: "fb", instagram: "IG", linkedin: "in",
                              twitter: "X", youtube: "YT", tiktok: "TT"
                            };
                            return (
                              <a key={platform} href={url as string} target="_blank" rel="noreferrer" className="relative group" title={url as string}>
                                <div className={`h-6 px-2 ${colors[platform] || "bg-muted"} rounded flex items-center justify-center text-white text-[10px] font-black gap-1`}>
                                  {labels[platform] || platform}
                                </div>
                                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {(url as string).replace(/^https?:\/\//, "").split("/")[0]}
                                </span>
                              </a>
                            );
                          });
                        }
                        // Handle old comma-separated string format for backward compatibility
                        if (result.socialLinks && result.socialLinks !== "None Found" && typeof result.socialLinks === 'string') {
                          return result.socialLinks.split(',').map((link: string, i: number) => {
                            const url = link.trim();
                            const icon = url.includes("linkedin") ? <div className="h-6 px-2 bg-sky-700 rounded flex items-center justify-center text-white text-[10px] font-black">in</div> : 
                                         url.includes("instagram") ? <div className="h-6 px-2 bg-pink-600 rounded flex items-center justify-center text-white text-[10px] font-black">IG</div> :
                                         url.includes("facebook") ? <div className="h-6 px-2 bg-blue-600 rounded flex items-center justify-center text-white text-[10px] font-black">fb</div> :
                                         url.includes("twitter") || url.includes("x.com") ? <div className="h-6 px-2 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-black">X</div> :
                                         url.includes("youtube") ? <div className="h-6 px-2 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-black">YT</div> :
                                         <Globe className="h-4 w-4" />;
                            return (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="relative group" title={url}>
                                {icon}
                                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                  {url.replace(/^https?:\/\//, "").split("/")[0]}
                                </span>
                              </a>
                            );
                          });
                        }
                        return <span className="text-xs text-muted-foreground">None Found</span>;
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Options Toggle for Mobile */}
              <div className="lg:hidden">
                <Button 
                  variant="outline" 
                  className="w-full font-bold mb-6" 
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                >
                  {isAdvancedOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                  {isAdvancedOpen ? "Hide Advanced Options" : "Show Advanced Options (Screenshots, Comments)"}
                </Button>
              </div>

              <div className={`${!isAdvancedOpen ? "hidden lg:block space-y-6" : "space-y-6"}`}>
                <Card className={`shadow-sm overflow-hidden mb-6 transition-colors ${result.reportContent?.includeBeforeAfter ? 'border-indigo-100' : 'border-slate-200'}`}>
                <div className={`p-6 border-b flex justify-between items-center transition-colors ${result.reportContent?.includeBeforeAfter ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`flex items-center gap-2 transition-opacity ${result.reportContent?.includeBeforeAfter ? 'opacity-100' : 'opacity-60'}`}>
                      <div className={`p-2 rounded-lg text-white transition-colors ${result.reportContent?.includeBeforeAfter ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Before / After Preview</CardTitle>
                        <CardDescription>Comparison of the existing site vs. the proposed redesign</CardDescription>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border shadow-sm hover:bg-slate-50 transition-colors">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 accent-indigo-600 rounded border-slate-300 cursor-pointer" 
                        checked={result.reportContent?.includeBeforeAfter || false}
                        onChange={async (e) => {
                          const isChecked = e.target.checked;
                          const updatedReportContent = { ...result.reportContent, includeBeforeAfter: isChecked };
                          setResult((prev: any) => ({ ...prev, reportContent: updatedReportContent }));
                          await updateLead(result.leadId, { reportContent: updatedReportContent as any });
                        }}
                      />
                      <span className="text-sm font-semibold text-slate-700">Include in Report</span>
                    </label>
                </div>
                {result.reportContent?.includeBeforeAfter && (
                  <div className="grid md:grid-cols-2 gap-0">
                  {/* Before Image */}
                  <div className="p-6 border-r border-indigo-100">
                    <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Before (Existing)</p>
                    <div className="flex gap-2 mb-3 items-center flex-wrap">
                      <Button size="sm" onClick={async () => {
                          setIsCapturingBefore(true);
                          const res = await actionCaptureScreenshot(result.leadId, isFullScreenCapture);
                          if (res.success && res.desktopPath) {
                            handleSelectImage("beforeAfterImage", res.desktopPath);
                            toast({title: "Before Image Captured"});
                          }
                          setIsCapturingBefore(false);
                      }} disabled={isCapturingBefore}>
                        {isCapturingBefore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch Before"}
                      </Button>
                      <label className="flex items-center gap-2 text-sm cursor-pointer border rounded-md px-2 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                        {isUploadingCustomBefore ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Upload className="h-4 w-4 text-slate-500" />}
                        <span className="text-slate-600 font-medium">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIsUploadingCustomBefore(true);
                            const formData = new FormData();
                            formData.append("file", e.target.files[0]);
                            formData.append("leadId", result.id);
                            formData.append("type", "before_image");
                            const res = await uploadLeadReportMedia(formData);
                            if (res.success && res.item) handleSelectImage("beforeAfterImage", res.item.url);
                            setIsUploadingCustomBefore(false);
                          }
                        }} disabled={isUploadingCustomBefore} />
                      </label>
                      <label className="flex items-center gap-1.5 ml-2 cursor-pointer">
                        <input type="checkbox" checked={isFullScreenCapture} onChange={(e) => setIsFullScreenCapture(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 h-3.5 w-3.5" />
                        <span className="text-xs text-slate-500">Full Screen</span>
                      </label>
                    </div>
                    <div className="relative aspect-video rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-sm flex items-center justify-center group">
                      {(result.beforeAfterImage || result.desktopImage) ? (
                          <img 
                            src={`${result.beforeAfterImage || result.desktopImage}?v=${new Date().getTime()}`} 
                            alt="Before Screenshot" 
                            className="w-full h-full object-contain bg-muted/20 object-center" 
                            loading="lazy"
                          />
                      ) : (
                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                          <FileImage className="h-8 w-8 text-indigo-200" />
                          <p className="text-sm font-medium text-indigo-400">No Before Image</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <MediaSelector 
                          currentImage={result.beforeAfterImage} 
                          media={media} 
                          onSelect={(url) => handleSelectImage("beforeAfterImage", url)} 
                          label="Before"
                        />
                      </div>
                    </div>
                  </div>

                  {/* After Image */}
                   <div className="p-6">
                     <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">After (Proposed / Preview)</p>
                     <div className="flex gap-2 mb-3 flex-wrap items-center">
                       <Input 
                         placeholder="Enter URL to fetch After screenshot..." 
                         value={afterUrl}
                         onChange={(e) => setAfterUrl(e.target.value)}
                         className="h-9 min-w-[200px]"
                       />
                       <Button size="sm" onClick={handleCaptureAfter} disabled={isCapturingAfter || !afterUrl}>
                         {isCapturingAfter ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch After"}
                       </Button>
                       <label className="flex items-center gap-2 text-sm cursor-pointer border rounded-md px-2 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                        {isUploadingCustomAfter ? <Loader2 className="h-4 w-4 animate-spin text-slate-500" /> : <Upload className="h-4 w-4 text-slate-500" />}
                        <span className="text-slate-600 font-medium">Upload</span>
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            setIsUploadingCustomAfter(true);
                            const formData = new FormData();
                            formData.append("file", e.target.files[0]);
                            formData.append("leadId", result.id);
                            formData.append("type", "after_image");
                            const res = await uploadLeadReportMedia(formData);
                            if (res.success && res.item) {
                              setResult((prev: any) => ({...prev, reportContent: {...prev.reportContent, afterImage: res.item.url}}));
                            }
                            setIsUploadingCustomAfter(false);
                          }
                        }} disabled={isUploadingCustomAfter} />
                      </label>
                       <Button 
                         size="sm" 
                         variant="secondary" 
                         onClick={handleLockAfter} 
                         disabled={!result.reportContent?.afterImage || result.reportContent?.isAfterImageLocked}
                       >
                         {result.reportContent?.isAfterImageLocked ? "Locked" : <Save className="h-4 w-4" />}
                       </Button>
                     </div>
                     <div className="relative aspect-video rounded-xl border border-indigo-100 overflow-hidden bg-white shadow-sm flex items-center justify-center group">
                       {result.reportContent?.afterImage ? (
                         <img 
                           src={`${result.reportContent?.afterImage}?v=${new Date().getTime()}`} 
                           alt="After / Proposed Screenshot" 
                           className="w-full h-full object-contain bg-muted/20 object-center" 
                           loading="lazy"
                         />
                       ) : (
                         <div className="flex flex-col items-center gap-2 p-4 text-center">
                           <FileImage className="h-8 w-8 text-indigo-200" />
                           <p className="text-sm font-medium text-indigo-400">Enter a URL above and click "Fetch After"</p>
                           <p className="text-xs text-indigo-300">Or generate the report — After image appears here after URL is provided</p>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <MediaSelector 
                          currentImage={result.reportContent?.afterImage} 
                          media={media} 
                          onSelect={handleSelectAfterImage} 
                          label="After"
                        />
                      </div>
                     </div>
                   </div>
                </div>
                )}
              </Card>

              <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Custom Comments</CardTitle>
                        <CardDescription>Add your own comments, requirements, observations, or special instructions for this report. These comments are included exactly as entered and can be used to highlight specific issues, business goals, design preferences, functionality requests, or other important details that should be considered during report generation.</CardDescription>
                      </div>
                    </div>
                    {isEditingComments ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveComments} className="bg-indigo-600 hover:bg-indigo-700">
                          <Save className="h-4 w-4 mr-2" /> Save Comments
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingComments(false)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditingComments(true)} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Edit3 className="h-4 w-4 mr-2" /> Edit Comments
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isEditingComments ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border-2 border-indigo-100 overflow-hidden focus-within:border-indigo-500 transition-colors bg-white">
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                           <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                           </div>
                           <div className="h-4 w-px bg-indigo-200 mx-2" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Advanced Developer Editor</p>
                        </div>
                        <div className="relative">
                          <Textarea 
                            value={editComments} 
                            onChange={e => setEditComments(e.target.value)}
                            placeholder="Type your professional audit comments here... (e.g., 'Your website has a strong foundation, but the hero section lacks a clear call to action...')"
                            className="min-h-[200px] border-0 focus-visible:ring-0 text-md leading-relaxed p-6"
                          />
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="absolute bottom-4 right-4 rounded-xl h-10 w-10 hover:bg-primary hover:text-white shadow-sm"
                            onClick={() => handleEnhanceDashboardComments()}
                            disabled={isEnhancingComments || !editComments}
                            title="Enhance with AI"
                          >
                            {isEnhancingComments ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Markdown is supported for basic formatting. These comments will appear on the final PNG and Web reports.</p>
                      <p className="text-[10px] text-muted-foreground">The original AI analysis remains preserved. Saved revisions: {result.reportContent?.history?.length || 0}</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      {result.reportContent?.developerComments ? (
                        <div className="space-y-4">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px] text-slate-700 leading-relaxed whitespace-pre-line">
                            {result.reportContent.developerComments}
                          </div>
                          <details className="rounded-xl border">
                            <summary className="cursor-pointer p-3 text-sm font-bold">View preserved original AI comments</summary>
                            <div className="border-t p-4 space-y-3">
                              {result.aiAnalysis?.developer_comments?.map((comment: any) => (
                                <p key={comment.heading} className="text-sm text-muted-foreground"><strong>{comment.heading}:</strong> {comment.finding}</p>
                              ))}
                            </div>
                          </details>
                        </div>
                      ) : result.aiAnalysis?.developer_comments?.length ? (
                        <div className="space-y-4">
                          {result.aiAnalysis.developer_comments.map((comment: any) => (
                            <div key={`${comment.category}-${comment.heading}`} className="rounded-2xl border bg-slate-50 p-5">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline">{comment.category}</Badge>
                                <Badge className={
                                  comment.priority === "critical" || comment.priority === "high"
                                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                                    : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                                }>{comment.priority}</Badge>
                                {comment.strength && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Strength</Badge>}
                              </div>
                              <h3 className="font-black text-slate-900">{comment.heading}</h3>
                              <p className="mt-2 text-sm text-slate-700">{comment.finding}</p>
                              <p className="mt-3 text-sm font-semibold text-indigo-800">Action: {comment.recommendation}</p>
                              <p className="mt-2 text-xs text-muted-foreground">Evidence: {comment.evidence}</p>
                            </div>
                          ))}
                        </div>
                      ) : result.developerComments ? (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px] text-slate-700 leading-relaxed whitespace-pre-line">
                          {result.developerComments}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                           <FileText className="h-10 w-10 mb-2 opacity-20" />
                           <p className="text-sm font-medium">No developer comments added yet.</p>
                           <Button variant="link" size="sm" onClick={() => setIsEditingComments(true)} className="text-indigo-600">Click to add technical insights</Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>

              {result.aiAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Focused Proposal Content</CardTitle>
                    <CardDescription>Generated only for the selected service categories.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {result.aiAnalysis.selected_categories?.map((category: AuditCategory) => (
                        <Badge key={category}>{AUDIT_CATEGORIES.find((item) => item.value === category)?.label}</Badge>
                      ))}
                    </div>
                    <h3 className="font-black">{result.aiAnalysis.proposal_content?.title}</h3>
                    <p className="text-sm text-muted-foreground">{result.aiAnalysis.proposal_content?.executive_pitch}</p>
                    <ul className="space-y-2">
                      {result.aiAnalysis.proposal_content?.scope?.map((item: string) => (
                        <li key={item} className="text-sm flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />{item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {!hideEmailCard && result.aiAnalysis && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">Ready-to-Send Email</CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setHideEmailCard(true)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>Personalized to the selected proposal scope.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="font-bold shadow-sm"
                        onClick={() => {
                          if (!isEditingEmailContent) {
                            setEmailSubject(result.aiAnalysis.proposal_content?.email_subject || "");
                            setEmailBody(result.aiAnalysis.proposal_content?.email_body || "");
                          }
                          setIsEditingEmailContent(!isEditingEmailContent);
                        }}
                      >
                        {isEditingEmailContent ? <><X className="h-4 w-4 mr-1" /> Cancel Edit</> : <><Edit3 className="h-4 w-4 mr-1" /> Edit Email</>}
                      </Button>
                      <Button 
                        size="sm" 
                        className="font-bold shadow-sm"
                        onClick={handleSendEmail}
                        disabled={isSendingEmail || (!result.email && !recipientEmail)}
                      >
                        {isSendingEmail ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending</> : <><Send className="mr-2 h-4 w-4" /> Send Email</>}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(!result.email && !recipientEmail) && (
                      <div className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <strong>Missing Email:</strong> You need to add a recipient email address below.
                      </div>
                    )}
                    
                    <div className="rounded-xl border p-5 bg-card/50">
                      {isEditingEmailContent ? (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Recipient Email</Label>
                            <Input 
                              type="email"
                              value={recipientEmail} 
                              onChange={(e) => setRecipientEmail(e.target.value)} 
                              className="font-medium"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs uppercase font-bold text-muted-foreground">Subject Line</Label>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-primary"
                                onClick={async () => {
                                  setIsCorrectingEmailSubject(true);
                                  try {
                                    const corrected = await autoCorrectText(emailSubject);
                                    setEmailSubject(corrected);
                                  } catch (e) {
                                    toast({ title: "Auto-Correct Failed", variant: "destructive" });
                                  } finally {
                                    setIsCorrectingEmailSubject(false);
                                  }
                                }}
                                disabled={isCorrectingEmailSubject || !emailSubject}
                              >
                                {isCorrectingEmailSubject ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                AI Auto-Correct
                              </Button>
                            </div>
                            <Input 
                              value={emailSubject} 
                              onChange={(e) => setEmailSubject(e.target.value)} 
                              className="font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs uppercase font-bold text-muted-foreground">Message Body</Label>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-primary"
                                onClick={async () => {
                                  setIsCorrectingEmailBody(true);
                                  try {
                                    const corrected = await autoCorrectText(emailBody);
                                    setEmailBody(corrected);
                                  } catch (e) {
                                    toast({ title: "Auto-Correct Failed", variant: "destructive" });
                                  } finally {
                                    setIsCorrectingEmailBody(false);
                                  }
                                }}
                                disabled={isCorrectingEmailBody || !emailBody}
                              >
                                {isCorrectingEmailBody ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                AI Auto-Correct
                              </Button>
                            </div>
                            <Textarea 
                              value={emailBody} 
                              onChange={(e) => setEmailBody(e.target.value)} 
                              className="min-h-[250px] resize-y"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-black border-b pb-3 mb-3">{result.aiAnalysis.proposal_content?.email_subject}</p>
                          <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result.aiAnalysis.proposal_content?.email_body}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {!hideMediaCard && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">Report Screenshots & References</CardTitle>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setHideMediaCard(true)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>Upload issue screenshots, competitor websites, branding references, design inspirations, and before/after examples. Captions and notes are included in the report generation process to provide additional context.</CardDescription>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-6">
                  <form id="report-media-upload-form" action={handleReportMediaUpload} className="grid md:grid-cols-2 gap-4 rounded-2xl border bg-slate-50 p-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="report-file">Images (You can select multiple)</Label>
                      <Input id="report-file" name="files" type="file" multiple accept="image/jpeg,image/png,image/webp" required />
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
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="report-notes">Notes / Fixes Needed</Label>
                      <Textarea id="report-notes" name="notes" placeholder="Explain the issue, required correction, or improvement..." className="min-h-[80px]" />
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
                        <div key={item.id} className="overflow-hidden rounded-2xl border bg-white flex flex-col">
                          <img src={item.url} alt={item.caption} className="aspect-video w-full object-contain bg-muted/20" loading="lazy" />
                          <div className="p-4 flex flex-col flex-1 gap-3">
                            <div className="flex justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold">{item.caption}</p>
                                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.section.replace("_", " ")}</p>
                              </div>
                              <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveReportMedia(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                            <div className="space-y-1.5 flex-1 flex flex-col">
                              <div className="flex items-center justify-between">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Notes / Fixes</Label>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-5 px-1.5 text-[10px] text-primary"
                                  onClick={async () => {
                                    setCorrectingMediaNotes(item.id);
                                    try {
                                      const corrected = await autoCorrectText(item.notes || "");
                                      const res = await updateLeadReportMediaNotes(result.leadId, item.id, corrected);
                                      if (res.success) {
                                        setReportMedia(res.media);
                                      }
                                    } catch (e) {
                                      toast({ title: "Auto-Correct Failed", variant: "destructive" });
                                    } finally {
                                      setCorrectingMediaNotes(null);
                                    }
                                  }}
                                  disabled={correctingMediaNotes === item.id || !item.notes}
                                >
                                  {correctingMediaNotes === item.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                  AI Auto-Correct
                                </Button>
                              </div>
                              <Textarea 
                                placeholder="Explain the issue or required fix..."
                                value={item.notes || ""}
                                onChange={(e) => {
                                  const updated = reportMedia.map(m => m.id === item.id ? { ...m, notes: e.target.value } : m);
                                  setReportMedia(updated);
                                }}
                                onBlur={async (e) => {
                                  await updateLeadReportMediaNotes(result.leadId, item.id, e.target.value);
                                }}
                                className="flex-1 min-h-[80px] text-xs resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              )}
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
              {shortReportUrl && (
                <div className="flex flex-col gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl mb-3">
                  <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Report Link</p>
                  <p className="text-sm font-semibold text-slate-800 break-words">{result?.businessName ? `Growth Strategy for ${result.businessName}` : "Growth Strategy Report"}</p>
                  <div className="flex items-center gap-2">
                    <Input readOnly value={shortReportUrl} className="h-8 text-xs bg-white text-slate-600 font-mono flex-1" />
                    <Button 
                      size="sm" 
                      className="h-8 px-3 shrink-0" 
                      onClick={() => { navigator.clipboard.writeText(shortReportUrl); toast({title: "Link Copied!"}) }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}
              {socialProposal ? (
                <Textarea 
                  value={socialProposal} 
                  readOnly 
                  className="min-h-[160px] text-sm leading-relaxed font-mono bg-muted/30 resize-none rounded-xl" 
                />
              ) : (
                <div className="min-h-[160px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed">
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
                  onClick={() => { navigator.clipboard.writeText(`${socialProposal}\n\nHere is your full report: ${shortReportUrl}`); toast({title: "Copied!", description: "Message & Link copied to clipboard."}) }}
                  disabled={!socialProposal}
                  className="font-bold"
                >
                  <Send className="h-4 w-4 mr-2" /> Copy Message & Link
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

      {/* Sticky Mobile Action Bar */}
      {result && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-3 flex gap-2 lg:hidden z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <Button 
            className="flex-1 font-bold h-12" 
            onClick={handleGenerateReport} 
            disabled={reportState.active || isCapturingAfter || isCapturingBefore || selectedCategories.length === 0}
          >
            {reportState.active ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate"}
          </Button>
          
          <Button 
            className="flex-1 font-bold h-12" 
            variant="secondary"
            onClick={() => window.open(`/report/${result.leadId}`, "_blank")}
            disabled={!result.reportContent}
          >
            <Eye className="h-4 w-4 mr-1.5" /> Preview
          </Button>

          <Button 
            className="flex-1 font-bold h-12" 
            variant="outline"
            onClick={() => window.open(`https://wa.me/${result.phone?.replace(/[^\d+]/g, '')}`, '_blank')}
            disabled={!result.phone}
          >
            WA Share
          </Button>

          <Button 
            className="flex-shrink-0 h-12 w-12" 
            variant="outline"
            size="icon"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/report/${result.leadId}`);
              toast({title: "Copied!", description: "Proposal link copied."});
            }}
            disabled={!result.reportContent}
          >
            <Copy className="h-5 w-5" />
          </Button>
        </div>
      )}
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
      <div className="p-2 bg-primary/10 rounded-md text-primary">
        {icon}
      </div>
      <div className="overflow-hidden min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
        <div className="text-sm font-medium break-words mt-1">{value}</div>
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
              <img src={currentImage} alt={label} className="w-full h-full object-contain" loading="lazy" />
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
              <img src={asset.url} alt={asset.fileName} className="w-full h-full object-contain" loading="lazy" />
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
