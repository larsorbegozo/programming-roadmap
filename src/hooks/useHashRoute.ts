import { useEffect, useState } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'roadmap'; phaseId?: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'resources' }
  | { name: 'planner' }
  | { name: 'progress' }
  | { name: 'settings' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [first, second] = parts;
  switch (first) {
    case 'roadmap':
      return second ? { name: 'roadmap', phaseId: second } : { name: 'roadmap' };
    case 'lesson':
      return second ? { name: 'lesson', lessonId: second } : { name: 'roadmap' };
    case 'resources':
    case 'planner':
    case 'progress':
    case 'settings':
      return { name: first };
    default:
      return { name: 'dashboard' };
  }
}

export function routeHref(route: Route): string {
  switch (route.name) {
    case 'dashboard':
      return '#/';
    case 'roadmap':
      return route.phaseId ? `#/roadmap/${route.phaseId}` : '#/roadmap';
    case 'lesson':
      return `#/lesson/${route.lessonId}`;
    default:
      return `#/${route.name}`;
  }
}

export const lessonHref = (lessonId: string) => routeHref({ name: 'lesson', lessonId });
export const phaseHref = (phaseId: string) => routeHref({ name: 'roadmap', phaseId });

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
