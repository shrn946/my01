"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Bold, Heading2, Italic, Link, List, ListOrdered, PlaySquare, Quote } from "lucide-react";
import { BlogContent } from "@/components/blog-content";

type Tool = {
  label: string;
  icon: ReactNode;
  before: string;
  after?: string;
  placeholder?: string;
};

const tools: Tool[] = [
  { label: "Heading", icon: <Heading2 size={16} />, before: "## ", placeholder: "Section heading" },
  { label: "Bold", icon: <Bold size={16} />, before: "**", after: "**", placeholder: "bold text" },
  { label: "Italic", icon: <Italic size={16} />, before: "_", after: "_", placeholder: "italic text" },
  { label: "Quote", icon: <Quote size={16} />, before: "> ", placeholder: "Client quote or key idea" },
  { label: "Bullet List", icon: <List size={16} />, before: "- ", placeholder: "List item" },
  { label: "Numbered List", icon: <ListOrdered size={16} />, before: "1. ", placeholder: "List item" },
  { label: "Link", icon: <Link size={16} />, before: "[", after: "](https://example.com)", placeholder: "link text" },
  { label: "YouTube", icon: <PlaySquare size={16} />, before: "\n[youtube:", after: "]\n", placeholder: "https://www.youtube.com/watch?v=VIDEO_ID" }
];

export function BlogEditor({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insert(tool: Tool) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || tool.placeholder || "";
    const nextText = `${tool.before}${selected}${tool.after ?? ""}`;
    const nextValue = `${value.slice(0, start)}${nextText}${value.slice(end)}`;
    setValue(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + tool.before.length;
      textarea.selectionEnd = start + tool.before.length + selected.length;
    });
  }

  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold text-ink">Content Editor</label>
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 p-2">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              onClick={() => insert(tool)}
              title={tool.label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 hover:text-brand"
            >
              {tool.icon}
            </button>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          name="content"
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          rows={14}
          className="min-h-80 w-full resize-y border-0 bg-white px-4 py-3 font-mono text-sm leading-7 text-slate-800 outline-none"
          placeholder={"## Heading\n\nWrite your post content here.\n\n[youtube:https://www.youtube.com/watch?v=VIDEO_ID]"}
        />
      </div>
      <details className="rounded-lg border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-bold text-ink">Preview</summary>
        <div className="mt-4">
          <BlogContent content={value} />
        </div>
      </details>
      <p className="text-xs leading-5 text-slate-500">
        Use the YouTube button or type [youtube:https://www.youtube.com/watch?v=VIDEO_ID]. Styling is controlled in components/blog-content.tsx and app/globals.css.
      </p>
    </div>
  );
}
