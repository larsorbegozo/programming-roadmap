import { useRef, type KeyboardEvent } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  label: string;
}

const INDENT = '  ';

/** A plain textarea editor with line numbers, Tab indentation and auto-indent. */
export function CodeEditor({ value, onChange, onRun, label }: CodeEditorProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);
  const lineCount = value.split('\n').length;

  const replaceSelection = (el: HTMLTextAreaElement, text: string, cursorOffset = text.length) => {
    const { selectionStart, selectionEnd } = el;
    const next = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + cursorOffset;
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && el.selectionStart === el.selectionEnd) {
      e.preventDefault();
      replaceSelection(el, INDENT);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && el.selectionStart === el.selectionEnd) {
      const before = value.slice(0, el.selectionStart);
      const currentLine = before.slice(before.lastIndexOf('\n') + 1);
      const indent = currentLine.match(/^\s*/)?.[0] ?? '';
      const extra = /[{[(]\s*$/.test(currentLine) ? INDENT : '';
      e.preventDefault();
      replaceSelection(el, '\n' + indent + extra);
    }
  };

  return (
    <div className="flex max-h-[520px] min-h-[220px] overflow-hidden rounded-lg border border-line-strong bg-bg focus-within:border-accent/60">
      <div
        ref={gutter}
        aria-hidden
        className="shrink-0 select-none overflow-hidden border-r border-line bg-surface py-3 pl-3 pr-2 text-right font-mono text-[12.5px] leading-[1.6] text-subtle"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        aria-label={label}
        wrap="off"
        className="min-w-0 flex-1 resize-none overflow-auto bg-transparent px-3 py-3 font-mono text-[12.5px] leading-[1.6] text-fg outline-none [tab-size:2]"
        style={{ minHeight: Math.min(520, Math.max(220, lineCount * 20 + 24)) }}
      />
    </div>
  );
}
