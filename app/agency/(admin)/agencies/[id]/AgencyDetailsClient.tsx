"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  MapPin, 
  Eye, 
  Send, 
  CalendarClock, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  Trash2, 
  Plus, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Settings,
  CornerDownRight,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateAgency } from "@/lib/agency-actions";
import { 
  updateProposalContent, 
  createCustomEmail, 
  triggerSendEmail, 
  triggerDeleteEmail, 
  createAgencyDetailFollowup, 
  toggleFollowupStatus,
  deleteAgencyDetailFollowup,
  getCompiledEmailPreviewAction,
  toggleEmailProposalOption
} from "./actions";
import EmailPreviewModal from "@/components/EmailPreviewModal";

type EmailItem = {
  id: string;
  subject: string;
  bodyHtml: string;
  status: string;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  includeProposal: boolean;
};

type FollowupItem = {
  id: string;
  dueDate: Date;
  status: string;
  notes: string | null;
};

type AgencyDetail = {
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
  proposalHeadline: string | null;
  proposalIntro: string | null;
  proposalViewCount: number;
  proposalViewedAt: Date | null;
  createdAt: Date;
  emails: EmailItem[];
  followups: FollowupItem[];
};

const STATUSES = ["New", "Email Draft", "Email Sent", "Opened", "Replied", "Interested", "Proposal Viewed", "Client", "Closed"];

export default function AgencyDetailsClient({ agency }: { agency: AgencyDetail }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"profile" | "proposal" | "emails" | "followups" | "timeline">("profile");

  const [profileData, setProfileData] = useState({
    name: agency.name,
    website: agency.website,
    contactName: agency.contactName || "",
    email: agency.email || "",
    linkedin: agency.linkedin || "",
    country: agency.country || "",
    city: agency.city || "",
    notes: agency.notes || "",
    status: agency.status
  });

  const [proposalHeadline, setProposalHeadline] = useState(agency.proposalHeadline || "");
  const [proposalIntro, setProposalIntro] = useState(agency.proposalIntro || "");

  const [composeSubject, setComposeSubject] = useState(`White-label Web Development Partnership - CoreWebLabs & ${agency.name}`);
  const [composeBody, setComposeBody] = useState(`<p>Hi ${agency.contactName || "Team"},</p>\n<p>Hope you are doing well.</p>\n<p>I would love to connect to see if we can support your design agency as a website development partner.</p>\n<p>You can view our dedicated partnership proposal here: {{proposal_url}}</p>\n<p>Best regards,</p>`);
  const [isComposing, setIsComposing] = useState(false);
  const [includeProposal, setIncludeProposal] = useState(true);

  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");

  const [targetEmail, setTargetEmail] = useState(agency.email || "");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ subject: "", html: "", text: "" });

  const handlePreviewClick = async (emailId: string) => {
    try {
      const res = await getCompiledEmailPreviewAction(emailId);
      if (res.success && res.html) {
        setPreviewData({
          subject: res.subject || "",
          html: res.html,
          text: res.text || ""
        });
        setPreviewOpen(true);
      } else {
        toast({ title: "Failed to compile preview", description: res.error, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Preview Error", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateTargetEmail = async () => {
    startTransition(async () => {
      const res = await updateAgency(agency.id, { email: targetEmail });
      if (res.success) {
        toast({ title: "Target Email Updated Successfully" });
        setProfileData(prev => ({ ...prev, email: targetEmail }));
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateAgency(agency.id, profileData);
      if (res.success) {
        toast({ title: "Profile Updated" });
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleStatusChange = async (val: string) => {
    setProfileData(prev => ({ ...prev, status: val }));
    const res = await updateAgency(agency.id, { status: val });
    if (res.success) {
      toast({ title: `Status updated to ${val}` });
      router.refresh();
    }
  };

  const handleProposalSave = async () => {
    startTransition(async () => {
      const res = await updateProposalContent(agency.id, proposalHeadline, proposalIntro);
      if (res.success) {
        toast({ title: "Proposal Page Updated" });
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleCreateEmailDraft = async () => {
    if (!composeSubject || !composeBody) {
      toast({ title: "Error", description: "Subject and body are required.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const res = await createCustomEmail(agency.id, composeSubject, composeBody, undefined, includeProposal);
      if (res.success) {
        toast({ title: "Email Draft Saved" });
        setIsComposing(false);
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error || "Failed to save draft.", variant: "destructive" });
      }
    });
  };

  const handleSendEmail = async (emailId: string) => {
    toast({ title: "Sending email..." });
    const res = await triggerSendEmail(emailId);
    if (res.success) {
      toast({ title: res.simulated ? "Simulated Send Success" : "Email Sent Successfully" });
      router.refresh();
    } else {
      toast({ title: "Failed to Send", description: res.error, variant: "destructive" });
    }
  };

  const handleDeleteEmail = async (emailId: string) => {
    if (!confirm("Delete this email history item?")) return;
    const res = await triggerDeleteEmail(emailId);
    if (res.success) {
      toast({ title: "Email Deleted" });
      router.refresh();
    }
  };

  const handleToggleProposalOption = async (emailId: string, currentVal: boolean) => {
    const res = await toggleEmailProposalOption(emailId, currentVal);
    if (res.success) {
      toast({ title: `Proposal link ${!currentVal ? 'included' : 'excluded'}` });
      router.refresh();
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupDate) return;

    startTransition(async () => {
      const res = await createAgencyDetailFollowup(agency.id, followupDate, followupNotes);
      if (res.success) {
        toast({ title: "Follow-up Created" });
        setFollowupDate("");
        setFollowupNotes("");
        router.refresh();
      } else {
        toast({ title: "Error", description: "Failed to save followup.", variant: "destructive" });
      }
    });
  };

  const handleToggleFollowup = async (fuId: string, currentStatus: string) => {
    const res = await toggleFollowupStatus(agency.id, fuId, currentStatus);
    if (res.success) {
      toast({ title: "Follow-up status updated" });
      router.refresh();
    }
  };

  const handleDeleteFollowup = async (fuId: string) => {
    if (!confirm("Remove this follow-up?")) return;
    const res = await deleteAgencyDetailFollowup(agency.id, fuId);
    if (res.success) {
      toast({ title: "Follow-up Deleted" });
      router.refresh();
    }
  };

  const publicProposalUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/agency/proposal/${agency.slug}` 
    : `/agency/proposal/${agency.slug}`;

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">{agency.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              agency.status === "Client" ? "bg-emerald-50 text-emerald-700 border border-emerald-250" :
              agency.status === "Interested" ? "bg-rose-50 text-rose-700 border border-rose-250" :
              agency.status === "Proposal Viewed" ? "bg-indigo-50 text-indigo-700 border border-indigo-250" :
              agency.status === "Email Sent" ? "bg-green-55 text-green-700 border border-green-250" :
              "bg-slate-100 text-slate-650 border border-slate-200"
            }`}>
              {agency.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-2">
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-slate-400" /> {agency.website}</span>
            {agency.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {agency.email}</span>}
            {agency.city && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {agency.city}, {agency.country}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={profileData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 w-44">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-850">
              {STATUSES.map((st) => (
                <SelectItem key={st} value={st}>{st}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 bg-white">
            <Link href={`/agency/agencies/${agency.id}/edit`}>
              <Settings className="w-4 h-4 mr-2 text-indigo-650" /> Edit Agency
            </Link>
          </Button>

          <Button asChild variant="outline" className="border-slate-200 hover:bg-slate-50 text-slate-700 bg-white">
            <a href={publicProposalUrl} target="_blank" rel="noreferrer">
              <Eye className="w-4 h-4 mr-2 text-indigo-600" /> View Proposal
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 flex gap-4 overflow-x-auto pb-px">
        {[
          { id: "profile", label: "Profile Card", icon: User },
          { id: "proposal", label: "Proposal Editor", icon: FileText },
          { id: "emails", label: "Outreach Emails", icon: Mail },
          { id: "followups", label: "Follow Ups", icon: CalendarClock },
          { id: "timeline", label: "Timeline / Activity", icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-650 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 gap-6">
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">Edit Profile Card</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData(p => ({ ...p, name: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input 
                    id="website" 
                    name="website" 
                    value={profileData.website} 
                    onChange={(e) => setProfileData(p => ({ ...p, website: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input 
                    id="contactName" 
                    name="contactName" 
                    value={profileData.contactName} 
                    onChange={(e) => setProfileData(p => ({ ...p, contactName: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={profileData.email} 
                    onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={profileData.city} 
                    onChange={(e) => setProfileData(p => ({ ...p, city: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    value={profileData.country} 
                    onChange={(e) => setProfileData(p => ({ ...p, country: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  name="linkedin" 
                  value={profileData.linkedin} 
                  onChange={(e) => setProfileData(p => ({ ...p, linkedin: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  rows={4}
                  value={profileData.notes} 
                  onChange={(e) => setProfileData(p => ({ ...p, notes: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                />
              </div>

              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Save Profile Details
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Metadata</h3>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Added On:</span>
                    <span className="font-mono text-slate-800">{new Date(agency.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Services:</span>
                    <span className="text-slate-800 text-right">{agency.services.slice(0, 3).join(", ") || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span>Tech Stack:</span>
                    <span className="text-slate-800 text-right">{agency.techStack.join(", ") || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* PROPOSAL TAB */}
        {activeTab === "proposal" && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Partnership Proposal Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Customize the landing page content for this agency.</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-500">Views: <span className="text-indigo-650 text-base font-bold">{agency.proposalViewCount}</span></div>
                <div className="text-xs text-slate-400 mt-1">
                  Last: {agency.proposalViewedAt ? new Date(agency.proposalViewedAt).toLocaleString() : "Never"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Public Proposal URL</Label>
              <div className="flex gap-2">
                <Input value={publicProposalUrl} readOnly className="bg-slate-50 border-slate-200 font-mono text-xs text-indigo-700 focus:bg-white" />
                <Button asChild variant="outline" className="border-slate-200 text-slate-700 bg-white">
                  <a href={publicProposalUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="proposalHeadline">Personalized Headline</Label>
                <Input 
                  id="proposalHeadline" 
                  value={proposalHeadline} 
                  onChange={(e) => setProposalHeadline(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" 
                  placeholder="e.g. Reliable White-label Development Partner for Pixel Agency"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposalIntro">Personalized Intro Text</Label>
                <Textarea 
                  id="proposalIntro" 
                  rows={4}
                  value={proposalIntro} 
                  onChange={(e) => setProposalIntro(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" 
                  placeholder="Summarize how your WordPress/development service helps them grow capacity."
                />
              </div>
            </div>

            <Button onClick={handleProposalSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
              Save Proposal Headline & Intro
            </Button>
          </div>
        )}

        {/* OUTREACH EMAILS TAB */}
        {activeTab === "emails" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Email Campaign History</h2>
                <p className="text-xs text-slate-500 mt-1">Review templates, send custom messages, or inspect outbox logs.</p>
              </div>
              <Button onClick={() => setIsComposing(c => !c)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-1.5" /> Compose Custom Email
              </Button>
            </div>

            {/* Email Change Option */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Outreach Target Email Address</h3>
              <div className="flex gap-2 max-w-md">
                <Input
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  placeholder="e.g. outreach@agency.com"
                />
                <Button 
                  onClick={handleUpdateTargetEmail} 
                  disabled={isPending}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                >
                  Update Email
                </Button>
              </div>
            </div>

            {isComposing && (
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base">New Custom Outreach Email (Draft)</h3>
                
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg flex items-start gap-2.5 text-xs text-slate-650">
                  <FileText className="w-4 h-4 text-indigo-650 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">Proposal URL:</span>{" "}
                    <a href={`https://www.coreweblabs.com/agency/proposal/${agency.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono">
                      https://www.coreweblabs.com/agency/proposal/${agency.slug}
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Subject Line</Label>
                  <Input 
                    id="emailSubject" 
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailBody">Email Content (HTML)</Label>
                  <Textarea 
                    id="emailBody" 
                    rows={8}
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="bg-slate-50 border-slate-200 font-mono text-sm text-slate-900 focus:bg-white"
                  />
                  <p className="text-slate-450 text-[11px]">Merge tags like <code className="text-indigo-650 font-bold">{"{{proposal_url}}"}</code> are supported.</p>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    id="includeProposal"
                    checked={includeProposal}
                    onChange={(e) => setIncludeProposal(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="includeProposal" className="cursor-pointer text-slate-700 font-semibold select-none">
                    Include proposal link CTA in this email
                  </Label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setIsComposing(false)} className="text-slate-500">Cancel</Button>
                  <Button onClick={handleCreateEmailDraft} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Draft
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {agency.emails.length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
                  No outreach emails created for this agency yet.
                </div>
              ) : (
                agency.emails.map((email) => (
                  <div key={email.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 hover:border-slate-350 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{email.subject}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          Created on {new Date(email.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          email.status === "Sent" ? "bg-green-50 text-green-700 border border-green-200" :
                          email.status === "Draft" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {email.status}
                        </span>

                        {email.status === "Draft" ? (
                          <Button size="sm" onClick={() => handleSendEmail(email.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 py-0 px-3">
                            <Send className="w-3.5 h-3.5 mr-1" /> Send Email
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleSendEmail(email.id)} className="bg-slate-655 hover:bg-slate-700 text-white h-7 py-0 px-3 font-semibold">
                            <Send className="w-3.5 h-3.5 mr-1" /> Send Again
                          </Button>
                        )}

                        <Button size="sm" variant="outline" onClick={() => handlePreviewClick(email.id)} className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 h-7 py-0 px-3 font-semibold">
                          <Eye className="w-3.5 h-3.5 mr-1 text-indigo-650" /> Preview
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteEmail(email.id)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-b border-slate-100 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-indigo-650 flex-shrink-0" />
                        <span className="font-semibold">Proposal URL:</span>
                        <a href={`https://www.coreweblabs.com/agency/proposal/${agency.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono">
                          https://www.coreweblabs.com/agency/proposal/${agency.slug}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`excludeProposal-${email.id}`}
                          checked={email.includeProposal}
                          onChange={() => handleToggleProposalOption(email.id, email.includeProposal)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`excludeProposal-${email.id}`} className="text-xs text-slate-650 font-medium cursor-pointer select-none">
                          Include Proposal Link
                        </label>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 max-h-48 overflow-y-auto font-mono whitespace-pre-wrap leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* FOLLOW UPS TAB */}
        {activeTab === "followups" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-800">Outreach Followups</h2>
                
                {agency.followups.length === 0 ? (
                  <p className="text-slate-400 text-sm py-6 text-center">No follow-up events scheduled.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {agency.followups.map((fu) => (
                      <div key={fu.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-start gap-3">
                          <button onClick={() => handleToggleFollowup(fu.id, fu.status)} className="mt-0.5">
                            {fu.status === "Completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-300 hover:border-indigo-500 bg-white" />
                            )}
                          </button>
                          <div>
                            <p className={`text-sm ${fu.status === "Completed" ? "line-through text-slate-400" : "text-slate-700 font-semibold"}`}>
                              {fu.notes || "No notes"}
                            </p>
                            <span className="text-xs text-slate-400 font-mono">
                              Due: {new Date(fu.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteFollowup(fu.id)} 
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Create Follow-up Panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-4">Add Follow-up Action</h3>
              <form onSubmit={handleCreateFollowup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fuDate">Due Date</Label>
                  <Input 
                    id="fuDate" 
                    type="date" 
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="bg-slate-50 border-slate-200 text-slate-800 font-mono text-sm focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuNotes">Remind Me To...</Label>
                  <Textarea 
                    id="fuNotes" 
                    value={followupNotes}
                    onChange={(e) => setFollowupNotes(e.target.value)}
                    placeholder="e.g. Call via WhatsApp or pitch Elementor service."
                    className="bg-slate-50 border-slate-200 text-slate-800 text-xs focus:bg-white"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  Schedule Follow-up
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === "timeline" && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-850">Outreach Timeline Activity</h2>
            
            <div className="relative border-l border-slate-200 ml-4 space-y-6 pb-4">
              {/* Created */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-50 border border-blue-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
                <div className="text-xs text-slate-400 font-mono">{new Date(agency.createdAt).toLocaleString()}</div>
                <div className="text-sm font-semibold text-slate-800 mt-0.5">Agency Outreach Initialized</div>
                <p className="text-xs text-slate-500 mt-1">CRM profile created and proposal slug assigned: <code className="text-indigo-600">/proposal/{agency.slug}</code></p>
              </div>

              {/* Emails logged */}
              {agency.emails.map((e) => (
                <div key={e.id} className="relative pl-6">
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center border bg-white ${
                    e.status === "Sent" ? "border-green-500" : "border-amber-500"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${e.status === "Sent" ? "bg-green-500" : "bg-amber-500"}`} />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{new Date(e.createdAt).toLocaleString()}</div>
                  <div className="text-sm font-semibold text-slate-700 mt-0.5">
                    {e.status === "Sent" ? "Outreach Email Sent" : "Outreach Email Draft Created"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Subject: <span className="text-slate-700 font-medium">{e.subject}</span></p>
                </div>
              ))}

              {/* Proposal Views */}
              {agency.proposalViewedAt && (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-indigo-50 border border-indigo-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{new Date(agency.proposalViewedAt).toLocaleString()}</div>
                  <div className="text-sm font-semibold text-slate-800 mt-0.5">Partnership Proposal Viewed</div>
                  <p className="text-xs text-slate-500 mt-1">Landing page clicked by agency representative. Total views: <span className="font-bold text-slate-850">{agency.proposalViewCount}</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <EmailPreviewModal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        subject={previewData.subject} 
        htmlContent={previewData.html} 
        textContent={previewData.text} 
      />
    </div>
  );
}
