"use client";

import { useActionState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/auth-actions";
import { useSearchParams } from "next/navigation";

const initialState = { ok: false, message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  return (
    <form action={action} className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-premium lg:p-12">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-6">
        <label className="grid gap-3 text-sm font-bold text-ink">
          Email Address
          <input
            name="email"
            type="email"
            placeholder="admin@example.com"
            required
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
          />
        </label>

        <label className="grid gap-3 text-sm font-bold text-ink">
          Password
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
          />
        </label>
      </div>

      {state.message ? (
        <div className="mt-6 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-600">
          {state.message}
        </div>
      ) : null}

      <button
        disabled={pending}
        className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-4 text-base font-black text-white shadow-lg shadow-primary/25 transition-all hover:bg-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} />}
        {pending ? "Authenticating..." : "Sign In to Dashboard"}
      </button>
    </form>
  );
}
