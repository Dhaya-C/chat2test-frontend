"use client";

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadZone } from './FileUploadZone';
import { Upload, FileText, Send } from 'lucide-react';

interface InputPanelProps {
  onSubmit: (input: { text?: string; files?: File[] }) => void;
  isProcessing: boolean;
  disabled?: boolean;
  isFollowUp?: boolean;
}

export interface InputPanelRef {
  clearInputs: () => void;
}

export const InputPanel = forwardRef<InputPanelRef, InputPanelProps>(
  ({ onSubmit, isProcessing, disabled = false, isFollowUp = false }, ref) => {
    const [text, setText] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const clearInputs = useCallback(() => {
      setText('');
      setFiles([]);
    }, []);

    useImperativeHandle(ref, () => ({
      clearInputs,
    }), [clearInputs]);

    const handleSubmit = useCallback(() => {
      if (disabled || isProcessing || (!text.trim() && files.length === 0)) return;

      onSubmit({
        text: text.trim() || undefined,
        files: files.length > 0 ? files : undefined,
      });
    }, [text, files, onSubmit, disabled, isProcessing]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(prev => [...prev, ...selectedFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const canSubmit = !disabled && !isProcessing && (text.trim() || files.length > 0);

  return (
    <div className="h-full flex flex-col">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0 p-3 md:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            Input Requirements
          </CardTitle>
          <p className="text-xs md:text-sm text-muted-foreground">
            Upload your requirements documents and describe what you want to test
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 md:gap-4 p-3 md:p-4 lg:p-6 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 flex flex-col gap-3 md:gap-4 overflow-y-auto min-h-0">
            {/* File Upload Zone */}
            <div className="flex-shrink-0">
              <FileUploadZone
                onFilesSelected={handleFilesSelected}
                disabled={disabled || isProcessing}
              />
            </div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="flex-shrink-0">
                <h4 className="text-xs md:text-sm font-medium mb-1.5 md:mb-2">Uploaded Files:</h4>
                <div className="space-y-1.5 md:space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-1.5 md:p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                        <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm truncate">{file.name}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      {!disabled && !isProcessing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="h-5 w-5 md:h-6 md:w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input */}
            <div className="flex-1 flex flex-col min-h-0">
              <label className="text-xs md:text-sm font-medium mb-1.5 md:mb-2 flex-shrink-0">
                Testing Requirements
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe your testing requirements, user stories, or acceptance criteria..."
                className="flex-1 min-h-[100px] resize-none"
                disabled={disabled || isProcessing}
              />
              <div className="flex justify-between items-center mt-1 md:mt-2 flex-shrink-0">
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {text.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button - OUTSIDE scrollable area */}
          <div className="flex-shrink-0 pt-2 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 text-sm md:text-base"
              size="default"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 md:h-4 md:w-4 border-2 border-current border-t-transparent" />
                  <span className="hidden sm:inline">{isFollowUp ? 'Sending...' : 'Analyzing Requirements...'}</span>
                  <span className="sm:hidden">{isFollowUp ? 'Sending...' : 'Analyzing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {isFollowUp ? 'Send Message' : 'Start Testing'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

InputPanel.displayName = 'InputPanel';