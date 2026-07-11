"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings as SettingsIcon, 
  Building2, 
  Mail, 
  Send, 
  Phone, 
  Globe, 
  FileText, 
  Palette, 
  Layout, 
  Save, 
  Loader2,
  Lock,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Code,
  ShoppingBag,
  Zap,
  Shield,
  Heart
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
import { updateAgencySettings } from "@/lib/agency-actions";

type TemplateItem = {
  id: string;
  name: string;
};

type SettingsItem = {
  id: string;
  companyName: string | null;
  companyLogo: string | null;
  senderName: string | null;
  senderEmail: string | null;
  teamEmail: string | null;
  whatsapp: string | null;
  website: string | null;
  portfolioUrl: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
  x: string | null;
  youtube: string | null;
  github: string | null;
  behance: string | null;
  dribbble: string | null;
  emailSignature: string | null;
  brandColors: any;
  defaultTemplateId: string | null;
  proposalTheme: string | null;
  seoDefaults: any;
  ogImage: string | null;
  favicon: string | null;
  analyticsIds: any;
};

export default function SettingsClient({ 
  initialSettings, 
  templates 
}: { 
  initialSettings: SettingsItem;
  templates: TemplateItem[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    companyName: initialSettings.companyName || "",
    companyLogo: initialSettings.companyLogo || "",
    senderName: initialSettings.senderName || "",
    senderEmail: initialSettings.senderEmail || "",
    teamEmail: initialSettings.teamEmail || "",
    whatsapp: initialSettings.whatsapp || "",
    website: initialSettings.website || "",
    portfolioUrl: initialSettings.portfolioUrl || "",
    linkedin: initialSettings.linkedin || "",
    facebook: initialSettings.facebook || "",
    instagram: initialSettings.instagram || "",
    x: initialSettings.x || "",
    youtube: initialSettings.youtube || "",
    github: initialSettings.github || "",
    behance: (initialSettings as any).behance || "",
    dribbble: (initialSettings as any).dribbble || "",
    emailSignature: initialSettings.emailSignature || "",
    defaultTemplateId: initialSettings.defaultTemplateId || "",
    proposalTheme: initialSettings.proposalTheme || "Modern",
    ogImage: initialSettings.ogImage || "",
    favicon: initialSettings.favicon || ""
  });

  const [services, setServices] = useState<any[]>(
    (initialSettings as any).howWeCanHelp 
      ? JSON.parse(JSON.stringify((initialSettings as any).howWeCanHelp)) 
      : []
  );

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      title: "New Custom Service",
      description: "Service offering description content.",
      icon: "Code",
      enabled: true
    };
    setServices(prev => [...prev, newService]);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const updateServiceField = (id: string, field: string, value: any) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveServiceUp = (index: number) => {
    if (index === 0) return;
    setServices(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const moveServiceDown = (index: number) => {
    setServices(prev => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateAgencySettings({
        ...formData,
        howWeCanHelp: services,
        defaultTemplateId: formData.defaultTemplateId || null
      });

      if (res.success) {
        toast({ title: "Settings Saved Successfully" });
        router.refresh();
      } else {
        toast({ title: "Error", description: res.error || "Failed to save settings.", variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Agency Outreach Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage company brand assets, templates, domains, signatures, and themes.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-5 h-5 text-blue-600" /> Brand Identity
          </h2>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input 
              id="companyName" 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLogo">Company Logo URL</Label>
            <Input 
              id="companyLogo" 
              name="companyLogo" 
              value={formData.companyLogo} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              placeholder="e.g. https://coreweblabs.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website Domain</Label>
            <Input 
              id="website" 
              name="website" 
              value={formData.website} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input 
              id="portfolioUrl" 
              name="portfolioUrl" 
              value={formData.portfolioUrl} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>
        </div>

        {/* Sender details */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Mail className="w-5 h-5 text-indigo-600" /> Sender Outbox Configuration
          </h2>

          <div className="space-y-2">
            <Label htmlFor="senderName">Sender Display Name</Label>
            <Input 
              id="senderName" 
              name="senderName" 
              value={formData.senderName} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderEmail">Sender Email Address</Label>
            <Input 
              id="senderEmail" 
              name="senderEmail" 
              type="email"
              value={formData.senderEmail} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamEmail">Team Support Email</Label>
            <Input 
              id="teamEmail" 
              name="teamEmail" 
              type="email"
              value={formData.teamEmail} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Contact (Number)</Label>
            <Input 
              id="whatsapp" 
              name="whatsapp" 
              value={formData.whatsapp} 
              onChange={handleInputChange}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              placeholder="e.g. +1234567890"
            />
          </div>
        </div>

        {/* Templates and Proposals */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layout className="w-5 h-5 text-indigo-600" /> Templates & Themes
          </h2>

          <div className="space-y-2">
            <Label htmlFor="proposalTheme">Default Proposal Theme</Label>
            <Select onValueChange={(val) => handleSelectChange("proposalTheme", val)} defaultValue={formData.proposalTheme}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectValue placeholder="Theme style" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-850">
                <SelectItem value="Modern">Modern (Dark tech)</SelectItem>
                <SelectItem value="Minimal">Minimal (Clean Light)</SelectItem>
                <SelectItem value="Corporate">Corporate (Tech slate)</SelectItem>
                <SelectItem value="Creative">Creative (Purple neon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultTemplateId">Default Outreach Template</Label>
            <Select onValueChange={(val) => handleSelectChange("defaultTemplateId", val)} defaultValue={formData.defaultTemplateId}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectValue placeholder="Initial outreach template" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-850">
                <SelectItem value="none_set">None Set</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Social channels */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Send className="w-5 h-5 text-blue-600" /> Social Links & Asset Settings
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input 
                id="linkedin" 
                name="linkedin" 
                value={formData.linkedin} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input 
                id="github" 
                name="github" 
                value={formData.github} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input 
                id="instagram" 
                name="instagram" 
                value={formData.instagram} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="x">X (Twitter)</Label>
              <Input 
                id="x" 
                name="x" 
                value={formData.x} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube Link</Label>
              <Input 
                id="youtube" 
                name="youtube" 
                value={formData.youtube} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                placeholder="e.g. youtube.com/channel/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="behance">Behance Link</Label>
              <Input 
                id="behance" 
                name="behance" 
                value={formData.behance} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                placeholder="e.g. behance.net/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dribbble">Dribbble Link</Label>
              <Input 
                id="dribbble" 
                name="dribbble" 
                value={formData.dribbble} 
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"
                placeholder="e.g. dribbble.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* How We Can Help (Proposal Services) */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-650" /> "How We Can Help" Management
          </h2>
          <Button type="button" size="sm" onClick={addService} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            <Plus className="w-4 h-4 mr-1.5" /> Add Service
          </Button>
        </div>

        <div className="space-y-4">
          {services.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-sm">No services added yet. Click 'Add Service' to get started.</p>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {services.map((service, index) => (
                <div key={service.id || index} className="pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-400">#{index + 1}</span>
                      <Select 
                        value={service.icon || "Code"} 
                        onValueChange={(val) => updateServiceField(service.id, "icon", val)}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800 w-36 h-8 text-xs font-semibold">
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-800">
                          <SelectItem value="Code">Code</SelectItem>
                          <SelectItem value="ShoppingBag">ShoppingBag</SelectItem>
                          <SelectItem value="Zap">Zap</SelectItem>
                          <SelectItem value="Shield">Shield</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="Globe">Globe</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <button 
                        type="button" 
                        onClick={() => toggleService(service.id)} 
                        className={`px-2 py-0.5 rounded border text-[10px] uppercase font-bold transition-colors ${
                          service.enabled 
                            ? "bg-green-50 border-green-200 text-green-700" 
                            : "bg-slate-100 border-slate-200 text-slate-400"
                        }`}
                      >
                        {service.enabled ? "Active" : "Disabled"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveServiceUp(index)} 
                        disabled={index === 0} 
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => moveServiceDown(index)} 
                        disabled={index === services.length - 1} 
                        className="h-7 w-7 text-slate-400 hover:text-slate-700"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteService(service.id)} 
                        className="h-7 w-7 text-slate-400 hover:text-red-650"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-slate-400">Service Title</Label>
                      <Input
                        value={service.title}
                        onChange={(e) => updateServiceField(service.id, "title", e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white h-9"
                        placeholder="e.g. Custom WordPress Dev"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-[10px] uppercase tracking-wider text-slate-400">Short Description</Label>
                      <Input
                        value={service.description}
                        onChange={(e) => updateServiceField(service.id, "description", e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-900 focus:bg-white h-9"
                        placeholder="Explain what the service offering includes..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Signature Editor */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText className="w-5 h-5 text-amber-600" /> Default Email Signature (HTML)
        </h2>
        <div className="space-y-2">
          <Textarea 
            id="emailSignature" 
            name="emailSignature" 
            rows={5}
            value={formData.emailSignature} 
            onChange={handleInputChange}
            className="bg-slate-50 border-slate-200 text-slate-900 font-mono text-xs p-4 leading-relaxed focus:bg-white"
            placeholder="e.g. <p>Best regards,<br><strong>John</strong></p>"
          />
        </div>
      </div>
    </form>
  );
}
