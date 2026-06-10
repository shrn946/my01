"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { analyzeWebsite, updateLead } from "@/lib/lead-actions";
import { Loader2, RefreshCw, Mail, FileText, Send, CheckCircle2, Monitor, Smartphone, Zap, Search, Palette, BarChart, Edit2, Save, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function AuditClient({ lead }: { lead: any }) {
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(lead.email || "");
  const { toast } = useToast();
  const router = useRouter();

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const result = await analyzeWebsite(lead.id);
      if (result.success) {
        toast({ title: "Analysis Complete", description: "Website data and scores updated." });
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error || "Analysis failed", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    setUpdating(true);
    try {
      const result = await updateLead(lead.id, { email: emailValue });
      if (result.success) {
        toast({ title: "Email Updated", description: "The lead's email has been saved." });
        setIsEditingEmail(false);
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const hasScore = lead.websiteScore !== null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{lead.businessName || "Unknown Business"} Audit</h1>
          <p className="text-muted-foreground">{lead.website}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleRunAudit} disabled={loading} variant={hasScore ? "outline" : "default"}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><RefreshCw className="mr-2 h-4 w-4" /> {hasScore ? "Re-run Analysis" : "Run Website Analysis"}</>}
          </Button>
          {hasScore && (
            <>
              <Button variant="outline" onClick={() => router.push(`/admin/leads/${lead.id}`)}>
                <Mail className="mr-2 h-4 w-4" /> Generate Email
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Generate PDF Report
              </Button>
              <Button onClick={() => router.push(`/admin/leads/${lead.id}`)}>
                <Send className="mr-2 h-4 w-4" /> Send Proposal
              </Button>
            </>
          )}
        </div>
      </div>

      {hasScore && lead.beforeAfterImage && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Design Improvement Proposal</CardTitle>
            <CardDescription>Visual comparison between the current website and our proposed modern redesign.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative aspect-[1200/500] w-full">
              <img src={lead.beforeAfterImage} alt="Before and After Comparison" className="w-full h-auto" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Website Analysis Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {!hasScore ? (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Run the analysis to see performance and design scores.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <ScoreCard label="Overall Score" score={lead.websiteScore} icon={<CheckCircle2 className="h-4 w-4" />} />
                  <ScoreCard label="Performance" score={lead.performanceScore} icon={<Zap className="h-4 w-4" />} />
                  <ScoreCard label="SEO" score={lead.seoScore} icon={<Search className="h-4 w-4" />} />
                  <ScoreCard label="Design" score={lead.designScore} icon={<Palette className="h-4 w-4" />} />
                  <ScoreCard label="Conversion" score={lead.conversionScore} icon={<BarChart className="h-4 w-4" />} />
                  <ScoreCard label="Mobile Friendly" score={lead.mobileScore} icon={<Smartphone className="h-4 w-4" />} />
                </div>

                {lead.designAnalysis && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" /> Design Insights (Crawled)
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Color Palette</p>
                          <div className="flex flex-wrap gap-2">
                            {(lead.designAnalysis as any).colors?.background?.map((color: string, i: number) => (
                              <div key={i} className="group relative">
                                <div className="h-10 w-10 rounded-lg border shadow-sm" style={{ backgroundColor: color }} />
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                                  {color}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Typography</p>
                          <div className="flex flex-wrap gap-2">
                            {(lead.designAnalysis as any).fonts?.map((font: string, i: number) => (
                              <Badge key={i} variant="outline" style={{ fontFamily: font }}>{font}</Badge>
                            ))}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-2">
                            H1 Size: {(lead.designAnalysis as any).typography?.h1FontSize} | Weight: {(lead.designAnalysis as any).typography?.h1FontWeight}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Structural Audit</p>
                        <div className="grid grid-cols-2 gap-2">
                          <StatusBadge label="Hero Section" exists={(lead.designAnalysis as any).structure?.hasHero} />
                          <StatusBadge label="Navigation" exists={(lead.designAnalysis as any).structure?.hasNavbar} />
                          <StatusBadge label="Footer" exists={(lead.designAnalysis as any).structure?.hasFooter} />
                          <StatusBadge label="Flex/Grid" exists={(lead.designAnalysis as any).structure?.hasFlex || (lead.designAnalysis as any).structure?.hasGrid} />
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <p className="text-xs text-muted-foreground">Detected {(lead.designAnalysis as any).structure?.ctaCount} Call-to-Action elements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.improvementProposals && lead.improvementProposals.length > 0 ? (
              <ul className="space-y-3">
                {lead.improvementProposals.map((proposal: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{proposal}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic">No proposals generated yet. Run analysis to see suggestions.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" /> Desktop View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lead.desktopImage ? (
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <img src={lead.desktopImage} alt="Desktop View" className="w-full h-auto" />
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No desktop screenshot available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" /> Mobile View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lead.mobileImage ? (
              <div className="max-w-[280px] mx-auto border-[8px] border-gray-800 rounded-[32px] overflow-hidden shadow-xl aspect-[9/16]">
                <img src={lead.mobileImage} alt="Mobile View" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[9/16] max-w-[280px] mx-auto bg-muted flex items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground text-center px-4">No mobile screenshot available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Lead Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <DetailItem label="Status" value={<Badge>{lead.status}</Badge>} />
            <div className="space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center">
                <span>Emails</span>
                <button onClick={() => setIsEditingEmail(!isEditingEmail)} className="text-primary hover:underline">
                  {isEditingEmail ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                </button>
              </div>
              {isEditingEmail ? (
                <div className="flex gap-2 mt-1">
                  <Input className="h-8 text-xs" value={emailValue} onChange={e => setEmailValue(e.target.value)} />
                  <Button size="sm" className="h-8 px-2" onClick={handleUpdateEmail} disabled={updating}>
                    {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  </Button>
                </div>
              ) : (
                <div className="text-sm font-medium">{lead.email || "None found"}</div>
              )}
            </div>
            <DetailItem label="Phones" value={lead.phone || "None found"} />
            <DetailItem label="Location" value={`${lead.city || "-"}, ${lead.address || "-"}`} />
            <DetailItem label="Category" value={lead.category || "-"} />
            <DetailItem label="Source" value={lead.source || "-"} />
            <DetailItem label="Lead Score" value={<Badge variant="outline">{lead.leadScore || "N/A"}</Badge>} />
          </div>
          <div className="mt-6">
            <span className="text-sm font-semibold text-muted-foreground uppercase">Extraction Insights</span>
            <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto max-h-48 whitespace-pre-wrap">{lead.topIssues || "N/A"}</pre>
          </div>
        </CardContent>
      </Card>
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
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase mb-2">
        {icon}
        {label}
      </div>
      <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ label, exists }: { label: string, exists: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${exists ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
      {exists ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}

