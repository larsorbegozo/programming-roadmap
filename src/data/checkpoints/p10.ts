import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const XP_TYPES = `type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';

interface ReviewEvent {
  id: string;
  userId: string;
  wordId: string;
  rating: Rating;
  at: string; // ISO timestamp in UTC, e.g. '2026-11-20T10:00:00Z'
}
`;

export const p10: Checkpoint = {
  phaseId: 'p10',
  questions: [
    {
      id: 'p10-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'According to your CLAUDE.md rules, what must every migration that creates a table also do?',
      options: ['Enable Row Level Security and add its policies', 'Insert test data', 'Create an index on every column', 'Grant access to the anon role on all rows'],
      answer: 0,
      explanation: 'A table without RLS is readable and writable by anyone with the public key. Doing it in the same migration means it can never be forgotten.',
    },
    {
      id: 'p10-q2',
      lesson: 1,
      kind: 'single',
      prompt: 'Content tables (words, packs) should have which policy for normal users?',
      options: ['Read-only: users can select but not insert, update or delete', 'Full read and write', 'No access at all', 'Write-only'],
      answer: 0,
      explanation: 'Learners need to read words, but only you (through migrations or a server) should change them.',
    },
    {
      id: 'p10-q3',
      lesson: 2,
      kind: 'single',
      prompt: 'Why must the Supabase `service_role` key never be in the app?',
      options: [
        'It bypasses Row Level Security, so anyone who extracts it from the app could read or change every user’s data',
        'It expires after one day',
        'It makes the app slower',
        'Google Play rejects apps that contain keys',
      ],
      answer: 0,
      explanation: 'Anything shipped in an app can be extracted. The service_role key belongs only in server code such as Edge Functions.',
    },
    {
      id: 'p10-q4',
      lesson: 2,
      kind: 'single',
      prompt: 'What is true about environment variables named `EXPO_PUBLIC_…`?',
      options: [
        'They are embedded in the app bundle, so anyone can read them: only public values belong there',
        'They are encrypted on the device',
        'They are only available on the server',
        'They are removed in production builds',
      ],
      answer: 0,
      explanation: 'The prefix tells Expo to inline the value into your JavaScript. Never put a secret in one.',
    },
    {
      id: 'p10-q5',
      lesson: 2,
      kind: 'single',
      prompt: 'You accidentally committed and pushed a secret key. What is the most important first step?',
      options: [
        'Revoke or rotate the key immediately, because it must be considered leaked',
        'Delete the commit and hope nobody saw it',
        'Make the repository private',
        'Add the file to .gitignore',
      ],
      answer: 0,
      explanation: 'Bots scan GitHub for keys within minutes. Removing it from history is good hygiene, but only rotating it makes the leaked key useless.',
    },
    {
      id: 'p10-q6',
      lesson: 2,
      kind: 'multi',
      prompt: 'Which of these can safely be shipped inside the app? (Select all that apply.)',
      options: ['The Supabase project URL', 'The Supabase anon (publishable) key', 'The service_role key', 'The database password'],
      answers: [0, 1],
      explanation: 'The URL and anon key are designed to be public; RLS protects the data. The other two give full access.',
    },
    {
      id: 'p10-q7',
      lesson: 3,
      kind: 'single',
      prompt: 'The app sends `{ "xpEarned": 5000 }` to the server after a session. How should leagues use it?',
      options: [
        'Ignore it: compute XP on the server from the synced review events',
        'Trust it, since the app calculated it',
        'Trust it only if it is below 10,000',
        'Store it and check it once a month',
      ],
      answer: 0,
      explanation: 'Anyone can modify an app or call your API directly. Competition data must be derived on the server from facts it can check.',
    },
    {
      id: 'p10-q8',
      lesson: 4,
      kind: 'single',
      prompt: 'A word list is licensed CC BY-SA. What does that require if you use it in Lyra?',
      options: [
        'Credit the author, and share your adapted version of that content under the same licence',
        'Nothing; Creative Commons means public domain',
        'You may only use it in non-commercial apps',
        'You must pay a fee per user',
      ],
      answer: 0,
      explanation: 'BY means attribution; SA (share-alike) means adaptations must use the same licence. NC is the clause that forbids commercial use.',
    },
    {
      id: 'p10-q9',
      lesson: 4,
      kind: 'single',
      prompt: 'Where does the architecture review say to record each content item’s source and licence?',
      options: ['In the word pack’s metadata', 'Only in your head', 'In the app’s About screen only', 'In a commit message'],
      answer: 0,
      explanation: 'Keeping it with the data means you can always answer "where did this come from, and may we use it?".',
    },
    {
      id: 'p10-q10',
      lesson: 5,
      kind: 'single',
      prompt: 'Your personal Google Play developer account was created in 2026. What must happen before you can apply for production access?',
      options: [
        'A closed test with at least 12 testers opted in for 14 continuous days',
        'Nothing; you can publish immediately',
        'A review by Google engineers in person',
        '1,000 downloads in internal testing',
      ],
      answer: 0,
      explanation: 'This applies to personal accounts created after November 13, 2023. Recruit testers while you build.',
    },
    {
      id: 'p10-q11',
      lesson: 6,
      kind: 'single',
      prompt: 'What does an organization Google Play account require that a personal one does not?',
      options: ['Business verification, including a D-U-N-S number', 'A paid Google Workspace plan', 'At least 50 employees', 'An iOS version of the app'],
      answer: 0,
      explanation: 'Organization accounts skip the 12-tester rule but need a registered business with a D-U-N-S number.',
    },
    {
      id: 'p10-q12',
      lesson: 7,
      kind: 'multi',
      prompt: 'Which rules belong in Lyra’s CLAUDE.md? (Select all that apply.)',
      options: [
        'Typecheck, lint and tests must pass before a task counts as done',
        'Install packages only with npx expo install, and ask before adding a dependency',
        'Never place secrets in the repository or the app bundle',
        'Disable Row Level Security during development to go faster',
      ],
      answers: [0, 1, 2],
      explanation: 'The first three are from your architecture review. Disabling RLS "temporarily" is how real data leaks happen.',
    },
  ],
  problems: [
    {
      id: 'p10-computeXp',
      title: 'Compute XP on the server',
      lesson: 3,
      language: 'ts',
      exports: ['computeXp'],
      setup: `const e = (id, userId, rating, at) => ({ id, userId, wordId: 'w-' + id, rating, at });
const events = [
  e('1', 'ana', 'Good', '2026-11-20T09:00:00Z'),
  e('2', 'ana', 'Easy', '2026-11-20T09:01:00Z'),
  e('3', 'ana', 'Hard', '2026-11-20T09:02:00Z'),
  e('4', 'ana', 'Again', '2026-11-20T09:03:00Z'),
  e('5', 'ben', 'Easy', '2026-11-20T09:04:00Z'),
];`,
      prompt: md(
        'Leagues must never trust a score sent by the app. Write `computeXp(events, userId)` that calculates a user’s XP from synced review events:',
        '- Only count events whose `userId` matches.',
        '- Count each event `id` **once**, even if it appears several times (retried uploads).',
        '- XP per rating: `Again` 0, `Hard` 5, `Good` 10, `Easy` 15.',
        '- **Anti-farming cap:** at most **300 XP per UTC day** (the day is the first 10 characters of `at`, for example `2026-11-20`).',
      ),
      starter: `${XP_TYPES}
const XP: Record<Rating, number> = { Again: 0, Hard: 5, Good: 10, Easy: 15 };

function computeXp(events: ReviewEvent[], userId: string): number {
  return events.reduce((sum, event) => sum + XP[event.rating], 0);
}
`,
      solution: `${XP_TYPES}
const XP: Record<Rating, number> = { Again: 0, Hard: 5, Good: 10, Easy: 15 };
const DAILY_CAP = 300;

function computeXp(events: ReviewEvent[], userId: string): number {
  const seen = new Set<string>();
  const perDay = new Map<string, number>();
  for (const event of events) {
    if (event.userId !== userId || seen.has(event.id)) continue;
    seen.add(event.id);
    const day = event.at.slice(0, 10);
    perDay.set(day, (perDay.get(day) ?? 0) + XP[event.rating]);
  }
  let total = 0;
  for (const xp of perDay.values()) total += Math.min(xp, DAILY_CAP);
  return total;
}
`,
      tests: [
        { name: 'Sums XP by rating', code: `expect(computeXp(events, 'ana')).toBe(30);` },
        { name: 'Only counts the requested user', code: `expect(computeXp(events, 'ben')).toBe(15); expect(computeXp(events, 'nobody')).toBe(0);` },
        { name: 'Counts duplicated events once', code: `expect(computeXp([...events, ...events], 'ana')).toBe(30);` },
        { name: 'Caps XP at 300 per day', code: `const farm = Array.from({ length: 40 }, (_, i) => e('f' + i, 'ana', 'Easy', '2026-11-21T10:00:00Z')); expect(computeXp(farm, 'ana')).toBe(300);` },
        { name: 'The cap applies per day', code: `const day1 = Array.from({ length: 40 }, (_, i) => e('x' + i, 'ana', 'Easy', '2026-11-21T10:00:00Z')); const day2 = Array.from({ length: 2 }, (_, i) => e('y' + i, 'ana', 'Good', '2026-11-22T10:00:00Z')); expect(computeXp([...day1, ...day2], 'ana')).toBe(320);` },
      ],
      typeTests: [{ name: 'Returns a number', code: `const xp: number = computeXp([], 'ana');` }],
      hints: ['Use a `Set` of ids you have already counted.', 'Sum XP per day in a `Map` keyed by `at.slice(0, 10)`, then add `Math.min(dayTotal, 300)` for each day.'],
    },
    {
      id: 'p10-publicEnv',
      title: 'Catch secrets in public env vars',
      lesson: 2,
      language: 'ts',
      exports: ['findLeakedSecrets'],
      prompt: md(
        'Write a safety check that could run before every build. `findLeakedSecrets(env)` receives the environment variables as an object and returns the **names** of the variables that would leak a secret into the app:',
        '- Only variables whose name starts with `EXPO_PUBLIC_` are bundled into the app; ignore all others.',
        '- A public variable leaks a secret if its name contains `SERVICE_ROLE`, `SECRET`, `PASSWORD` or `PRIVATE` (in any letter case).',
        '- Return the names sorted alphabetically (an empty array when everything is fine).',
        '',
        'Example: `{ EXPO_PUBLIC_SUPABASE_URL: "…", EXPO_PUBLIC_SERVICE_ROLE_KEY: "…", SUPABASE_SERVICE_ROLE_KEY: "…" }` → `["EXPO_PUBLIC_SERVICE_ROLE_KEY"]`.',
      ),
      starter: `function findLeakedSecrets(env: Record<string, string>): string[] {
  return Object.keys(env).filter((name) => name.includes('SECRET'));
}
`,
      solution: `const SENSITIVE = ['SERVICE_ROLE', 'SECRET', 'PASSWORD', 'PRIVATE'];

function findLeakedSecrets(env: Record<string, string>): string[] {
  return Object.keys(env)
    .filter((name) => name.startsWith('EXPO_PUBLIC_'))
    .filter((name) => SENSITIVE.some((word) => name.toUpperCase().includes(word)))
    .sort();
}
`,
      tests: [
        { name: 'A safe configuration returns []', code: `expect(findLeakedSecrets({ EXPO_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', EXPO_PUBLIC_SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'srv' })).toEqual([]);` },
        { name: 'Finds a public service_role key', code: `expect(findLeakedSecrets({ EXPO_PUBLIC_SUPABASE_URL: 'u', EXPO_PUBLIC_SERVICE_ROLE_KEY: 'srv' })).toEqual(['EXPO_PUBLIC_SERVICE_ROLE_KEY']);` },
        { name: 'Server-only secrets are fine', code: `expect(findLeakedSecrets({ STRIPE_SECRET_KEY: 's', DB_PASSWORD: 'p' })).toEqual([]);` },
        { name: 'Checks every sensitive word, in any case', code: `expect(findLeakedSecrets({ EXPO_PUBLIC_db_password: 'p', EXPO_PUBLIC_PRIVATE_TOKEN: 't', EXPO_PUBLIC_API_SECRET: 's' })).toEqual(['EXPO_PUBLIC_API_SECRET', 'EXPO_PUBLIC_PRIVATE_TOKEN', 'EXPO_PUBLIC_db_password']);` },
      ],
      hints: ['Filter twice: first by the `EXPO_PUBLIC_` prefix, then by the sensitive words.', 'Compare in one case: `name.toUpperCase().includes(word)`.'],
    },
  ],
};
