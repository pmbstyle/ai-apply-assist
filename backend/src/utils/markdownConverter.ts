export function convertMarkdownToText(markdown: string): string {
  // Remove headers
  let text = markdown.replace(/^#{1,6}\s+/gm, '')
  
  // Remove bold and italic formatting
  text = text.replace(/\*\*(.+?)\*\*/g, '$1')
  text = text.replace(/\*(.+?)\*/g, '$1')
  text = text.replace(/__(.+?)__/g, '$1')
  text = text.replace(/_(.+?)_/g, '$1')
  
  // Convert bullet points to plain text
  text = text.replace(/^\s*[-*+]\s+/gm, '')
  
  // Remove links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1')
  
  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '')
  
  // Clean up extra whitespace
  text = text.replace(/\n\s*\n/g, '\n')
  text = text.replace(/^\s+|\s+$/g, '')
  
  return text
}