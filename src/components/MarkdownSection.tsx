"use client";

import { useState, useRef } from "react";
import { marked } from "marked";

interface MarkdownSectionProps {
  content: string;
}

export default function MarkdownSection({ content }: MarkdownSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content);
  const divRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    if (textareaRef.current) {
      textareaRef.current.value = text;
    }
    // focus the div after state update
    setTimeout(() => {
      divRef.current?.focus();
    });
  };

  const handleBlur = () => {
    if (textareaRef.current) {
      const newText = textareaRef.current.value;
      setText(newText);
      textareaRef.current.value = newText;
    }
    setIsEditing(false);
  };

  const handleInput = () => {
    if (divRef.current && textareaRef.current) {
      textareaRef.current.value = divRef.current.innerText;
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        defaultValue={text}
        className="hidden"
      />
      <div
        ref={divRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        onInput={handleInput}
        className="border border-gray-300 rounded p-4 min-h-[200px] outline-none"
        dangerouslySetInnerHTML={!isEditing ? { __html: marked.parse(text) } : undefined}
      >
        {isEditing ? text : undefined}
      </div>
      {isEditing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex w-[80%] items-center">
          <input type="text" className="flex-grow bg-transparent border rounded p-2" />
          <button className="ml-2 bg-blue-600 text-white rounded px-4 py-2">Send</button>
        </div>
      )}
    </div>
  );
}
