"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Search, 
  Send, 
  ExternalLink, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { triggerSendEmail, triggerDeleteEmail, getCompiledEmailPreviewAction } from "../agencies/[id]/actions";
import EmailPreviewModal from "@/components/EmailPreviewModal";

type EmailItem = {
  id: string;
  subject: string;
  bodyHtml: string;
  status: string;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  agency: {
    id: string;
    name: string;
    email: string | null;
    slug: string;
  };
};

export default function EmailsClient({ initialEmails }: { initialEmails: EmailItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSend = async (emailId: string) => {
    toast({ title: "Sending email..." });
    const res = await triggerSendEmail(emailId);
    if (res.success) {
      toast({ title: res.simulated ? "Simulated Send Success" : "Email Sent Successfully" });
      router.refresh();
      setEmails(prev => prev.map(e => e.id === emailId ? { ...e, status: "Sent", sentAt: new Date() } : e));
    } else {
      toast({ title: "Failed to Send", description: res.error, variant: "destructive" });
    }
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm("Are you sure you want to delete this email log?")) return;
    const res = await triggerDeleteEmail(emailId);
    if (res.success) {
      toast({ title: "Email Deleted" });
      setEmails(prev => prev.filter(e => e.id !== emailId));
      router.refresh();
    }
  };

  const filtered = emails.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      e.subject.toLowerCase().includes(term) ||
      e.agency.name.toLowerCase().includes(term) ||
      (e.agency.email || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Outreach Campaign History
        </h1>
        <p className="text-slate-500 mt-1">
          Review, resend, and manage all outreach email logs and drafts.
        </p>
      </div>

      {/* Filter box */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm max-w-md">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase font-bold tracking-wider text-slate-500">Search Email History</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, agency name or email..."
              className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Emails list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-xl shadow-sm">
            No outreach email history found.
          </div>
        ) : (
          filtered.map((email) => (
            <div key={email.id} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-slate-350 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-base">{email.subject}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      email.status === "Sent" ? "bg-green-50 text-green-700 border border-green-200" :
                      email.status === "Draft" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {email.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-indigo-650">
                      <Building className="w-3.5 h-3.5" />
                      <Link href={`/agency/agencies/${email.agency.id}`} className="hover:underline">
                        {email.agency.name}
                      </Link>
                    </span>
                    <span>|</span>
                    <span>To: {email.agency.email || "No Email"}</span>
                    <span>|</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {email.sentAt ? `Sent: ${new Date(email.sentAt).toLocaleString()}` : `Created: ${new Date(email.createdAt).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {email.status === "Draft" && (
                    <Button size="sm" onClick={() => handleSend(email.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Send className="w-4 h-4 mr-1.5" /> Send Email
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handlePreviewClick(email.id)} className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                    <Eye className="w-4 h-4 mr-1.5 text-indigo-650" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" asChild className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                    <Link href={`/agency/proposal/${email.agency.slug}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-1.5 text-slate-500" /> Proposal
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(email.id)} className="text-slate-400 hover:text-red-600 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Email Content HTML Preview */}
              <div 
                className="bg-slate-50 p-5 rounded-lg border border-slate-200 text-sm text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />

              {email.status === "Failed" && email.errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sending Failed:</span> {email.errorMessage}
                  </div>
                </div>
              )}
            </div>
          ))
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
