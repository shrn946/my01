import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { FadeIn } from "@/components/fade-in";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to the portfolio dashboard."
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 py-20 px-6">
      <div className="w-full max-w-xl">
        <FadeIn>
          <div className="mx-auto mb-10 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/10 text-primary mb-6">
              <Lock size={32} />
            </div>
            <span className="eyebrow block">Secure Access</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-ink sm:text-5xl">Welcome back</h1>
            <p className="mt-4 text-lg text-slate-500 font-medium">Access your professional control center.</p>
          </div>
          
          <Suspense fallback={<div className="text-center py-12 font-bold text-slate-400">Loading form...</div>}>
            <LoginForm />
          </Suspense>
          
          <p className="mt-10 text-center text-sm font-bold text-slate-400">
            Forgot your password? <span className="text-primary hover:underline cursor-pointer">Contact support</span>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
