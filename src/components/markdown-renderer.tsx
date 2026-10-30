import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by blank lines into blocks
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="prose-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '15px', color: '#d4d4d8', lineHeight: 1.8 }}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '16px 0 8px' }}>
              {renderInline(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }

        // Heading 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: '20px 0 8px', borderBottom: '1px solid #27272a', paddingBottom: '8px' }}>
              {renderInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }

        // Heading 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} style={{ fontSize: '17px', fontWeight: 600, color: '#f43f5e', margin: '14px 0 6px' }}>
              {renderInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed.replace(/^>\s*/gm, '');
          return (
            <blockquote
              key={idx}
              style={{
                borderLeft: '4px solid #ec4899',
                paddingLeft: '16px',
                margin: '12px 0',
                color: '#e4e4e7',
                fontStyle: 'italic',
                background: 'rgba(236, 72, 153, 0.05)',
                padding: '12px 16px',
                borderRadius: '0 8px 8px 0',
              }}
            >
              {renderInline(quoteText)}
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={idx} style={{ paddingLeft: '20px', margin: 0, display: 'grid', gap: '8px' }}>
              {items.map((item, itemIdx) => (
                <li key={itemIdx} style={{ color: '#d4d4d8' }}>
                  {renderInline(item.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Standard Paragraph
        return (
          <p key={idx} style={{ margin: 0 }}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Simple token matching for bold, inline code, and links
  // Split by markdown elements
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      parts.push(<strong key={keyCounter++} style={{ color: '#ffffff', fontWeight: 600 }}>{boldMatch[2]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Check for inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={keyCounter++}
          style={{
            background: '#27272a',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#f43f5e',
            fontSize: '13px',
            fontFamily: 'monospace',
          }}
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Check for link [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={keyCounter++}
          href={linkMatch[2]}
          style={{ color: '#ec4899', textDecoration: 'underline' }}
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text up to next special char
    const nextSpecial = remaining.search(/(\*\*|__|`|\[)/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just take the single char if it didn't match a full pattern
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

