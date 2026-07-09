"use client";

import { useState, useEffect } from "react";
import { Save, ArrowUp, ArrowDown, Eye, EyeOff, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  children?: MenuItem[];
}

import { getMenuAction, updateMenuAction } from "@/app/dashboard/actions";

export function AdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getMenuAction().then((data) => {
      setItems(data as MenuItem[]);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateMenuAction(items);
      if (res.success) {
        toast({ title: "Success", description: "Menu updated successfully." });
      } else {
        throw new Error(res.error);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message || "Failed to save menu." });
    }
    setSaving(false);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setItems(newItems);
    }
  };

  const toggleVisibility = (index: number) => {
    const newItems = [...items];
    newItems[index].visible = !newItems[index].visible;
    setItems(newItems);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Menu Settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-ink">Navigation Menu</h2>
        <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-white hover:bg-brand">
          <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <p className="text-slate-500">
        Reorder menu items by clicking the up and down arrows, and toggle visibility using the switch.
      </p>

      <div className="rounded-xl border border-black/5 bg-white shadow-soft">
        <div className="divide-y divide-black/5">
          {items.map((item, index) => (
            <div key={item.id} className={`flex items-center justify-between p-4 transition-colors ${!item.visible ? "bg-slate-50 opacity-60" : "hover:bg-slate-50"}`}>
              <div className="flex items-center gap-4">
                <GripVertical className="text-slate-300" size={20} />
                <div>
                  <div className="font-bold text-ink">{item.label}</div>
                  <div className="text-xs text-slate-400">{item.href}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500">{item.visible ? "Visible" : "Hidden"}</span>
                  <input 
                    type="checkbox"
                    checked={item.visible} 
                    onChange={() => toggleVisibility(index)}
                    className="h-5 w-5 rounded-lg border-slate-200 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-ink disabled:opacity-50"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button 
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-ink disabled:opacity-50"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
