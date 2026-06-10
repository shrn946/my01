"use client";

import { useState } from "react";
import { sendTestEmail } from "@/lib/email-actions";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export function TestEmailButton() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setLoading(true);
    try {
      const result = await sendTestEmail();
      if (result.success) {
        toast({
          title: "Test Email Sent!",
          description: "A test email has been sent to shrn496@gmail.com. Please check your inbox.",
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
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-black/5 bg-white p-8 shadow-premium lg:p-10">
      <div className="flex items-start gap-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary">
          <Mail size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-black text-ink">Test Email Configuration</h3>
          <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
            Send a test email to <strong className="text-ink">shrn496@gmail.com</strong> to verify your Resend API integration and sender settings are working correctly.
          </p>
          <button 
            onClick={handleTest}
            disabled={loading}
            className="mt-8 flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white transition-all hover:bg-black disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Send Test Email Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
