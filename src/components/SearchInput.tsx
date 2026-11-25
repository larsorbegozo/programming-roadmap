import { Search, X } from 'lucide-react';
import { inputClass } from './ui';

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputClass} pl-9 pr-8 [&::-webkit-search-cancel-button]:hidden`}
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-subtle hover:text-fg">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
