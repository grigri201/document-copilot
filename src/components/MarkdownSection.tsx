"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

interface MarkdownSectionProps {
  content: string;
}

export default function MarkdownSection({ content }: MarkdownSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
    }
  }, [isEditing]);

  const baseClasses = "rounded-lg p-4 min-h-[200px] outline-none w-full";
  const editingClasses = `border border-gray-200 ${baseClasses}`;

  return (
    <div className="relative">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className={editingClasses}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className={`markdown ${baseClasses}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(text)) }}
        />
      )}
      {isEditing && (
        <div className="absolute bottom-2 left-0 right-0 px-4">
          <div className="relative w-full">
            <input
              type="text"
              className="w-full bg-transparent border border-gray-200 rounded-lg p-2 pr-20"
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-lg px-4 py-1.5"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
