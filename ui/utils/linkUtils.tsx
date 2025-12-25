/**
 * Utility functions để detect và convert URLs thành clickable links
 */

'use client';

import React from 'react';

/**
 * Regex pattern để detect URLs
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Detect URLs trong text và convert thành clickable links
 */
export function detectLinks(text: string): string {
  if (!text) return '';
  
  return text.replace(URL_REGEX, (url) => {
    // Đảm bảo URL có protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${url}</a>`;
  });
}

/**
 * Render text với links - trả về JSX elements
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return null;
  
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  const regex = new RegExp(URL_REGEX);
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add link
    const url = match[0];
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    parts.push(
      <a
        key={match.index}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline break-all"
      >
        {url}
      </a>
    );
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? <>{parts}</> : text;
}

