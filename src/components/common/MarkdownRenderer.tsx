import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-sm leading-7 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-semibold mt-4 mb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold mt-3 mb-1.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="my-2 text-card-foreground" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="underline text-primary hover:opacity-90" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-2 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="marker:text-muted-foreground" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground my-3" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-3 overflow-auto rounded bg-muted p-3">
                <code className="font-mono text-[0.85em]" {...props}>{children}</code>
              </pre>
            );
          },
          img: ({ node, ...props }) => (
            <img loading="lazy" className="rounded border border-border max-w-full" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="w-full text-left border-collapse" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border-b border-border px-3 py-2 text-muted-foreground" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border-b border-border px-3 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
