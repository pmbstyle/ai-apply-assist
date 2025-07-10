export function markdownToText(markdown: string): string {
  // Convert Markdown directly to text without HTML intermediary for better accuracy
  let text = markdown
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic formatting
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Convert bullet points to plain text
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Clean up extra whitespace but preserve line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Convert multiple empty lines to double
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    
  return text
}