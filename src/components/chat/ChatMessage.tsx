import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Message } from '@/types/chat';
import { MarkdownRenderer } from '@/components/shared';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        // User message bubble
        <div
          className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden border-2 border-border bg-muted"
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(attachment.url, '_blank')}
                    />
                  ) : (
                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] flex flex-col items-center justify-center bg-muted cursor-pointer hover:bg-muted/80 transition">
                      <FileText size={28} className="sm:w-8 sm:h-8 text-muted-foreground" />
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 sm:mt-2 px-1 sm:px-2 text-center truncate w-full">
                        {attachment.name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Message content */}
          {message.content && (
            <div className="px-3 py-2 sm:px-4 rounded-xl break-words whitespace-pre-wrap bg-primary text-primary-foreground text-sm sm:text-base shadow-sm">
              {message.content}
            </div>
          )}
        </div>
      ) : (
        // Bot message with markdown (ChatGPT style - no background for text)
        <div
          className="w-full max-w-full overflow-hidden text-foreground text-sm sm:text-base"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 400,
            lineHeight: '1.75',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          <MarkdownRenderer content={message.content || ''} />
        </div>
      )}
    </div>
  );
}
