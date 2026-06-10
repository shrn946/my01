"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractWebsiteInfo } from "@/lib/lead-actions";
import { Loader2 } from "lucide-react";

export default function ExtractorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    source: "",
    category: "",
    city: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.website) {
      toast({ title: "Error", description: "Website URL is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await extractWebsiteInfo(formData.website, formData);
      if (result.success) {
        toast({ title: "Success", description: "Website info extracted successfully!" });
        router.push(`/admin/audit?id=${result.leadId}`);
      } else {
        toast({ title: "Error", description: result.error || "Extraction failed", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Website Extractor</CardTitle>
          <CardDescription>Enter a business website to extract contact info and start a new lead workflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="website">Website URL *</Label>
              <Input id="website" name="website" type="url" placeholder="https://example.com" value={formData.website} onChange={handleChange} required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Plumber, Dentist" value={formData.category} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Lead Source</Label>
                <Input id="source" name="source" placeholder="e.g. Google Maps, Yelp" value={formData.source} onChange={handleChange} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extracting...</> : "Extract Website Info"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
