"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  Check, 
  X, 
  Archive, 
  Edit3,
  Sparkles,
  Maximize2,
  Minimize2,
  Code
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
import { 
  createAgencyEmailTemplate, 
  updateAgencyEmailTemplate, 
  deleteAgencyEmailTemplate 
} from "@/lib/agency-actions";
import { getCompiledTemplatePreviewAction } from "../agencies/[id]/actions";
import EmailPreviewModal from "@/components/EmailPreviewModal";

type TemplateItem = {
  id: string;
  name: string;
  category: string | null;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function TemplatesClient({ initialTemplates }: { initialTemplates: TemplateItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);

  // Form Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile" | "code">("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState({ subject: "", html: "", text: "" });

  const handleTemplatePreviewClick = async (templateSubject: string, templateBody: string) => {
    try {
      const res = await getCompiledTemplatePreviewAction(templateSubject, templateBody);
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

  const [formData, setFormData] = useState({
    name: "",
    category: "Outreach",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    description: "",
    status: "Active"
  });

  const handleEditClick = (template: TemplateItem) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      category: template.category || "Outreach",
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText || "",
      description: template.description || "",
      status: template.status
    });
    setIsNew(false);
    setIsEditing(true);
  };

  const handleNewClick = () => {
    setFormData({
      name: "",
      category: "Outreach",
      subject: "",
      bodyHtml: "<p>Hi {{contact_name}},</p>\n<p>Write email body...</p>",
      bodyText: "",
      description: "",
      status: "Active"
    });
    setIsNew(true);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    startTransition(async () => {
      const res = await deleteAgencyEmailTemplate(id);
      if (res.success) {
        toast({ title: "Template Deleted" });
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleDuplicate = async (template: TemplateItem) => {
    startTransition(async () => {
      const res = await createAgencyEmailTemplate({
        name: `${template.name} (Copy)`,
        category: template.category || "Outreach",
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText || "",
        description: `Duplicate of ${template.name}`,
        status: template.status
      });

      if (res.success) {
        toast({ title: "Template Duplicated" });
        const fresh = [...templates, res.template as any];
        setTemplates(fresh);
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    });
  };

  const handleStatusToggle = async (template: TemplateItem) => {
    const nextStatus = template.status === "Active" ? "Inactive" : "Active";
    startTransition(async () => {
      const res = await updateAgencyEmailTemplate(template.id, { status: nextStatus });
      if (res.success) {
        toast({ title: `Template set to ${nextStatus}` });
        setTemplates((prev) => prev.map((t) => t.id === template.id ? { ...t, status: nextStatus } : t));
        router.refresh();
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (isNew) {
        const res = await createAgencyEmailTemplate(formData);
        if (res.success) {
          toast({ title: "Template Created Successfully" });
          setTemplates((prev) => [res.template as any, ...prev]);
          setIsEditing(false);
          router.refresh();
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      } else if (selectedTemplate) {
        const res = await updateAgencyEmailTemplate(selectedTemplate.id, formData);
        if (res.success) {
          toast({ title: "Template Updated" });
          setTemplates((prev) => prev.map((t) => t.id === selectedTemplate.id ? (res.template as any) : t));
          setIsEditing(false);
          router.refresh();
        } else {
          toast({ title: "Error", description: res.error, variant: "destructive" });
        }
      }
    });
  };

  const insertHtml = (tag: string) => {
    const textarea = document.getElementById("bodyHtml") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    let insertValue = "";
    if (tag === "bold") insertValue = `<strong>${text.substring(start, end) || "text"}</strong>`;
    else if (tag === "italic") insertValue = `<em>${text.substring(start, end) || "text"}</em>`;
    else if (tag === "underline") insertValue = `<u>${text.substring(start, end) || "text"}</u>`;
    else if (tag === "link") insertValue = `<a href="https://example.com">${text.substring(start, end) || "link text"}</a>`;
    else if (tag === "heading") insertValue = `<h2>${text.substring(start, end) || "Heading"}</h2>`;
    else if (tag === "list") insertValue = `<ul>\n  <li>${text.substring(start, end) || "item"}</li>\n</ul>`;
    else if (tag === "button") insertValue = `<a href="{{proposal_url}}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">View Proposal</a>`;

    setFormData((prev) => ({
      ...prev,
      bodyHtml: before + insertValue + after
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Email Template CMS
          </h1>
          <p className="text-slate-500 mt-1">
            Build and manage reusable partnership campaigns with rich formatting and merge variables.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleNewClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md">
            <Plus className="w-4 h-4 mr-1.5" /> Create Template
          </Button>
        )}
      </div>

      {/* Main CMS Split Layout */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse text-left text-sm text-slate-750">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-550 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Template Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedTemplate(template)} 
                          className="font-bold text-slate-800 hover:text-indigo-600 text-left"
                        >
                          {template.name}
                        </button>
                        <p className="text-xs text-slate-450 line-clamp-1 mt-0.5">{template.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 border border-slate-200 text-[10px] px-2 py-0.5 rounded text-slate-650 font-semibold">
                          {template.category || "Outreach"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleStatusToggle(template)}>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            template.status === "Active" ? "bg-green-50 text-green-700 border border-green-200" :
                            "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {template.status}
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(template)} className="text-slate-400 hover:text-indigo-650 h-8 w-8">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDuplicate(template)} className="text-slate-400 hover:text-indigo-650 h-8 w-8">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="text-slate-450 hover:text-red-600 h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Preview Panel */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base">{selectedTemplate.name}</h3>
                  <p className="text-xs text-indigo-600 mt-1 font-semibold">Subject: {selectedTemplate.subject}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 max-h-96 overflow-y-auto leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: selectedTemplate.bodyHtml }} />
                </div>
                <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <p>Category: {selectedTemplate.category || "Outreach"}</p>
                  <p className="mt-1">Description: {selectedTemplate.description || "No description provided."}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                Select a template from the list to preview its contents.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Mode Page */
        <form onSubmit={handleSubmit} className={`space-y-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto bg-white border-slate-300' : ''}`}>
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isNew ? "Create Outreach Template" : `Edit: ${selectedTemplate?.name}`}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Use merge tags to personalize copy automatically.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsFullscreen(f => !f)} className="border-slate-200 text-slate-600 bg-white">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-500">
                <X className="w-4 h-4 mr-1" /> Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor form inputs */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" 
                    placeholder="e.g. Initial Outreach Partner Offer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(val) => setFormData(p => ({ ...p, category: val }))} defaultValue={formData.category}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
                      <SelectValue placeholder="Outreach Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      <SelectItem value="Outreach">Outreach</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Reconnection">Reconnection</SelectItem>
                      <SelectItem value="Transactional">Transactional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input 
                  id="subject" 
                  value={formData.subject} 
                  onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white font-medium" 
                  placeholder="e.g. Partnership Inquiry: Web Dev Support for {{agency_name}}"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description / internal notes</Label>
                <Input 
                  id="description" 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" 
                  placeholder="e.g. Sent 3 days after first email if no response."
                />
              </div>

              {/* Toolbar & Textarea editor */}
              <div className="space-y-2">
                <Label htmlFor="bodyHtml">HTML Version Body</Label>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  {/* Editor Toolbar */}
                  <div className="bg-slate-50 border-b border-slate-200 px-2.5 py-1.5 flex flex-wrap gap-1.5 items-center">
                    <button type="button" onClick={() => insertHtml("bold")} className="px-2 py-1 rounded hover:bg-slate-200 text-xs font-extrabold text-slate-700">B</button>
                    <button type="button" onClick={() => insertHtml("italic")} className="px-2 py-1 rounded hover:bg-slate-200 text-xs italic text-slate-700 font-serif">I</button>
                    <button type="button" onClick={() => insertHtml("underline")} className="px-2 py-1 rounded hover:bg-slate-200 text-xs underline text-slate-700">U</button>
                    <button type="button" onClick={() => insertHtml("heading")} className="px-2.5 py-1 rounded hover:bg-slate-200 text-[10px] font-bold text-slate-700">H2</button>
                    <button type="button" onClick={() => insertHtml("list")} className="px-2 py-1 rounded hover:bg-slate-200 text-xs text-slate-700">List</button>
                    <button type="button" onClick={() => insertHtml("link")} className="px-2 py-1 rounded hover:bg-slate-200 text-xs text-slate-700 underline">Link</button>
                    <button type="button" onClick={() => insertHtml("button")} className="px-2.5 py-1 rounded hover:bg-indigo-700 bg-indigo-650 text-white text-[10px] font-semibold">Add Proposal Button</button>
                  </div>

                  <Textarea
                    id="bodyHtml"
                    rows={12}
                    value={formData.bodyHtml}
                    onChange={(e) => setFormData(p => ({ ...p, bodyHtml: e.target.value }))}
                    className="border-0 rounded-none bg-transparent focus:ring-0 text-slate-900 font-mono text-xs p-4 leading-relaxed focus-visible:ring-0"
                    placeholder="<p>Hi {{contact_name}},</p>..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
                  {isNew ? "Create Template" : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => handleTemplatePreviewClick(formData.subject, formData.bodyHtml)} className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold">
                  <Eye className="w-4 h-4 mr-1.5 text-indigo-650" /> Preview
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="border-slate-200 text-slate-600 bg-white font-semibold">
                  Cancel
                </Button>
              </div>
            </div>

            {/* Merge tags instructions & real-time preview */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Merge Tags Reference</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-indigo-700 max-h-36 overflow-y-auto">
                  <div>{"{{agency_name}}"}</div>
                  <div>{"{{contact_name}}"}</div>
                  <div>{"{{website}}"}</div>
                  <div>{"{{country}}"}</div>
                  <div>{"{{city}}"}</div>
                  <div>{"{{proposal_url}}"}</div>
                  <div>{"{{portfolio_url}}"}</div>
                  <div>{"{{company_name}}"}</div>
                  <div>{"{{sender_name}}"}</div>
                  <div>{"{{sender_email}}"}</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-3 shadow-sm">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  Real-time Preview
                  <span className="text-[10px] text-slate-400 font-normal">Desktop Size</span>
                </h4>
                <div className="bg-slate-50 text-slate-900 p-4 rounded-lg max-h-64 overflow-y-auto text-xs min-h-[150px] border border-slate-200">
                  <div dangerouslySetInnerHTML={{ __html: formData.bodyHtml }} />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
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
