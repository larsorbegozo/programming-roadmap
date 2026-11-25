import { useMemo, useState } from 'react';
import { ArrowUpRight, SearchX } from 'lucide-react';
import { ResourceIcon, resourceTypeLabel } from '../../components/ResourceLink';
import { SearchInput } from '../../components/SearchInput';
import { Badge, Button, EmptyState, PageHeader, inputClass } from '../../components/ui';
import { curriculum } from '../../data/curriculum';
import { resources } from '../../data/resources';
import { phaseHref } from '../../hooks/useHashRoute';
import type { Resource, ResourceType } from '../../types/curriculum';

const types = Object.keys(resourceTypeLabel) as ResourceType[];

function matches(r: Resource, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [r.name, r.description, ...r.topics, new URL(r.url).hostname].some((t) => t.toLowerCase().includes(needle));
}

export function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [phaseId, setPhaseId] = useState('all');
  const [type, setType] = useState<ResourceType | 'all'>('all');

  const filtered = useMemo(
    () => resources.filter((r) => matches(r, query.trim()) && (phaseId === 'all' || r.phaseId === phaseId) && (type === 'all' || r.type === type)),
    [query, phaseId, type],
  );

  const groups = curriculum.map((p) => ({ phase: p, items: filtered.filter((r) => r.phaseId === p.id) })).filter((g) => g.items.length > 0);
  const hasFilters = query !== '' || phaseId !== 'all' || type !== 'all';

  return (
    <>
      <PageHeader title="Resource library" description={`${resources.length} free resources, organised by phase. All links open in a new tab.`} />

      <div className="mb-6 grid gap-2 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_200px_180px]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by name, topic or site…" />
        <select value={phaseId} onChange={(e) => setPhaseId(e.target.value)} className={inputClass} aria-label="Filter by phase">
          <option value="all">All phases</option>
          {curriculum.map((p) => (
            <option key={p.id} value={p.id}>
              Phase {p.number} · {p.title}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as ResourceType | 'all')} className={inputClass} aria-label="Filter by type">
          <option value="all">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {resourceTypeLabel[t]}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="mb-4 flex items-center justify-between text-[13px] text-muted">
          <span>
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setQuery('');
              setPhaseId('all');
              setType('all');
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {groups.length === 0 ? (
        <EmptyState icon={<SearchX className="size-6" />} title="No resources match" description="Try another search term or clear the filters." />
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ phase, items }) => (
            <section key={phase.id}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="font-medium">
                  <span className="text-subtle">Phase {phase.number} · </span>
                  {phase.title}
                </h2>
                <a href={phaseHref(phase.id)} className="shrink-0 text-[12px] text-subtle hover:text-fg">
                  View phase
                </a>
              </div>
              <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
                {items.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full flex-col rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-2"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-3 text-muted group-hover:text-accent">
                          <ResourceIcon type={r.type} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium leading-snug text-fg">{r.name}</p>
                          <p className="truncate text-[12px] text-subtle">{new URL(r.url).hostname.replace(/^www\./, '')}</p>
                        </div>
                        <ArrowUpRight className="size-4 shrink-0 text-subtle group-hover:text-fg" aria-label="Opens in a new tab" />
                      </div>
                      <p className="mt-3 flex-1 text-[13px] text-muted">{r.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge tone="accent">{resourceTypeLabel[r.type]}</Badge>
                        {r.topics.map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
