import React from 'react';

/**
 * CustomHeadInjector
 * Parses and injects custom <meta>, <link>, and <script> tags safely into Next.js <head>
 * ensuring search engine crawlers (Google Search Console, Bing) receive server-rendered meta tags.
 */
export function CustomHeadInjector({ html }: { html?: string }) {
  if (!html || !html.trim()) return null;

  try {
    const getAllMatches = (regex: RegExp, str: string) => {
      const matches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      while ((m = regex.exec(str)) !== null) {
        matches.push(m);
      }
      return matches;
    };

    const metaMatches = getAllMatches(/<meta\s+([^>]+?)\s*\/?>/gi, html);
    const linkMatches = getAllMatches(/<link\s+([^>]+?)\s*\/?>/gi, html);
    const scriptMatches = getAllMatches(/<script(?:\s+([^>]*?))?>([\s\S]*?)<\/script>/gi, html);

    const parseAttrs = (attrStr: string = '') => {
      const attrs: Record<string, string | boolean> = {};
      const regex = /([a-zA-Z0-9_\-:]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let match;
      while ((match = regex.exec(attrStr)) !== null) {
        const key = match[1];
        // Don't map invalid React attributes
        if (key === 'class') {
          attrs['className'] = match[2] ?? match[3] ?? match[4] ?? '';
          continue;
        }
        const val = match[2] ?? match[3] ?? match[4] ?? true;
        attrs[key] = val;
      }
      return attrs;
    };

    const parsedMetas = metaMatches.map((m, idx) => {
      const attrs = parseAttrs(m[1]);
      return <meta key={`custom-meta-${idx}`} {...(attrs as any)} />;
    });

    const parsedLinks = linkMatches.map((m, idx) => {
      const attrs = parseAttrs(m[1]);
      return <link key={`custom-link-${idx}`} {...(attrs as any)} />;
    });

    const parsedScripts = scriptMatches.map((m, idx) => {
      const attrs = parseAttrs(m[1]);
      const inlineContent = m[2];
      if (inlineContent && inlineContent.trim()) {
        return (
          <script
            key={`custom-script-${idx}`}
            {...(attrs as any)}
            dangerouslySetInnerHTML={{ __html: inlineContent }}
          />
        );
      }
      return <script key={`custom-script-${idx}`} {...(attrs as any)} />;
    });

    return (
      <>
        {parsedMetas}
        {parsedLinks}
        {parsedScripts}
      </>
    );
  } catch (err) {
    console.error('Error injecting custom head HTML:', err);
    return null;
  }
}

