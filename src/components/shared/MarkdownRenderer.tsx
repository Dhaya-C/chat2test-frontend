"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

/**
 * Shared MarkdownRenderer component with consistent styling
 * Used in ChatMessage and OutputPanel for markdown rendering
 * Handles code blocks, inline code, headings, lists, and paragraphs
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        // Wrap code blocks in a container
        pre({ children, ...props }) {
          return <div className="max-w-full overflow-hidden">{children}</div>;
        },
        // Handle code blocks and inline code
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const inline = !match;

          // Code block (multi-line with language)
          if (!inline && match) {
            const codeString = String(children).replace(/\n$/, '');
            return <CodeBlock language={match[1]}>{codeString}</CodeBlock>;
          }

          // Inline code
          return (
            <code
              className={className}
              style={{
                background: 'hsl(var(--muted))',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: '0.9em',
                color: 'hsl(var(--muted-foreground))',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Style paragraphs
        p({ children, ...props }) {
          return (
            <p className="my-2 sm:my-3 max-w-full break-words" {...props}>
              {children}
            </p>
          );
        },
        // Style lists
        ul({ children, ...props }) {
          return (
            <ul className="my-2 pl-4 sm:pl-6 max-w-full" {...props}>
              {children}
            </ul>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol className="my-2 pl-4 sm:pl-6 max-w-full" {...props}>
              {children}
            </ol>
          );
        },
        li({ children, ...props }) {
          return (
            <li className="my-1 break-words" {...props}>
              {children}
            </li>
          );
        },
        // Style headings
        h1({ children, ...props }) {
          return (
            <h1 className="text-xl sm:text-2xl font-semibold mt-3 sm:mt-4 mb-2 break-words" {...props}>
              {children}
            </h1>
          );
        },
        h2({ children, ...props }) {
          return (
            <h2 className="text-lg sm:text-xl font-semibold mt-3 mb-2 break-words" {...props}>
              {children}
            </h2>
          );
        },
        h3({ children, ...props }) {
          return (
            <h3 className="text-base sm:text-lg font-semibold mt-2 mb-1 break-words" {...props}>
              {children}
            </h3>
          );
        },
      }}
    >
      {content || ''}
    </ReactMarkdown>
  );
}
