"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Globe, Mail, Phone, MapPin, CheckCircle2, AlertCircle, Zap, Image as ImageIcon, FileText, Send, Eye, Save, Clock, Loader2, ArrowRight, Edit3, X, Plus, Trash2, FileImage
} from "lucide-react";
import { quickAnalyzeWebsite, getMediaAssetsAction, updateLeadEmail, getLeadAction } from "./actions";
import { 
  setReportGenerating, actionCaptureScreenshot, actionAnalyzeDesign, actionVisualAudit, 
  actionRecommendations, actionBeforeAfter, actionProposalPng, actionProposalPngTech, actionPublicReport, actionPrepareEmail 
} from "./report-actions";
import { updateLead } from "@/lib/lead-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GENERATION_STEPS_BASE = [
  "Capturing Website Screenshot",
  "Analyzing Website Design",
  "Creating Visual Audit",
  "Generating Recommendations",
  "Building Before & After Section",
  "Creating Design Proposal PNG",
  "Creating Speed & SEO Proposal PNG",
  "Building Public Report",
  "Preparing Email Template"
];

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [reportState, setReportState] = useState<{ active: boolean; step: number; completed: boolean; totalSteps: number }>({
    active: false,
    step: 0,
    completed: false,
    totalSteps: 9
  });
  const { toast } = useToast();

  // Generation options
  const [options, setOptions] = useState({
    autoScreenshot: true,
    generateDesign: true,
    generateTech: true
  });

  // Editing state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isEditingProposals, setIsEditingProposals] = useState(false);
  const [editProposals, setEditProposals] = useState<string[]>([]);
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [editComments, setEditComments] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      // Load media
      const mediaData = await getMediaAssetsAction();
      setMedia(mediaData);

      // Load last lead if exists
      const lastLeadId = localStorage.getItem("lastLeadId");
      if (lastLeadId) {
        const lead = await getLeadAction(lastLeadId);
        if (lead) {
          setResult({ ...lead, leadId: lead.id });
          setEditEmail(lead.email || "");
          setEditName(lead.businessName || "");
          setEditComments(lead.developerComments || "");
          setEditProposals(lead.improvementProposals && lead.improvementProposals.length > 0 ? lead.improvementProposals : [
            "Modern Hero Section",
            "Better Typography",
            "Strong CTA Buttons",
            "Mobile First Design",
            "Faster Loading Experience",
            "Better Lead Generation",
            "SEO Friendly Structure",
            "Trust Signals & Reviews"
          ]);
        }
      }
    }
    loadInitialData();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    setResult(null);
    localStorage.removeItem("lastLeadId"); // Clear old lead while analyzing
    setReportState({ active: false, step: 0, completed: false, totalSteps: 9 });
    
    try {
      const res = await quickAnalyzeWebsite(url);
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
    const res = await updateLead(result.leadId, { improvementProposals: editProposals });
    if (res.success) {
      setResult((prev: any) => ({ ...prev, improvementProposals: editProposals }));
      setIsEditingProposals(false);
      toast({ title: "Proposals Updated" });
    }
  };

  const handleSaveComments = async () => {
    if (!result?.leadId) return;
    const res = await updateLead(result.leadId, { developerComments: editComments });
    if (res.success) {
      setResult((prev: any) => ({ ...prev, developerComments: editComments }));
      setIsEditingComments(false);
      toast({ title: "Developer Comments Saved" });
    }
  };

  const handleSelectImage = async (field: string, imageUrl: string) => {
    if (!result?.leadId) return;
    const res = await updateLead(result.leadId, { [field]: imageUrl });
    if (res.success) {
      setResult((prev: any) => ({ ...prev, [field]: imageUrl }));
      if (field === "desktopImage") {
        setOptions(prev => ({ ...prev, autoScreenshot: false }));
      }
      toast({ title: "Image updated successfully" });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const handleGenerateReport = async () => {
    if (!result?.leadId) return;
    
    const stepsToRun = [];
    if (options.autoScreenshot) stepsToRun.push("screenshot");
    stepsToRun.push("analyze", "audit", "recs", "beforeafter");
    if (options.generateDesign) stepsToRun.push("design_png");
    if (options.generateTech) stepsToRun.push("tech_png");
    stepsToRun.push("public", "email");

    setReportState({ active: true, step: 0, completed: false, totalSteps: stepsToRun.length });
    setResult((prev: any) => ({ ...prev, reportStatus: "Generating" }));

    try {
      await setReportGenerating(result.leadId);
      let currentStep = 0;

      if (options.autoScreenshot) {
        setReportState(s => ({ ...s, step: ++currentStep }));
        await actionCaptureScreenshot(result.leadId);
      }
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionAnalyzeDesign(result.leadId);
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionVisualAudit(result.leadId);
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionRecommendations(result.leadId);
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionBeforeAfter(result.leadId);
      
      if (options.generateDesign) {
        setReportState(s => ({ ...s, step: ++currentStep }));
        await actionProposalPng(result.leadId);
      }

      if (options.generateTech) {
        setReportState(s => ({ ...s, step: ++currentStep }));
        await actionProposalPngTech(result.leadId);
      }
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionPublicReport(result.leadId);
      
      setReportState(s => ({ ...s, step: ++currentStep }));
      await actionPrepareEmail(result.leadId);
      
      // Re-fetch final lead data to get generated image paths
      const updatedLead = await getLeadAction(result.leadId);
      if (updatedLead) {
        setResult((prev: any) => ({ ...prev, ...updatedLead, reportStatus: "Generated" }));
      } else {
        setResult((prev: any) => ({ ...prev, reportStatus: "Generated" }));
      }
      
      setReportState(s => ({ ...s, active: false, completed: true }));
      toast({ title: "Report Generated", description: "All assets have been successfully created." });
    } catch (err) {
      console.error("Report generation error:", err);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
      setReportState({ active: false, step: 0, completed: false, totalSteps: 9 });
      setResult((prev: any) => ({ ...prev, reportStatus: "Not Generated" }));
    }
  };

  const activeSteps = [
    ...(options.autoScreenshot ? ["Capturing Website Screenshot"] : []),
    "Analyzing Website Design",
    "Creating Visual Audit",
    "Generating Recommendations",
    "Building Before & After Section",
    ...(options.generateDesign ? ["Creating Design Proposal PNG"] : []),
    ...(options.generateTech ? ["Creating Speed & SEO Proposal PNG"] : []),
    "Building Public Report",
    "Preparing Email Template"
  ];

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Generation Dashboard</h1>
        <p className="text-muted-foreground mt-2">Step 1: Analyze website to extract data. Step 2: Generate comprehensive proposal report.</p>
      </div>

      {/* Analysis Input */}
      <Card className="border-primary/20 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Enter website URL (e.g., https://example.com)" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 text-lg"
                disabled={isAnalyzing || reportState.active}
              />
            </div>
            <Button type="submit" disabled={isAnalyzing || !url || reportState.active} className="h-12 px-8 text-md">
              {isAnalyzing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
              ) : (
                <><Search className="mr-2 h-5 w-5" /> Analyze Website</>
              )}
            </Button>
          </form>
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
                  
                  <div className="flex flex-col p-3 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Business Name</p>
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <Input size={1} value={editName} onChange={e => setEditName(e.target.value)} className="h-8" />
                        <Button size="icon" className="h-8 w-8" onClick={handleUpdateName}><Save className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingName(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium truncate flex items-center justify-between">
                        {result.businessName}
                        <Edit3 className="h-3 w-3 opacity-30 cursor-pointer hover:opacity-100" onClick={() => setIsEditingName(true)} />
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col p-3 rounded-lg border bg-card/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</p>
                    {isEditingEmail ? (
                      <div className="flex gap-2">
                        <Input size={1} value={editEmail} onChange={e => setEditEmail(e.target.value)} className="h-8" />
                        <Button size="icon" className="h-8 w-8" onClick={handleUpdateEmail}><Save className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingEmail(false)}><X className="h-4 w-4" /></Button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium truncate flex items-center justify-between">
                        {result.email || "Not Found"}
                        <Edit3 className="h-3 w-3 opacity-30 cursor-pointer hover:opacity-100" onClick={() => setIsEditingEmail(true)} />
                      </p>
                    )}
                  </div>

                  <InfoItem icon={<Phone />} label="Phone" value={result.phone || "Not Found"} />
                  <InfoItem icon={<MapPin />} label="Address" value={result.address || "Not Found"} />
                  <InfoItem icon={<Search />} label="Social Links" value={result.socialLinks || "None Found"} />
                </CardContent>
              </Card>

              {result.designAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Design Identity</CardTitle>
                    <CardDescription>Visual patterns and structure detected on the website.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detected Fonts</p>
                        <div className="flex flex-wrap gap-2">
                          {result.designAnalysis.fonts?.map((font: string) => (
                            <Badge key={font} variant="secondary" className="font-bold">{font}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Color Palette</p>
                        <div className="flex gap-2">
                          {result.designAnalysis.colors?.background?.map((color: string, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full border shadow-sm" style={{ backgroundColor: color }} title={color} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StructureBadge label="Navbar" active={result.designAnalysis.structure?.hasNavbar} />
                      <StructureBadge label="Hero Section" active={result.designAnalysis.structure?.hasHero} />
                      <StructureBadge label="Footer" active={result.designAnalysis.structure?.hasFooter} />
                      <div className="p-3 rounded-xl border bg-card/50 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">CTAs</p>
                        <p className="text-xl font-bold">{result.designAnalysis.structure?.ctaCount || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xl">Website Scores</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingProposals(true)}>
                    <Edit3 className="h-4 w-4 mr-2" /> Edit Proposals
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <ScoreItem label="Overall" score={result.overallScore} color={getScoreColor(result.overallScore)} />
                    <ScoreItem label="Performance" score={result.performanceScore} color={getScoreColor(result.performanceScore)} />
                    <ScoreItem label="SEO" score={result.seoScore} color={getScoreColor(result.seoScore)} />
                    <ScoreItem label="Access." score={result.accessibilityScore} color={getScoreColor(result.accessibilityScore)} />
                    <ScoreItem label="Best Prac." score={result.bestPracticesScore} color={getScoreColor(result.bestPracticesScore)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <Edit3 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Developer Comments</CardTitle>
                        <CardDescription>Add technical insights or personalized design notes for the client.</CardDescription>
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
                        <Textarea 
                          value={editComments} 
                          onChange={e => setEditComments(e.target.value)}
                          placeholder="Type your professional audit comments here... (e.g., 'Your website has a strong foundation, but the hero section lacks a clear call to action...')"
                          className="min-h-[200px] border-0 focus-visible:ring-0 text-md leading-relaxed p-6"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Markdown is supported for basic formatting. These comments will appear on the final PNG and Web reports.</p>
                    </div>
                  ) : (
                    <div className="relative group">
                      {result.developerComments ? (
                        <div className="prose prose-slate max-w-none p-6 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px] text-slate-700 leading-relaxed italic">
                          "{result.developerComments}"
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Media Assets</CardTitle>
                  <CardDescription>Select images from your media library or use auto-capture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex justify-between items-center">
                        Main Screenshot
                        <Badge variant={options.autoScreenshot ? "default" : "outline"} className="text-[10px] h-4 cursor-pointer" onClick={() => setOptions(o => ({ ...o, autoScreenshot: !o.autoScreenshot }))}>
                          {options.autoScreenshot ? "Auto-capture ON" : "Manual Select"}
                        </Badge>
                      </Label>
                      <MediaSelector 
                        currentImage={result.desktopImage} 
                        media={media} 
                        onSelect={(url) => handleSelectImage("desktopImage", url)} 
                        label="Desktop Screenshot"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Before / After Image</Label>
                      <MediaSelector 
                        currentImage={result.beforeAfterImage} 
                        media={media} 
                        onSelect={(url) => handleSelectImage("beforeAfterImage", url)} 
                        label="Before/After"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proposal Image (Manual)</Label>
                      <MediaSelector 
                        currentImage={result.proposalImage} 
                        media={media} 
                        onSelect={(url) => handleSelectImage("proposalImage", url)} 
                        label="Proposal PNG"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Generation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                    <Label htmlFor="gen-design" className="flex-1 cursor-pointer">Design Proposal</Label>
                    <input 
                      type="checkbox" 
                      id="gen-design" 
                      checked={options.generateDesign} 
                      onChange={e => setOptions(o => ({ ...o, generateDesign: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg border bg-card/50">
                    <Label htmlFor="gen-tech" className="flex-1 cursor-pointer">Speed & SEO Proposal</Label>
                    <input 
                      type="checkbox" 
                      id="gen-tech" 
                      checked={options.generateTech} 
                      onChange={e => setOptions(o => ({ ...o, generateTech: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleGenerateReport}
                    disabled={reportState.active || result.reportStatus === "Generated"}
                  >
                    {reportState.active ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" /> {result.reportStatus === "Generated" ? "Report Generated" : "Start Generation"}</>
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
                    {result.proposalImage && (
                      <Button variant="outline" className="justify-start text-xs h-10" asChild>
                        <a href={result.proposalImage} target="_blank" rel="noreferrer">
                          <ImageIcon className="mr-2 h-4 w-4" /> Design Proposal PNG
                        </a>
                      </Button>
                    )}
                    {result.proposalImageTech && (
                      <Button variant="outline" className="justify-start text-xs h-10" asChild>
                        <a href={result.proposalImageTech} target="_blank" rel="noreferrer">
                          <ImageIcon className="mr-2 h-4 w-4" /> Speed & SEO PNG
                        </a>
                      </Button>
                    )}
                    {result.beforeAfterImage && (
                      <Button variant="outline" className="justify-start text-xs h-10" asChild>
                        <a href={result.beforeAfterImage} target="_blank" rel="noreferrer">
                          <ImageIcon className="mr-2 h-4 w-4" /> Before/After Image
                        </a>
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
