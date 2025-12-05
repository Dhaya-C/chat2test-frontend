"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { copyToClipboard, downloadFile } from '@/lib/file-operations';

interface CodeBlockProps {
  language: string;
  children: string;
}

/**
 * Shared CodeBlock component with copy and download functionality
 * Used in ChatMessage and OutputPanel for consistent code rendering
 */
export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(children, `code.${language || 'txt'}`, 'text/plain');
  };

  return (
    <div style={{ position: 'relative', margin: '0.75rem 0' }} className="sm:my-4">
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 sm:gap-1.5 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs bg-card hover:bg-card/80 border border-border"
        >
          {copied ? <Check size={12} className="sm:w-3.5 sm:h-3.5" /> : <Copy size={12} className="sm:w-3.5 sm:h-3.5" />}
          <span className="hidden sm:inline ml-1">{copied ? 'Copied!' : 'Copy'}</span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          className="h-7 px-2 text-xs bg-card hover:bg-card/80 border border-border"
        >
          <Download size={12} className="sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline ml-1">Download</span>
        </Button>
      </div>

      {/* Code Syntax Highlighter */}
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        customStyle={{
          borderRadius: 8,
          fontSize: '0.8rem',
          padding: '1rem',
          paddingTop: '2.5rem',
          overflowX: 'auto',
        }}
        className="sm:text-sm md:text-base sm:p-8 sm:pt-12"
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
