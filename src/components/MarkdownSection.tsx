"use client";

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

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

  const commonClasses =
    "border border-gray-300 rounded-lg p-4 min-h-[200px] outline-none w-full";

  return (
    <div className="relative">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          className={commonClasses}
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className={`markdown ${commonClasses}`}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(text)) }}
        />
      )}
      {isEditing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex w-[80%] items-center">
          <input type="text" className="flex-grow bg-transparent border rounded-lg p-2" />
          <button className="ml-2 bg-blue-600 text-white rounded-lg px-4 py-2">Send</button>
        </div>
      )}
    </div>
  );
}
