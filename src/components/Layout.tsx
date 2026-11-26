import type { ReactNode } from 'react';
import { BarChart3, CalendarCheck, Cloud, CloudOff, GraduationCap, LayoutDashboard, Library, Map, Settings, Sparkles, X } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { useCloudSync, type CloudStatus } from '../hooks/useCloudSync';
import { routeHref, type Route } from '../hooks/useHashRoute';
import { getOverallProgress } from '../lib/progress';
import { cx, ProgressBar } from './ui';

type NavName = 'dashboard' | 'roadmap' | 'exams' | 'resources' | 'planner' | 'progress' | 'settings';

const navItems: Array<{ name: NavName; label: string; short: string; icon: typeof Map }> = [
  { name: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { name: 'roadmap', label: 'Roadmap', short: 'Roadmap', icon: Map },
  { name: 'exams', label: 'Finals', short: 'Finals', icon: GraduationCap },
  { name: 'resources', label: 'Resources', short: 'Library', icon: Library },
  { name: 'planner', label: 'Weekly plan', short: 'Plan', icon: CalendarCheck },
  { name: 'progress', label: 'Progress', short: 'Progress', icon: BarChart3 },
  { name: 'settings', label: 'Settings', short: 'Settings', icon: Settings },
];

const syncLabel: Record<CloudStatus, string> = {
  disabled: '',
  'signed-out': 'Not synced',
  checking: 'Connecting…',
  syncing: 'Syncing…',
  synced: 'Synced',
  offline: 'Offline',
  'needs-setup': 'Sync setup needed',
  error: 'Sync problem',
};

function SyncBadge({ className }: { className?: string }) {
  const { status } = useCloudSync();
  if (status === 'disabled') return null;
  const bad = status === 'offline' || status === 'error' || status === 'needs-setup';
  const Icon = bad ? CloudOff : Cloud;
  return (
    <a
      href="#/settings"
      title="Cloud sync settings"
      className={cx('inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-fg', status === 'synced' ? 'text-success' : bad ? 'text-danger' : 'text-subtle', className)}
    >
      <Icon className="size-3.5" /> {syncLabel[status]}
    </a>
  );
}

function activeNav(route: Route): NavName {
  if (route.name === 'exam') return 'exams';
  return route.name === 'lesson' || route.name === 'checkpoint' ? 'roadmap' : route.name;
}

export function Layout({ route, children }: { route: Route; children: ReactNode }) {
  const { state, storageError, dismissStorageError } = useAppState();
  const overall = getOverallProgress(state);
  const active = activeNav(route);

  return (
    <div className="min-h-dvh md:pl-60">
      {/* Desktop / tablet sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-bg md:flex">
        <a href="#/" className="flex items-center gap-2.5 px-5 pb-6 pt-6">
          <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Lyra Roadmap</span>
        </a>
        <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Main">
          {navItems.map(({ name, label, icon: Icon }) => (
            <a
              key={name}
              href={routeHref({ name } as Route)}
              aria-current={active === name ? 'page' : undefined}
              className={cx(
                'flex h-9 items-center gap-3 rounded-lg px-3 transition-colors',
                active === name ? 'bg-surface-2 text-fg' : 'text-muted hover:bg-surface hover:text-fg',
              )}
            >
              <Icon className={cx('size-4', active === name && 'text-accent')} />
              {label}
            </a>
          ))}
        </nav>
        <div className="m-3 rounded-xl border border-line p-4">
          <div className="flex items-baseline justify-between text-[12px]">
            <span className="text-subtle">Roadmap</span>
            <span className="font-medium tabular-nums text-fg">{overall.percent}%</span>
          </div>
          <ProgressBar value={overall.percent} className="mt-2" label="Overall progress" />
          <p className="mt-2 text-[12px] text-subtle">
            {overall.lessonsCompleted} of {overall.lessonsTotal} lessons
          </p>
          <SyncBadge className="mt-3" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
        <a href="#/" className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
            <Sparkles className="size-4" />
          </span>
          <span className="font-semibold tracking-tight">Lyra Roadmap</span>
        </a>
        <span className="flex items-center gap-3">
          <SyncBadge />
          <span className="text-[12px] tabular-nums text-muted">{overall.percent}%</span>
        </span>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 md:pt-10 lg:px-10">
        {storageError && (
          <div role="alert" className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-danger">
            <span>{storageError}</span>
            <button type="button" onClick={dismissStorageError} aria-label="Dismiss" className="shrink-0 rounded p-0.5 hover:bg-danger/20">
              <X className="size-4" />
            </button>
          </div>
        )}
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-7 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {navItems.map(({ name, short, icon: Icon }) => (
          <a
            key={name}
            href={routeHref({ name } as Route)}
            aria-current={active === name ? 'page' : undefined}
            className={cx('flex h-14 flex-col items-center justify-center gap-1 text-[10px]', active === name ? 'text-fg' : 'text-subtle')}
          >
            <Icon className={cx('size-[18px]', active === name && 'text-accent')} />
            {short}
          </a>
        ))}
      </nav>
    </div>
  );
}
