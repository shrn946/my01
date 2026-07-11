"use client";

import { useState } from "react";
import { 
  X, 
  Monitor, 
  Smartphone, 
  FileText, 
  Code, 
  Copy, 
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  htmlContent,
  textContent
}: EmailPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile" | "text" | "code">("desktop");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMode === "text" ? textContent : htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-250 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Email Outreach Campaign Preview</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5 max-w-lg truncate">Subject: {subject}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <Button
              variant={previewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("desktop")}
              className={`h-7 px-2.5 text-xs font-semibold ${previewMode === "desktop" ? "bg-white text-slate-800 hover:bg-white shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Monitor className="w-3.5 h-3.5 mr-1 text-slate-500" /> Desktop
            </Button>
            <Button
              variant={previewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("mobile")}
              className={`h-7 px-2.5 text-xs font-semibold ${previewMode === "mobile" ? "bg-white text-slate-800 hover:bg-white shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Smartphone className="w-3.5 h-3.5 mr-1 text-slate-500" /> Mobile
            </Button>
            <Button
              variant={previewMode === "text" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("text")}
              className={`h-7 px-2.5 text-xs font-semibold ${previewMode === "text" ? "bg-white text-slate-800 hover:bg-white shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" /> Plain Text
            </Button>
            <Button
              variant={previewMode === "code" ? "default" : "ghost"}
              size="sm"
              onClick={() => setPreviewMode("code")}
              className={`h-7 px-2.5 text-xs font-semibold ${previewMode === "code" ? "bg-white text-slate-800 hover:bg-white shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-200"}`}
            >
              <Code className="w-3.5 h-3.5 mr-1 text-slate-500" /> HTML Source
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 border-slate-200 text-slate-700 bg-white">
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Body
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-50 overflow-hidden flex items-center justify-center p-4">
          {previewMode === "desktop" && (
            <div className="w-full h-full bg-white rounded-lg border border-slate-250 shadow-sm overflow-hidden">
              <iframe
                title="Desktop Email Preview"
                srcDoc={htmlContent}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {previewMode === "mobile" && (
            <div className="w-[375px] h-full bg-white rounded-lg border-4 border-slate-800 shadow-md overflow-hidden relative">
              <iframe
                title="Mobile Email Preview"
                srcDoc={htmlContent}
                className="w-full h-full border-0"
              />
            </div>
          )}

          {previewMode === "text" && (
            <textarea
              readOnly
              value={textContent}
              className="w-full h-full bg-white font-mono text-xs p-6 rounded-lg border border-slate-250 focus:outline-none focus:ring-0 text-slate-800 resize-none"
            />
          )}

          {previewMode === "code" && (
            <textarea
              readOnly
              value={htmlContent}
              className="w-full h-full bg-slate-900 font-mono text-xs p-6 rounded-lg border border-slate-850 focus:outline-none focus:ring-0 text-indigo-200 resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
