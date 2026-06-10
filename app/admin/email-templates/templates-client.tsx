"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { saveTemplate, deleteTemplate } from "@/lib/template-actions";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EmailTemplatesClient({ initialTemplates }: { initialTemplates: any[] }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", subject: "", body: "" });

  const resetForm = () => setFormData({ id: "", name: "", subject: "", body: "" });

  const handleEdit = (t: any) => {
    setFormData({ id: t.id, name: t.name, subject: t.subject, body: t.body });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    setLoading(true);
    const res = await deleteTemplate(id);
    if (res.success) {
      toast({ title: "Deleted", description: "Template deleted successfully" });
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveTemplate(formData);
    if (res.success) {
      toast({ title: "Saved", description: "Template saved successfully" });
      setIsOpen(false);
      resetForm();
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  const prefillDefault = () => {
    setFormData({
      id: "",
      name: "Default Audit Proposal",
      subject: "Quick website audit for {{businessName}}",
      body: `Hi {{businessName}} Team,

I reviewed your website and noticed a few opportunities that may help improve your online presence and get more customer inquiries.

Website: {{website}}

Current audit score:
Overall Score: {{websiteScore}}/100
Performance: {{performanceScore}}/100
SEO: {{seoScore}}/100
Accessibility: {{accessibilityScore}}/100
Best Practices: {{bestPracticesScore}}/100

Top issues found:
{{topIssues}}

I also created a modern website demo you can review here:
{{demoLink}}

Would you like me to send a few improvement ideas?

Regards,
{{myName}}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Dialog open={isOpen} onOpenChange={open => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Template</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Edit Template" : "New Template"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              {!formData.id && (
                <div className="flex justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={prefillDefault}>Load Default Proposal</Button>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input id="subject" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Email Body</Label>
                <Textarea id="body" className="min-h-[250px]" value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} required />
                <p className="text-xs text-muted-foreground">Variables: {"{{businessName}}, {{website}}, {{websiteScore}}, {{performanceScore}}, {{seoScore}}, {{topIssues}}, {{demoLink}}, {{myName}}"}</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Template"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {initialTemplates.length === 0 ? (
          <p className="text-muted-foreground">No templates found. Create one to get started.</p>
        ) : (
          initialTemplates.map(t => (
            <Card key={t.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{t.name}</CardTitle>
                    <CardDescription className="mt-1 font-medium">{t.subject}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}><Edit className="w-4 h-4 text-blue-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-hidden text-ellipsis whitespace-pre-wrap line-clamp-6">
                  {t.body}
                </pre>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
