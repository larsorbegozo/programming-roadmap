import type { ReactNode } from 'react';
import { cx } from './ui';

/** Renders `inline code` inside a line of text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
      return (
        <code key={`${keyPrefix}-${i}`} className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[0.9em] text-fg">
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    return part;
  });
}

/**
 * Lightweight markdown used by checkpoint content: paragraphs, ``` code fences,
 * "- " and "1. " list lines, `inline code` and **bold**.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i] as string;
    if (line.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] as string).startsWith('```')) code.push(lines[i++] as string);
      i++;
      blocks.push(
        <pre key={key++} className="overflow-x-auto rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-fg">
          {code.join('\n')}
        </pre>,
      );
      continue;
    }
    if (/^(-|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line);
      const items: Array<{ text: string; children: string[] }> = [];
      while (i < lines.length && /^\s*(-|\d+\.)\s/.test(lines[i] as string)) {
        const current = lines[i] as string;
        const nested = /^\s{2,}/.test(current);
        const text = current.replace(/^\s*(-|\d+\.)\s/, '');
        const last = items[items.length - 1];
        if (nested && last) last.children.push(text);
        else items.push({ text, children: [] });
        i++;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List key={key++} className={cx('flex flex-col gap-1 pl-5', ordered ? 'list-decimal' : 'list-disc', 'marker:text-subtle')}>
          {items.map((item, j) => (
            <li key={j}>
              {inline(item.text, `${key}-${j}`)}
              {item.children.length > 0 && (
                <ul className="mt-1 flex list-[circle] flex-col gap-1 pl-5 marker:text-subtle">
                  {item.children.map((child, k) => (
                    <li key={k}>{inline(child, `${key}-${j}-${k}`)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </List>,
      );
      continue;
    }
    if (line.trim() === '') {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && (lines[i] as string).trim() !== '' && !(lines[i] as string).startsWith('```') && !/^(-|\d+\.)\s/.test(lines[i] as string)) {
      para.push(lines[i++] as string);
    }
    blocks.push(<p key={key++}>{inline(para.join(' '), String(key))}</p>);
  }
  return <div className={cx('flex flex-col gap-3', className)}>{blocks}</div>;
}

/** Single-line variant (inline code and bold only), safe inside buttons. */
export function InlineText({ text }: { text: string }) {
  return <span>{inline(text, 'inline')}</span>;
}
