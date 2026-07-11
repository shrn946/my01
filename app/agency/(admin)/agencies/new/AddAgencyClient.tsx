"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAddAgency } from "./actions";
import { autoCrawlAgencyWebsite } from "../actions";
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
import { Building2, Globe, User, Mail, MapPin, CheckSquare, Square, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_SERVICES = [
  "White-label WordPress Development",
  "Elementor Development",
  "WooCommerce",
  "Website Redesign",
  "Website Maintenance",
  "Performance Optimization",
  "Bug Fixing",
  "Custom Plugin Development",
  "Custom Theme Development",
  "Figma to WordPress",
  "PSD to WordPress",
  "Next.js Frontend",
  "Headless WordPress",
  "API Integrations",
  "Website Migration",
  "Long-term Development Support"
];

const AVAILABLE_TECH = [
  "WordPress",
  "Elementor",
  "Divi",
  "WooCommerce",
  "Next.js",
  "React",
  "Tailwind CSS",
  "PHP",
  "JavaScript",
  "HTML/CSS",
  "ACF Pro",
  "Bricks Builder",
  "Oxygen Builder"
];

const STATUSES = [
  "New",
  "Email Draft",
  "Email Sent",
  "Opened",
  "Replied",
  "Interested",
  "Proposal Viewed",
  "Client",
  "Closed"
];

export default function AddAgencyClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);

  const handleCrawlWebsite = async () => {
    if (!formData.website) {
      toast({
        title: "Input required",
        description: "Please enter a website URL first.",
        variant: "destructive"
      });
      return;
    }
    setScanning(true);
    try {
      const res = await autoCrawlAgencyWebsite(formData.website);
      if (res.success) {
        setFormData(prev => ({
          ...prev,
          name: res.name || prev.name,
          linkedin: res.linkedin || prev.linkedin,
          notes: res.phone ? `Phone: ${res.phone}\n${prev.notes || ""}` : prev.notes
        }));
        if (res.emails && res.emails.length > 0) {
          setExtractedEmails(res.emails);
          setFormData(prev => ({ ...prev, email: res.emails[0] }));
        }
        toast({
          title: "Scan Successful",
          description: `Extracted name, socials, and ${res.emails?.length || 0} emails.`
        });
      } else {
        toast({
          title: "Scan Failed",
          description: res.error || "Could not retrieve info.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Scan Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setScanning(false);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    contactName: "",
    email: "",
    linkedin: "",
    country: "",
    city: "",
    notes: "",
    status: "New"
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (val: string) => {
    setFormData((prev) => ({ ...prev, status: val }));
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.website) {
      toast({
        title: "Validation Error",
        description: "Agency name and Website URL are required.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await submitAddAgency({
        ...formData,
        services: selectedServices,
        techStack: selectedTech
      });

      if (result.success) {
        toast({
          title: "Agency Added Successfully",
          description: "Agency record, proposal, and outreach email draft have been generated."
        });
        router.push("/agency/agencies");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add agency.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Add Web Design Agency
        </h1>
        <p className="text-slate-500 mt-1">
          Add an agency to start personalized partnership outreach.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: General Info */}
        <div className="space-y-6 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Agency Info
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">Agency Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                placeholder="e.g. Pixel Design Agency"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL *</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. https://pixeldesign.com"
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={scanning}
                onClick={handleCrawlWebsite}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap bg-white"
              >
                {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Scan Website
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. john@agency.com"
                />
              </div>
              {extractedEmails.length > 1 && (
                <div className="mt-2 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Discovered Emails (Select Primary):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extractedEmails.map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, email }))}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                          formData.email === email
                            ? "bg-indigo-650/15 border-indigo-550 text-indigo-700 font-bold bg-indigo-50"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
                        }`}
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <div className="relative">
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <Input
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                placeholder="e.g. https://linkedin.com/in/johndoe"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. United States"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. New York"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Outreach Status</Label>
            <Select onValueChange={handleStatusChange} defaultValue={formData.status}>
              <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-800">
                <SelectValue placeholder="Select Outreach Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-800">
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Side: Services & Tech Stack */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2 mb-3">
                Services Offered
              </h2>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {AVAILABLE_SERVICES.map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all ${
                        isSelected 
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold" 
                          : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" /> : <Square className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />}
                      <span>{service}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2 mb-3">
                Technology Stack
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_TECH.map((tech) => {
                  const isSelected = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700" 
                          : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Observations</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white"
                placeholder="e.g. Found their website via Google Search. They use WordPress but lack custom solutions."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-11 shadow-md shadow-indigo-650/15"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving & Generating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Agency & Create Proposal
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
