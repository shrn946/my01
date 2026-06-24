"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  getSettings, 
  updateSettings 
} from "../actions";
import { 
  getSearchSettings, 
  updateSearchSettings 
} from "../lead-finder/actions";
import { sendTestEmail } from "@/lib/email-actions";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  Clock,
  Mail, 
  Globe, 
  Building, 
  Key,
  ShieldCheck,
  Loader2,
  CheckCircle,
  Search,
  Settings2,
  MapPin
} from "lucide-react";

const API_KEY_MASK = "●●●●●●●●●●●●●●●●";

const settingsSchema = z.object({
  // Email settings
  senderName: z.string().min(2, "Name must be at least 2 characters"),
  senderEmail: z.string().email("Invalid email address"),
  resendApiKey: z.string().optional(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  demoWebsiteUrls: z.string().optional(),
  geminiModel: z.string().optional(),

  // Follow-up settings
  followUpEnabled: z.boolean(),
  followUpSubject: z.string().optional(),
  followUpBody: z.string().optional(),

  // Search API settings
  googleSearchEnabled: z.boolean(),
  googleApiKey: z.string().optional(),
  googleSearchCx: z.string().optional(),
  googleSearchLimit: z.number().int().min(1, "Limit must be at least 1"),

  serpApiSearchEnabled: z.boolean(),
  serpApiKey: z.string().optional(),
  serpApiSearchLimit: z.number().int().min(1, "Limit must be at least 1"),

  searchProviderMode: z.enum(["Google Only", "SerpAPI Only", "Auto"]),

  // Target Locations & Categories
  locationsUsa: z.string().optional(),
  locationsUk: z.string().optional(),
  locationsCanada: z.string().optional(),
  locationsGermany: z.string().optional(),
  locationsAustralia: z.string().optional(),
  locationsNewZealand: z.string().optional(),
  locationsPriority: z.string().optional(),
  categories: z.string().optional()
});

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTestLoading, setIsTestLoading] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      resendApiKey: "",
      companyName: "",
      portfolioUrl: "",
      demoWebsiteUrls: "",
      followUpEnabled: true,
      followUpSubject: "",
      followUpBody: "",
      googleSearchEnabled: true,
      googleApiKey: "",
      googleSearchCx: "",
      googleSearchLimit: 40,
      serpApiSearchEnabled: true,
      serpApiKey: "",
      serpApiSearchLimit: 40,
      searchProviderMode: "Auto",
      locationsUsa: "",
      locationsUk: "",
      locationsCanada: "",
      locationsGermany: "",
      locationsAustralia: "",
      locationsNewZealand: "",
      locationsPriority: "",
      categories: ""
    },
  });

  useEffect(() => {
    async function loadSettings() {
      const [emailData, searchData] = await Promise.all([
        getSettings(),
        getSearchSettings()
      ]);

      if (emailData) {
        form.reset({
          senderName: emailData.senderName || "",
          senderEmail: emailData.senderEmail || "",
          resendApiKey: emailData.resendApiKey || "",
          companyName: emailData.companyName || "",
          portfolioUrl: emailData.portfolioUrl || "",
          demoWebsiteUrls: emailData.demoWebsiteUrls || "",
          followUpEnabled: (emailData as any).followUpEnabled ?? true,
          followUpSubject: (emailData as any).followUpSubject || "Checking in regarding your website",
          followUpBody: (emailData as any).followUpBody || "Hi,\n\nI just wanted to follow up on the website audit I sent over recently. Have you had a chance to look at it?\n\nLet me know if you have any questions or if you'd like to schedule a quick call to go over the recommendations.\n\nBest regards,",
          geminiModel: (emailData as any).geminiModel || "",
          googleSearchEnabled: searchData?.googleSearchEnabled ?? true,
          googleApiKey: searchData?.googleApiKey || "",
          googleSearchCx: searchData?.googleSearchCx || "",
          googleSearchLimit: searchData?.googleSearchLimit ?? 40,
          serpApiSearchEnabled: searchData?.serpApiSearchEnabled ?? true,
          serpApiKey: searchData?.serpApiKey || "",
          serpApiSearchLimit: searchData?.serpApiSearchLimit ?? 40,
          searchProviderMode: (searchData?.searchProviderMode as any) || "Auto",
          locationsUsa: (searchData?.locationsUsa || []).join(", "),
          locationsUk: (searchData?.locationsUk || []).join(", "),
          locationsCanada: (searchData?.locationsCanada || []).join(", "),
          locationsGermany: (searchData?.locationsGermany || []).join(", "),
          locationsAustralia: (searchData?.locationsAustralia || []).join(", "),
          locationsNewZealand: (searchData?.locationsNewZealand || []).join(", "),
          locationsPriority: (searchData?.locationsPriority || []).join(", "),
          categories: (searchData?.categories || []).join(", ")
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    const emailSettings = {
      senderName: values.senderName,
      senderEmail: values.senderEmail,
      resendApiKey: values.resendApiKey,
      companyName: values.companyName,
      portfolioUrl: values.portfolioUrl,
      demoWebsiteUrls: values.demoWebsiteUrls,
      followUpEnabled: values.followUpEnabled,
      followUpSubject: values.followUpSubject,
      followUpBody: values.followUpBody,
      geminiModel: values.geminiModel
    };

    const searchSettings = {
      googleSearchEnabled: values.googleSearchEnabled,
      googleApiKey: values.googleApiKey || "",
      googleSearchCx: values.googleSearchCx || "",
      googleSearchLimit: values.googleSearchLimit,
      serpApiSearchEnabled: values.serpApiSearchEnabled,
      serpApiKey: values.serpApiKey || "",
      serpApiSearchLimit: values.serpApiSearchLimit,
      searchProviderMode: values.searchProviderMode,
      locationsUsa: (values.locationsUsa || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsUk: (values.locationsUk || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsCanada: (values.locationsCanada || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsGermany: (values.locationsGermany || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsAustralia: (values.locationsAustralia || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsNewZealand: (values.locationsNewZealand || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      locationsPriority: (values.locationsPriority || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean),
      categories: (values.categories || "").split(/[,\n]/).map(c => c.trim()).filter(Boolean)
    };

    const [emailRes, searchRes] = await Promise.all([
      updateSettings(emailSettings),
      updateSearchSettings(searchSettings)
    ]);

    if (emailRes.success && searchRes.success) {
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
    } else {
      toast({
        title: "Error Saving Settings",
        description: emailRes.error || searchRes.error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }

  const handleTestEmail = async () => {
    setIsTestLoading(true);
    try {
      const result = await sendTestEmail();
      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: "A test email using latest lead data has been sent to shrn496@gmail.com.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: result.error || "Failed to send test email.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your dashboard, outbox preference, and discovery API credentials.</p>
        </div>
      </div>

      {/* Test Email Card */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Email Integration Test
          </CardTitle>
          <CardDescription>
            Verify your Resend setup by sending a test proposal using data from your **latest lead entry**.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            A test email will be sent to <strong className="text-foreground">shrn496@gmail.com</strong>. 
            This email will feature a dynamic preview of the most recently captured lead.
          </div>
          <Button 
            variant="default" 
            onClick={handleTestEmail} 
            disabled={isTestLoading}
            className="whitespace-nowrap rounded-xl"
          >
            {isTestLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><CheckCircle className="mr-2 h-4 w-4" /> Send Test Email</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Email Settings */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                These details will be used when sending audit reports and proposals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="senderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" className="rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="resendApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resend API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="re_..." className="pl-10 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Get your API key from the Resend dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Follow-Up Settings */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Automatic Follow-Up Emails
              </CardTitle>
              <CardDescription>
                Configure the automatic follow-up emails sent 1.5 weeks after the initial proposal is sent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="followUpEnabled"
                render={({ field }) => (
                  <FormItem className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="text-md font-bold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" /> Enable Automatic Follow-Ups
                        </FormLabel>
                        <FormDescription className="text-xs mt-1">
                          If enabled, a single follow-up email will be sent automatically to leads that haven't replied.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Select 
                          value={field.value ? "true" : "false"} 
                          onValueChange={(val) => field.onChange(val === "true")}
                        >
                          <SelectTrigger className="w-32 bg-white rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Enabled</SelectItem>
                            <SelectItem value="false">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpSubject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-Up Subject Line</FormLabel>
                    <FormControl>
                      <Input placeholder="Checking in regarding your website" className="rounded-xl font-medium" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followUpBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-Up Message Body</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Hi there,\n\nJust checking in..." 
                        className="min-h-[150px] rounded-xl text-sm" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormDescription>
                      You can use {"{{businessName}}"} to inject the company name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure the Google Gemini model used for generating reports and proposals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="geminiModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemini Model Name</FormLabel>
                    <FormControl>
                      <Input placeholder="gemini-3.1-flash-lite" className="rounded-xl" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      Leave blank to use the default (<code>gemini-3.1-flash-lite</code>). You can also use <code>gemini-2.5-pro</code> for higher quality outputs (may be slower).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Search API Configurations */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search APIs & Provider Configuration
              </CardTitle>
              <CardDescription>
                Configure credentials, providers, and daily limit caps for the Lead Finder search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Provider Selection Mode */}
              <FormField
                control={form.control}
                name="searchProviderMode"
                render={({ field }) => (
                  <FormItem className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <FormLabel className="text-md font-bold flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-primary" /> Search Provider Mode
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="bg-white rounded-xl mt-2">
                          <SelectValue placeholder="Choose provider mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Google Only">Google Only</SelectItem>
                          <SelectItem value="SerpAPI Only">SerpAPI Only</SelectItem>
                          <SelectItem value="Auto">Auto (Fallback Enabled)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-xs mt-2">
                      <strong>Auto Mode:</strong> Queries Google Custom Search first. If the Google daily limit is reached or the request fails, it automatically falls back to SerpAPI. Duplicate search results are removed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Google API Group */}
              <div className="space-y-4 border rounded-2xl p-5 bg-card shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-extrabold text-sm text-foreground">Google Custom Search API</h4>
                  <FormField
                    control={form.control}
                    name="googleSearchEnabled"
                    render={({ field }) => (
                      <Select 
                        value={field.value ? "true" : "false"} 
                        onValueChange={(val) => field.onChange(val === "true")}
                      >
                        <SelectTrigger className="w-32 h-8 rounded-lg text-xs bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Enabled</SelectItem>
                          <SelectItem value="false">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="googleApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google API Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="password" placeholder="AIzaSy..." className="pl-10 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="googleSearchCx"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search Engine ID / CX</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. c3959bc2a40..." className="pl-10 rounded-xl" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="googleSearchLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Daily Search Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="rounded-xl w-32" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>Max query requests allowed per day for Google Custom Search.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SerpAPI API Group */}
              <div className="space-y-4 border rounded-2xl p-5 bg-card shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-extrabold text-sm text-foreground">SerpAPI (Google Search Engine Engine)</h4>
                  <FormField
                    control={form.control}
                    name="serpApiSearchEnabled"
                    render={({ field }) => (
                      <Select 
                        value={field.value ? "true" : "false"} 
                        onValueChange={(val) => field.onChange(val === "true")}
                      >
                        <SelectTrigger className="w-32 h-8 rounded-lg text-xs bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Enabled</SelectItem>
                          <SelectItem value="false">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="serpApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SerpAPI Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="Enter SerpAPI key" className="pl-10 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serpApiSearchLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SerpAPI Daily Search Limit</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          className="rounded-xl w-32" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>Max query requests allowed per day for SerpAPI.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          {/* Target Locations */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Target Locations
              </CardTitle>
              <CardDescription>
                Define target cities for search autocompletes and default filters, separated by commas or newlines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="locationsUsa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>USA Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Houston, Dallas..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationsUk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UK Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="London, Manchester..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationsCanada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canada Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Toronto, Calgary..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationsGermany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Germany Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Berlin, Hamburg..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationsAustralia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Australia Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Sydney, Melbourne..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationsNewZealand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Zealand Cities</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Auckland, Wellington..." className="min-h-[80px] rounded-xl resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="locationsPriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary font-bold">Top Priority Cities</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Houston, Dallas, London..." className="min-h-[80px] rounded-xl resize-y border-primary/30" {...field} />
                    </FormControl>
                    <FormDescription>These locations will be prioritized and listed first in suggestions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Cold Outreach Categories */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Cold Outreach Categories
              </CardTitle>
              <CardDescription>
                Define cold outreach niches/business types for keyword dropdown suggestion autocompletes, separated by commas or newlines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Editable Categories</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Dentists, Lawyers, Accountants..." className="min-h-[160px] rounded-xl resize-y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Company Settings */}
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Your brand details for reports and demo pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="LeadGenius Agency" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://myportfolio.com" className="pl-10 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="demoWebsiteUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Demo Website URLs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="https://demo1.com&#10;https://demo2.com" 
                        className="min-h-[100px] rounded-2xl resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter one URL per line. These can be used as examples in your proposals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="rounded-xl font-bold">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
