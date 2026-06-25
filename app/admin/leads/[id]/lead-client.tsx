"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { sendLeadEmail } from "@/lib/email-actions";
import { generateProposalPng, updateLead } from "@/lib/lead-actions";
import { getReportContent } from "@/lib/report-content";
import { Loader2, Send, AlertTriangle, Monitor, Smartphone, CheckCircle2, Zap, Search, Palette, BarChart, ExternalLink, Download, RefreshCw, FileImage, Globe, MessageCircle, Save, FolderKanban } from "lucide-react";

export default function LeadDetailClient({ lead, templates, settings, portfolioExamples }: { lead: any, templates: any[], settings: any, portfolioExamples: any[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toEmail, setToEmail] = useState(lead.email || "");
  const [isPreview, setIsPreview] = useState(false);

  const aiFields = useMemo(() => {
    const ai = lead.aiAnalysis || {};
    return {
      seoScore: (ai as any)?.seoScore,
      accessibilityScore: (ai as any)?.accessibilityScore,
      bestPracticesScore: (ai as any)?.bestPracticesScore,
      reportContent: getReportContent(lead.reportContent),
    };
  }, [lead]);

  useEffect(() => {
    setToEmail(lead.email || "");
  }, [lead.email]);

  const parseTemplate = (text: string, isForPreview = false) => {
    if (!text) return "";
    const baseUrl = settings?.portfolioUrl || "";
    const getFullUrl = (path: string) => {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const cleanPath = path.startsWith("/") ? path : `/${path}`;
      return `${cleanBase}${cleanPath}`;
    };

    const reportUrl = getFullUrl(`/report/${lead.id}`);
    const proposalPngUrl = lead.proposalImage ? getFullUrl(lead.proposalImage) : "";

    const proposalsHtml = lead.improvementProposals && lead.improvementProposals.length > 0
      ? `<ul style="color: #475569; font-family: sans-serif; padding-left: 20px;">${lead.improvementProposals.map((p: string) => `<li style="margin-bottom: 8px;">${p}</li>`).join("")}</ul>`
      : "No major improvements suggested.";

    const commentsHtml = lead.developerComments 
      ? `<div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-left: 4px solid #6366f1; font-style: italic; color: #334155; border-radius: 8px;">
          <strong>Expert Technical Insight:</strong><br/>
          "${lead.developerComments}"
         </div>`
      : "";

    let processed = text
      .replace(/{{businessName}}|{businessName}/g, lead.businessName || "there")
      .replace(/{{website}}|{website}/g, lead.website || "")
      .replace(/{{websiteScore}}|{score}/g, lead.websiteScore || "N/A")
      .replace(/{{performanceScore}}|{performanceScore}/g, lead.performanceScore || "N/A")
      .replace(/{{seoScore}}|{seoScore}/g, lead.seoScore || "N/A")
      .replace(/{{designScore}}|{designScore}/g, lead.designScore || "N/A")
      .replace(/{{conversionScore}}|{conversionScore}/g, lead.conversionScore || "N/A")
      .replace(/{{mobileScore}}|{mobileScore}/g, lead.mobileScore || "N/A")
      .replace(/{{accessibilityScore}}|{accessibilityScore}/g, lead.accessibilityScore || "N/A")
      .replace(/{{bestPracticesScore}}|{bestPracticesScore}/g, lead.bestPracticesScore || "N/A")
      .replace(/{{improvementProposals}}|{improvementProposals}/g, proposalsHtml)
      .replace(/{{developerComments}}|{developerComments}/g, commentsHtml)
      .replace(/{{reportUrl}}|{reportUrl}/g, reportUrl)
      .replace(/{{proposalPngUrl}}|{proposalPngUrl}/g, proposalPngUrl)
      .replace(/{{reportLink}}|{reportLink}/g, `<a href="${reportUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0;">View Full Audit Report</a>`)
      .replace(/{{proposalPngLink}}|{proposalPngLink}/g, proposalPngUrl ? `<a href="${proposalPngUrl}" style="color: #2563eb; text-decoration: underline; font-weight: bold;">Download Your Website Proposal (PNG)</a>` : "")
      .replace(/{{proposalPngImage}}|{proposalPngImage}/g, proposalPngUrl ? `<div style="margin: 24px 0; text-align: center;"><a href="${proposalPngUrl}"><img src="${proposalPngUrl}" alt="Website Proposal" style="width: 100%; max-width: 600px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);" /></a></div>` : "")
      .replace(/{{beforeAfterImage}}|{beforeAfterImage}/g, (lead.beforeAfterImage && aiFields.reportContent.includeBeforeAfter) ? `<div style="margin: 24px 0;"><p style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Proposed Visual Redesign:</p><img src="${getFullUrl(lead.beforeAfterImage)}" alt="Redesign Proposal" style="width: 100%; max-width: 600px; border-radius: 12px; border: 1px solid #e2e8f0;" /></div>` : "")
      .replace(/{{desktopImage}}|{desktopImage}/g, lead.desktopImage ? `<img src="${getFullUrl(lead.desktopImage)}" alt="Current Website" style="width: 100%; max-width: 600px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;" />` : "")
      .replace(/{{topIssues}}|{topIssues}/g, lead.topIssues || "N/A")
      .replace(/{{demoLink}}|{demoLink}/g, settings?.demoWebsiteUrls || "https://demo.example.com")
      .replace(/{{myName}}|{myName}|\[Your Name\]/g, settings?.senderName || "Hassan");

    return processed;
  };

  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate === "ai-focused") {
        const proposal = lead.aiAnalysis?.proposal_content;
        if (proposal) {
          setSubject(proposal.email_subject);
          setBody(proposal.email_body.replace(/\n/g, "<br/>"));
        }
        return;
      }
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setSubject(parseTemplate(template.subject));
        setBody(parseTemplate(template.body));
      }
    }
  }, [selectedTemplate]);

  const handleSend = async () => {
    if (!toEmail) {
      toast({ title: "Error", description: "Recipient email is required.", variant: "destructive" });
      return;
    }
    const sentEmailCount = lead.emailLogs?.filter((log: any) => log.status === "Sent").length || 0;
    if (sentEmailCount >= 5) {
      const confirmed = window.confirm(`${sentEmailCount} emails have already been sent to this lead. Send again?`);
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      const templateId = selectedTemplate === "ai-focused" ? null : (selectedTemplate || null);
      const result = await sendLeadEmail(lead.id, templateId, body, subject, toEmail);
      if (result.success) {
        toast({ title: "Email Sent", description: "The proposal has been sent successfully." });
        router.refresh();
      } else {
        toast({ title: "Send Failed", description: result.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePng = async () => {
    setGenerating(true);
    try {
      const result = await generateProposalPng(lead.id);
      if (result.success) {
        toast({ title: "Success", description: "Proposal PNG generated successfully." });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!toEmail) return;
    setUpdating(true);
    try {
      const result = await updateLead(lead.id, { email: toEmail });
      if (result.success) {
        toast({ title: "Lead Updated", description: "Email address has been saved." });
        router.refresh();
      } else {
        toast({ title: "Update Failed", description: result.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const hasScore = lead.websiteScore !== null;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lead.businessName || lead.website}</h1>
            <Button variant="outline" size="sm" asChild className="h-8">
               <a href={`https://www.google.com/search?q=${encodeURIComponent(lead.businessName || lead.website)}`} target="_blank" rel="noreferrer">
                  <Search className="h-3 w-3 mr-2" />
                  Search on Google
               </a>
            </Button>
          </div>
          <p className="text-muted-foreground flex items-center gap-1 mt-1">
            {lead.website} <ExternalLink className="h-3 w-3" />
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={lead.status === "Contacted" ? "default" : "secondary"}>{lead.status}</Badge>
          {lead.leadScore && <Badge variant="outline">Lead Score: {lead.leadScore}</Badge>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Analysis Results */}
          {hasScore && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreCard label="Performance" score={lead.performanceScore ?? lead.pageSpeedPerformance} icon={<Zap className="h-4 w-4" />} />
                <ScoreCard label="SEO" score={lead.seoScore ?? lead.pageSpeedSeo} icon={<Search className="h-4 w-4" />} />
                <ScoreCard label="Accessibility" score={lead.accessibilityScore ?? lead.pageSpeedAccessibility} icon={<Search className="h-4 w-4" />} />
                <ScoreCard label="Best Practices" score={lead.bestPracticesScore ?? lead.pageSpeedBestPractices} icon={<CheckCircle2 className="h-4 w-4" />} />
              </div>



              {/* Related Portfolio Examples Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Related Portfolio Examples ({lead.category || "General"})
                  </CardTitle>
                  <CardDescription>These examples will be featured on the proposal PNG.</CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolioExamples && portfolioExamples.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      {portfolioExamples.map((item: any) => (
                        <div key={item.id} className="border rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative aspect-video bg-muted">
                            <img src={item.thumbnail} alt={item.title} className="object-cover w-full h-full" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 mb-3 h-8">{item.description}</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                              <Globe className="h-3 w-3" />
                              {item.url.replace('https://', '').replace('www.', '').split('/')[0]}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800 flex items-start gap-4">
                      <AlertTriangle className="h-6 w-6 shrink-0" />
                      <div>
                        <p className="font-bold">No matching portfolio examples found!</p>
                        <p className="text-sm mt-1">
                          Go to the <Button variant="link" className="p-0 h-auto text-amber-900 font-bold underline" onClick={() => router.push('/admin')}>Admin Dashboard</Button> and add some examples for the <strong>{lead.category || "General"}</strong> category to make the proposal more effective.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {lead.beforeAfterImage && aiFields.reportContent.includeBeforeAfter && (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>Redesign Proposal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <img src={lead.beforeAfterImage} alt="Before/After" className="w-full h-auto" />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Top Improvement Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {lead.improvementProposals?.map((p: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem label="Website" value={lead.website} />
                <DetailItem label="Email" value={lead.email || "Not found"} />
                <DetailItem label="Phone" value={lead.phone || "Not found"} />
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="City" value={lead.city || "-"} />
                  <DetailItem label="Category" value={lead.category || "-"} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Raw Metadata</span>
                  <pre className="mt-2 text-[10px] bg-muted p-3 rounded overflow-auto max-h-40 whitespace-pre-wrap">{lead.topIssues || "N/A"}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email History</CardTitle>
              </CardHeader>
              <CardContent>
                {lead.emailLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No emails sent yet.</p>
                ) : (
                  <div className="space-y-4">
                    {lead.emailLogs.map((log: any) => (
                      <div key={log.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{log.subject}</span>
                          <span className="text-muted-foreground text-xs">{new Date(log.sentAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>To: {log.toEmail}</span>
                          <Badge variant={log.status === "Sent" ? "default" : "destructive"} className="text-[10px] py-0 h-4">{log.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="sticky top-8 overflow-hidden border-2 shadow-xl">
            <CardHeader className="bg-slate-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Send Proposal Email</CardTitle>
                  <CardDescription>Compose and preview your audit results.</CardDescription>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-lg">
                  <Button 
                    variant={!isPreview ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => setIsPreview(false)}
                  >
                    Write
                  </Button>
                  <Button 
                    variant={isPreview ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-7 px-3 text-[10px] font-black uppercase tracking-widest"
                    onClick={() => setIsPreview(true)}
                  >
                    Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!lead.email && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100 shadow-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <p className="font-medium">No email address found for this lead. Please enter one below to enable sending.</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="toEmail" className="text-xs font-black uppercase tracking-widest text-slate-500">Recipient Email</Label>
                  <div className="flex gap-2">
                    <Input id="toEmail" value={toEmail} onChange={e => setToEmail(e.target.value)} placeholder="client@example.com" className="h-10 font-medium" />
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={handleUpdateEmail} disabled={updating} title="Save to lead record">
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Email Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="h-10 font-medium">
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {lead.aiAnalysis?.proposal_content && (
                        <SelectItem value="ai-focused">AI · Focused Category Proposal</SelectItem>
                      )}
                      {templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-500">Subject Line</Label>
                  <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="h-10 font-bold" />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="body" className="text-xs font-black uppercase tracking-widest text-slate-500 flex justify-between">
                    Email Content
                    <span className="text-[10px] lowercase font-medium text-slate-400">supports HTML and shortcodes</span>
                  </Label>
                  
                  {isPreview ? (
                    <div className="min-h-[350px] p-6 rounded-xl border-2 border-slate-100 bg-white overflow-auto prose prose-slate max-w-none shadow-inner">
                       <div dangerouslySetInnerHTML={{ __html: body }} />
                    </div>
                  ) : (
                    <Textarea 
                      id="body" 
                      className="min-h-[350px] text-sm font-mono p-4 leading-relaxed focus-visible:ring-primary/20 border-2" 
                      value={body} 
                      onChange={e => setBody(e.target.value)} 
                    />
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 bg-slate-50 border-t flex flex-col gap-4">
              <Button onClick={handleSend} disabled={loading || !toEmail} className="w-full h-12 text-lg font-black shadow-lg shadow-primary/20">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending Proposal...</> : <><Send className="mr-2 h-5 w-5" /> Send Proposal Now</>}
              </Button>
              <p className="text-[10px] text-center text-slate-400 font-medium">
                Sent via Resend API • {lead.emailLogs?.length || 0} attempts recorded
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, icon }: { label: string, score: number, icon: React.ReactNode }) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-green-500";
    if (s >= 70) return "text-blue-500";
    if (s >= 50) return "text-orange-500";
    return "text-red-500";
  };

  return (
    <div className="bg-muted/50 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground uppercase mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  if (label === "Phone" && value && value !== "Not found") {
    const numbers = value.split(",").map(n => n.trim()).filter(Boolean);
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
        <div className="flex flex-wrap gap-2">
          {numbers.map((num, i) => {
            const cleanNum = num.replace(/\D/g, "");
            return (
              <div key={i} className="flex items-center gap-2 bg-muted/50 border rounded-lg px-3 py-1.5 text-sm font-medium">
                {num}
                <a 
                  href={`https://wa.me/${cleanNum}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 fill-green-600/10" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
      <div className="text-sm font-medium break-all">{value}</div>
    </div>
  );
}

