"use client";

import MarkdownSection from "./MarkdownSection";
import splitSections from "@/lib/splitSections";

interface ArticleProps {
  content: string;
}


export default function Article({ content }: ArticleProps) {
  const sections = splitSections(content);
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, idx) => (
        <MarkdownSection key={idx} content={section} />
      ))}
    </div>
  );
}
