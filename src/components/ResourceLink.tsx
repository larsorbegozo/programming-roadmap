import { ArrowUpRight, BookOpen, FileText, GraduationCap, Library, Wrench } from 'lucide-react';
import type { Resource, ResourceType } from '../types/curriculum';

export const resourceTypeLabel: Record<ResourceType, string> = {
  documentation: 'Documentation',
  'interactive-course': 'Interactive course',
  tutorial: 'Tutorial',
  reference: 'Reference',
  tool: 'Tool',
};

const icons: Record<ResourceType, typeof BookOpen> = {
  documentation: FileText,
  'interactive-course': GraduationCap,
  tutorial: BookOpen,
  reference: Library,
  tool: Wrench,
};

export function ResourceIcon({ type, className = 'size-4' }: { type: ResourceType; className?: string }) {
  const Icon = icons[type];
  return <Icon className={className} aria-hidden />;
}

/** Compact external link row used inside lessons. */
export function ResourceLink({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5 transition-colors hover:border-line-strong hover:bg-surface-3"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-surface-3 text-muted group-hover:text-accent">
        <ResourceIcon type={resource.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-fg">{resource.name}</span>
        <span className="block truncate text-[12px] text-subtle">
          {resourceTypeLabel[resource.type]} · {new URL(resource.url).hostname.replace(/^www\./, '')}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-subtle transition-colors group-hover:text-fg" aria-label="Opens in a new tab" />
    </a>
  );
}
