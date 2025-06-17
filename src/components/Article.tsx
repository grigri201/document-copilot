"use client";

interface ArticleProps {
  content: string;
}

export default function Article({ content }: ArticleProps) {
  return (
    <div className="flex flex-col">
      <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto">
        {content}
      </div>
    </div>
  );
}
