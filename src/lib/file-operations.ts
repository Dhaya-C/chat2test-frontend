/**
 * File operations utility for copy, download, and export functionality
 * Centralizes all file-related operations to avoid duplication
 */

/**
 * Copy text to clipboard
 * @param text - Text content to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}

/**
 * Download file with specified content
 * @param content - File content
 * @param filename - Name of the file to download
 * @param mimeType - MIME type of the file (default: 'text/plain')
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file:', error);
    throw new Error('Failed to download file');
  }
}

/**
 * Export data as JSON file
 * @param data - Data to export
 * @param filename - Name of the file to download
 */
export function exportAsJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Export text content as file
 * @param content - Text content to export
 * @param filename - Name of the file to download
 */
export function exportAsText(content: string, filename: string): void {
  downloadFile(content, filename, 'text/plain');
}

/**
 * Export conversation/responses to text file
 * @param responses - Array of response objects with type and content
 * @param filename - Optional filename (default includes timestamp)
 */
export function exportConversation(
  responses: Array<{ type: string; content: string }>,
  filename?: string
): void {
  const conversationContent = responses
    .map((response) => {
      const typeLabel =
        response.type === 'test-cases'
          ? 'Test Cases Generated'
          : response.type === 'question'
            ? 'Question'
            : 'Analysis';
      return `--- ${typeLabel} ---\n${response.content}\n\n`;
    })
    .join('');

  const defaultFilename =
    filename ||
    `testing-conversation-${new Date().toISOString().split('T')[0]}.txt`;

  exportAsText(conversationContent, defaultFilename);
}
