"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  getSettings, 
  updateSettings 
} from "../actions";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { 
  Save, 
  Mail, 
  Globe, 
  Building, 
  Key,
  ShieldCheck,
  ExternalLink,
  Loader2,
  CheckCircle
} from "lucide-react";

const settingsSchema = z.object({
  senderName: z.string().min(2, "Name must be at least 2 characters"),
  senderEmail: z.string().email("Invalid email address"),
  resendApiKey: z.string().optional(),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  portfolioUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  demoWebsiteUrls: z.string().optional(),
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
    },
  });

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings();
      if (data) {
        form.reset({
          senderName: data.senderName || "",
          senderEmail: data.senderEmail || "",
          resendApiKey: data.resendApiKey || "",
          companyName: data.companyName || "",
          portfolioUrl: data.portfolioUrl || "",
          demoWebsiteUrls: data.demoWebsiteUrls || "",
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, [form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    const res = await updateSettings(values);
    if (res.success) {
      toast({
        title: "Settings Saved",
        description: "Your configuration has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: res.error,
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
          <p className="text-muted-foreground">Configure your dashboard and email preferences.</p>
        </div>
      </div>

      {/* Test Email Card */}
      <Card className="border-primary/20 bg-primary/5">
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
            className="whitespace-nowrap"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
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
                        <Input placeholder="John Doe" {...field} />
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
                        <Input placeholder="john@example.com" {...field} />
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
                        <Input type="password" placeholder="re_..." className="pl-10" {...field} />
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

          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
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
                      <Input placeholder="LeadGenius Agency" {...field} />
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
                        <Input placeholder="https://myportfolio.com" className="pl-10" {...field} />
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
                        className="min-h-[100px]"
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
            <Button type="submit" size="lg">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
