"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadLeadReportMedia } from "@/app/dashboard/report-actions";

interface MediaUploaderProps {
  leadId: string;
  onUploadSuccess: (items: any[]) => void;
}

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  type: string;
  section: string;
  caption: string;
  notes: string;
  includeInEmail: boolean;
}

export function MediaUploader({ leadId, onUploadSuccess }: MediaUploaderProps) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFiles = (files: FileList | File[]) => {
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (newFiles.length === 0) return;

    const newPending = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      type: "general",
      section: "appendix",
      caption: "",
      notes: "",
      includeInEmail: false,
    }));
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        handleFiles(e.clipboardData.files);
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const removePending = (id: string) => {
    setPendingFiles(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  const updatePending = (id: string, field: keyof PendingFile, value: any) => {
    setPendingFiles(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const movePending = (index: number, direction: 1 | -1) => {
    setPendingFiles(prev => {
      const newArr = [...prev];
      if (index + direction < 0 || index + direction >= newArr.length) return prev;
      const temp = newArr[index];
      newArr[index] = newArr[index + direction];
      newArr[index + direction] = temp;
      return newArr;
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedItems: any[] = [];
      for (const item of pendingFiles) {
        const formData = new FormData();
        formData.set("leadId", leadId);
        formData.set("file", item.file);
        formData.set("type", item.type);
        formData.set("section", item.section);
        
        let finalCaption = item.caption.trim();
        if (!finalCaption) finalCaption = item.file.name;
        formData.set("caption", finalCaption);
        
        if (item.notes) formData.set("notes", item.notes);
        formData.set("includeInEmail", item.includeInEmail.toString());

        const response = await uploadLeadReportMedia(formData);
        if (!response.success || !response.item) {
          throw new Error(response.error || `Upload failed for ${item.file.name}`);
        }
        uploadedItems.push(response.item);
      }
      toast({ title: "Upload complete", description: `Successfully uploaded ${uploadedItems.length} image(s).` });
      onUploadSuccess(uploadedItems);
      setPendingFiles([]);
    } catch (error) {
      toast({ title: "Upload failed", description: error instanceof Error ? error.message : "Unable to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div 
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <ImageIcon className="mx-auto h-10 w-10 text-slate-300 mb-4" />
        <p className="text-sm font-semibold text-slate-700">Drag & drop images here, paste with Ctrl + V, or click to browse your computer.</p>
        <p className="text-xs text-slate-500 mt-2">Multiple images are supported.</p>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = ''; // Reset to allow picking same files again
          }}
        />
      </div>

      {/* Pending List */}
      {pendingFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold">Pending Uploads ({pendingFiles.length})</h4>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Upload All Now</>}
            </Button>
          </div>
          <div className="space-y-3">
            {pendingFiles.map((item, idx) => (
              <div key={item.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start shadow-sm relative group">
                <div className="flex flex-row md:flex-col gap-1 items-center justify-center shrink-0 w-full md:w-auto">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => movePending(idx, -1)} disabled={idx === 0}><GripVertical className="h-4 w-4" /></Button>
                  <p className="text-[10px] font-bold text-slate-400">{idx + 1}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => movePending(idx, 1)} disabled={idx === pendingFiles.length - 1}><GripVertical className="h-4 w-4" /></Button>
                </div>
                <img src={item.preview} alt="preview" className="w-full md:w-32 h-32 md:h-24 object-cover rounded-lg border shrink-0 bg-slate-100" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-2">
                    <Label className="text-xs">Image Type</Label>
                    <select 
                      value={item.type} 
                      onChange={(e) => updatePending(item.id, "type", e.target.value)}
                      className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                    >
                      <option value="website_issue">Website Issue Screenshot</option>
                      <option value="competitor">Competitor Screenshot</option>
                      <option value="branding">Branding Reference</option>
                      <option value="before_after">Before / After Example</option>
                      <option value="general">General Reference</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Place In Section</Label>
                    <select 
                      value={item.section} 
                      onChange={(e) => updatePending(item.id, "section", e.target.value)}
                      className="h-9 w-full rounded-md border bg-white px-3 text-sm"
                    >
                      <option value="findings">Selected Findings</option>
                      <option value="recommendations">Recommendations</option>
                      <option value="proposal">Proposal Section</option>
                      <option value="email">Email</option>
                      <option value="appendix">Uploaded Screenshots</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs">Caption / Title</Label>
                    <Input 
                      value={item.caption} 
                      onChange={(e) => updatePending(item.id, "caption", e.target.value)} 
                      placeholder={item.file.name}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs">Notes / Fixes Needed</Label>
                    <Textarea 
                      value={item.notes} 
                      onChange={(e) => updatePending(item.id, "notes", e.target.value)} 
                      placeholder="Explain the issue or requirement..."
                      className="min-h-[60px] text-sm"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-destructive hover:bg-destructive/10 absolute md:static top-2 right-2 md:top-auto md:right-auto" onClick={() => removePending(item.id)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
