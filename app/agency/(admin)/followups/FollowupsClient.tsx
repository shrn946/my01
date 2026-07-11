"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CalendarClock, 
  Trash2, 
  CheckCircle2, 
  Building, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Check,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleFollowupStatus, deleteAgencyDetailFollowup } from "../agencies/[id]/actions";

type FollowupItem = {
  id: string;
  dueDate: Date;
  status: string;
  notes: string | null;
  agency: {
    id: string;
    name: string;
    website: string;
    status: string;
  };
};

export default function FollowupsClient({ initialFollowups }: { initialFollowups: FollowupItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [followups, setFollowups] = useState<FollowupItem[]>(initialFollowups);

  const handleToggle = async (fuId: string, agencyId: string, currentStatus: string) => {
    const res = await toggleFollowupStatus(agencyId, fuId, currentStatus);
    if (res.success) {
      toast({ title: "Follow-up status updated" });
      const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
      setFollowups(prev => prev.map(f => f.id === fuId ? { ...f, status: nextStatus } : f));
      router.refresh();
    }
  };

  const handleDelete = async (fuId: string, agencyId: string) => {
    if (!confirm("Are you sure you want to remove this follow-up?")) return;
    const res = await deleteAgencyDetailFollowup(agencyId, fuId);
    if (res.success) {
      toast({ title: "Follow-up deleted" });
      setFollowups(prev => prev.filter(f => f.id !== fuId));
      router.refresh();
    }
  };

  const pending = followups.filter((f) => f.status === "Pending");
  const completed = followups.filter((f) => f.status === "Completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Partnership Follow-ups
        </h1>
        <p className="text-slate-500 mt-1">
          Review, complete, and track upcoming follow-up tasks to nurture agency relationships.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Follow-ups */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Follow-ups ({pending.length})
          </h2>

          {pending.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              All follow-up tasks are completed! Nice work.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map((fu) => {
                const isOverdue = new Date(fu.dueDate) < new Date();
                return (
                  <div key={fu.id} className="py-4 flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleToggle(fu.id, fu.agency.id, fu.status)} 
                        className="mt-0.5 w-5 h-5 rounded-full border border-slate-300 hover:border-indigo-500 flex items-center justify-center flex-shrink-0 bg-white"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/agency/agencies/${fu.agency.id}`} className="font-bold text-slate-800 hover:text-indigo-600 text-sm">
                            {fu.agency.name}
                          </Link>
                          {isOverdue && (
                            <span className="flex items-center gap-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                              <AlertCircle className="w-2.5 h-2.5" /> Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-slate-650 text-xs mt-1">{fu.notes || "Follow up regarding partnership offer."}</p>
                        <span className={`text-[10px] font-mono mt-1 block ${isOverdue ? 'text-red-650 font-semibold' : 'text-slate-450'}`}>
                          Due: {new Date(fu.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(fu.id, fu.agency.id)} className="text-slate-400 hover:text-red-600 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Follow-ups */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Completed Tasks ({completed.length})
          </h2>

          {completed.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No completed tasks to show yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completed.map((fu) => (
                <div key={fu.id} className="py-4 flex justify-between items-start gap-4 opacity-75">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => handleToggle(fu.id, fu.agency.id, fu.status)} 
                      className="mt-0.5 w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="w-3 h-3 text-green-600" />
                    </button>
                    <div>
                      <Link href={`/agency/agencies/${fu.agency.id}`} className="font-bold text-slate-700 hover:text-indigo-600 text-sm">
                        {fu.agency.name}
                      </Link>
                      <p className="text-slate-500 text-xs mt-1 line-through">{fu.notes || "Follow up task completed."}</p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        Due: {new Date(fu.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(fu.id, fu.agency.id)} className="text-slate-400 hover:text-red-600 h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
