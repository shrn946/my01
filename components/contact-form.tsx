"use client";

import { useActionState } from "react";
import { Send, Loader2 } from "lucide-react";
import { createContactMessage } from "@/lib/actions";

const initialState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(createContactMessage, initialState);

  return (
    <form action={action} className="rounded-[2.5rem] border border-black/5 bg-white p-6 sm:p-8 shadow-premium lg:p-12">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full Name" name="name" placeholder="John Doe" required />
        <Field label="Email Address" name="email" type="email" placeholder="john@example.com" required />
        <Field label="Phone Number" name="phone" placeholder="+1 (555) 000-0000" />
        
        <label className="grid gap-3 text-sm font-bold text-ink">
          Project Type
          <div className="relative">
            <select 
              name="projectType" 
              required 
              className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
            >
              <option value="">Select a service</option>
              <option>WordPress Website</option>
              <option>Elementor Design</option>
              <option>WooCommerce Store</option>
              <option>Custom Plugin</option>
              <option>Speed Optimization</option>
              <option>Maintenance</option>
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
        </label>

        <label className="grid gap-3 text-sm font-bold text-ink sm:col-span-2">
          Expected Budget
          <div className="relative">
            <select 
              name="budget" 
              required 
              className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5"
            >
              <option value="">Select budget range</option>
              <option>$500 - $1,000</option>
              <option>$1,000 - $3,000</option>
              <option>$3,000 - $5,000</option>
              <option>$5,000+</option>
            </select>
            <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
          </div>
        </label>

        <label className="grid gap-3 text-sm font-bold text-ink sm:col-span-2">
          Project Details
          <textarea 
            name="message" 
            required 
            rows={5} 
            placeholder="Tell me about your goals, timeline, and any specific requirements..."
            className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5" 
          />
        </label>
      </div>

      {state.message ? (
        <div className={`mt-8 rounded-2xl p-4 text-sm font-bold ${state.ok ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
          {state.message}
        </div>
      ) : null}

      <button 
        disabled={pending} 
        className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-base font-black text-white shadow-lg shadow-primary/25 transition-all hover:bg-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        {pending ? "Sending Message..." : "Send Message"}
      </button>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder, required = false }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <label className="grid gap-3 text-sm font-bold text-ink">
      {label}
      <input 
        name={name} 
        type={type} 
        placeholder={placeholder}
        required={required} 
        className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5" 
      />
    </label>
  );
}
