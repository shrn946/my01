"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "clean"],
      ],
    }),
    []
  );

  return (
    <div className="bg-white [&_.ql-container]:min-h-[200px] [&_.ql-container]:text-base [&_.ql-editor]:min-h-[200px] [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-toolbar]:border-indigo-100 [&_.ql-container]:border-indigo-100">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}
