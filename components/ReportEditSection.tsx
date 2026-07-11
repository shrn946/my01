"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateAgency } from "@/lib/agency-actions";

interface ReportEditSectionProps {
  agencyId: string;
  type: "services" | "techStack";
  initialItems: string[];
}

export default function ReportEditSection({
  agencyId,
  type,
  initialItems
}: ReportEditSectionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [items, setItems] = useState<string[]>(initialItems);
  const [newItem, setNewItem] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleStartEditing = () => {
    setItems(initialItems);
    setNewItem("");
    setIsEditing(true);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      toast({
        title: "Duplicate Item",
        description: "This item is already in the list.",
        variant: "destructive"
      });
      return;
    }
    setItems([...items, newItem.trim()]);
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    startTransition(async () => {
      const data = type === "services" ? { services: items } : { techStack: items };
      const res = await updateAgency(agencyId, data);
      if (res.success) {
        toast({
          title: "Successfully Saved",
          description: `${type === "services" ? "Services Offered" : "Technology Stack"} updated successfully.`
        });
        setIsEditing(false);
        router.refresh();
      } else {
        toast({
          title: "Error Saving",
          description: res.error || "Failed to update details.",
          variant: "destructive"
        });
      }
    });
  };

  if (!isEditing) {
    return (
      <Button
        onClick={handleStartEditing}
        variant="outline"
        size="sm"
        className="border-slate-200 hover:bg-slate-50 text-slate-700 bg-white h-7 px-2 text-xs font-semibold inline-flex items-center gap-1 ml-2"
      >
        <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit
      </Button>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-4 text-left max-w-xl mx-auto w-full">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h4 className="text-xs font-bold text-slate-800">
          Edit {type === "services" ? "Services" : "Tech Stack"}
        </h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-xs font-bold"
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Check className="w-3 h-3 mr-1" />
            )}
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            disabled={isPending}
            className="text-slate-500 hover:text-slate-750 h-7 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" /> Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No items added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
            {items.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded-md font-medium"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          placeholder={`Add new ${type === "services" ? "service" : "tech"}`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          disabled={isPending}
          className="bg-white border-slate-200 text-slate-800 h-8 text-xs focus:bg-white flex-1"
        />
        <Button
          type="submit"
          disabled={isPending || !newItem.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add
        </Button>
      </form>
    </div>
  );
}
