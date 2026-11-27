import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const RATING_TYPES = `type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';
type ExerciseType = 'matching' | 'multiple-choice' | 'typing' | 'typing-from-audio';

interface GameResult {
  correct: boolean;
  hintsUsed: number;
  exerciseType: ExerciseType;
  responseMs: number;
}
`;

const EVENT_TYPES = `type Rating = 'Again' | 'Hard' | 'Good' | 'Easy';

interface ReviewEvent {
  id: string;        // client-generated UUID
  wordId: string;
  rating: Rating;
  at: string;        // ISO timestamp, e.g. '2026-11-20T10:00:00Z'
  deviceId: string;
}
`;

const EVENTS = `const e = (id, wordId, rating, at, deviceId = 'phone') => ({ id, wordId, rating, at, deviceId });
const phone = [
  e('a1', 'w1', 'Good', '2026-11-20T10:00:00Z'),
  e('a2', 'w2', 'Again', '2026-11-20T10:01:00Z'),
  e('a3', 'w1', 'Good', '2026-11-21T09:00:00Z'),
];
const tablet = [
  e('b1', 'w2', 'Hard', '2026-11-20T18:00:00Z', 'tablet'),
  e('b2', 'w1', 'Again', '2026-11-22T08:00:00Z', 'tablet'),
];`;

export const p9: Checkpoint = {
  phaseId: 'p9',
  questions: [
    {
      id: 'p9-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Why does the architecture store every answer as an immutable review event instead of syncing each card’s current state?',
      options: [
        'Two devices never overwrite each other: events are only added, and card state is rebuilt by replaying them in order',
        'Events use less storage than cards',
        'Supabase cannot store mutable rows',
        'It makes animations smoother',
      ],
      answer: 0,
      explanation: 'With mutable rows, two devices editing the same card produce a conflict. With an append-only log, both devices’ events are simply combined.',
    },
    {
      id: 'p9-q2',
      lesson: 1,
      kind: 'single',
      prompt: 'In the recommended architecture, what does the phone own and what does Supabase own?',
      options: [
        'The phone owns the study loop (offline); Supabase owns accounts, content and competition',
        'Supabase runs every exercise; the phone only displays results',
        'The phone owns everything; Supabase is only a backup',
        'Both run the scheduler and compare results',
      ],
      answer: 0,
      explanation: 'Learners can study offline. The server handles what must be shared or trusted.',
    },
    {
      id: 'p9-q3',
      lesson: 2,
      kind: 'single',
      prompt: 'Why use a development build instead of Expo Go?',
      options: [
        'It includes your app’s own native modules and configuration, which Expo Go may not contain',
        'Expo Go is paid',
        'Development builds do not need a phone',
        'Expo Go cannot run JavaScript',
      ],
      answer: 0,
      explanation: 'Expo Go ships a fixed set of native modules. A development build is your app with exactly the native code it needs.',
    },
    {
      id: 'p9-q4',
      lesson: 2,
      kind: 'single',
      prompt: 'How should you install libraries such as Reanimated in the Expo project?',
      options: ['npx expo install <package>, which picks versions compatible with your SDK', 'npm install <package>@latest', 'Download them manually', 'Copy them from another project'],
      answer: 0,
      explanation: 'Native libraries must match the SDK. `npx expo install` chooses the right version; `@latest` often does not.',
    },
    {
      id: 'p9-q5',
      lesson: 3,
      kind: 'single',
      prompt: 'Under the recommended rating policy, the learner answers correctly but used a hint. Which rating?',
      options: ['Hard', 'Good', 'Easy', 'Again'],
      answer: 0,
      explanation: 'Wrong is Again, correct with a hint is Hard, correct is Good, and only unaided recall such as typing from audio can earn Easy.',
    },
    {
      id: 'p9-q6',
      lesson: 3,
      kind: 'single',
      prompt: 'A matching exercise is answered correctly, quickly and without hints. What is the highest rating it can earn?',
      options: ['Good', 'Easy', 'Hard', 'Again'],
      answer: 0,
      explanation: 'Recognition exercises (matching, multiple choice) are capped at Good because recognising is easier than recalling.',
    },
    {
      id: 'p9-q7',
      lesson: 3,
      kind: 'single',
      prompt: 'Why must `core/learning` have no React Native imports?',
      options: [
        'So the rating policy and replay logic can be unit-tested quickly without a phone, and reused on web later',
        'React Native is too slow for maths',
        'Expo forbids it',
        'To make the app bundle smaller',
      ],
      answer: 0,
      explanation: 'Pure TypeScript modules are the easiest code to test and to move into a shared package.',
    },
    {
      id: 'p9-q8',
      lesson: 8,
      kind: 'single',
      prompt: 'Why does each review event get a UUID generated on the phone?',
      options: [
        'If an upload is retried, the server recognises events it already has and ignores the duplicates',
        'UUIDs are shorter than numbers',
        'The phone cannot store numbers',
        'It hides the user’s identity',
      ],
      answer: 0,
      explanation: 'Networks fail mid-upload. A stable id makes the sync idempotent: sending the same batch twice changes nothing.',
    },
    {
      id: 'p9-q9',
      lesson: 4,
      kind: 'single',
      prompt: 'Why keep the scheduler’s random "fuzz" off (or seeded)?',
      options: [
        'Replaying the same events on another device must produce exactly the same card state',
        'Fuzz makes the app crash offline',
        'Random numbers are not allowed in TypeScript',
        'It makes reviews shorter',
      ],
      answer: 0,
      explanation: 'If the scheduler adds randomness, two replays of the same events disagree, and devices drift apart.',
    },
    {
      id: 'p9-q10',
      lesson: 6,
      kind: 'single',
      prompt: 'Why test the first game on a low-end Android phone before building a second one?',
      options: [
        'Animations that are smooth on a fast phone can be janky on the cheap devices many learners use',
        'Low-end phones are required by Google Play',
        'Expo only supports low-end phones',
        'It is faster to build on them',
      ],
      answer: 0,
      explanation: 'Finding performance problems in the first game is cheap; finding them after five games is expensive.',
    },
    {
      id: 'p9-q11',
      lesson: 10,
      kind: 'single',
      prompt: 'When should leagues, async PvP, iOS and subscriptions be built?',
      options: [
        'Only after the closed test shows that people come back (retention)',
        'Before the first game, to attract testers',
        'In parallel with the engine',
        'Never',
      ],
      answer: 0,
      explanation: 'They are months of work. Build them only once the core learning loop has proven its value.',
    },
  ],
  problems: [
    {
      id: 'p9-ratingFor',
      title: 'The rating policy',
      lesson: 3,
      language: 'ts',
      exports: ['ratingFor'],
      prompt: md(
        'Write `ratingFor(result)` that maps a game result to an FSRS rating, following the policy from your architecture review:',
        '- Wrong answer → `Again`',
        '- Correct, but at least one hint used → `Hard`',
        "- Correct, no hints, exercise type `'typing-from-audio'` (unaided recall) → `Easy`",
        '- Any other correct answer → `Good` (recognition exercises such as matching are capped at Good)',
        '',
        'The types are given. Annotate the function so it returns a `Rating`.',
      ),
      starter: `${RATING_TYPES}
function ratingFor(result) {
  return result.correct ? 'Good' : 'Again';
}
`,
      solution: `${RATING_TYPES}
function ratingFor(result: GameResult): Rating {
  if (!result.correct) return 'Again';
  if (result.hintsUsed > 0) return 'Hard';
  if (result.exerciseType === 'typing-from-audio') return 'Easy';
  return 'Good';
}
`,
      setup: `const r = (correct, hintsUsed, exerciseType) => ({ correct, hintsUsed, exerciseType, responseMs: 1500 });`,
      tests: [
        { name: 'Wrong → Again', code: `expect(ratingFor(r(false, 0, 'typing'))).toBe('Again'); expect(ratingFor(r(false, 2, 'matching'))).toBe('Again');` },
        { name: 'Correct with a hint → Hard', code: `expect(ratingFor(r(true, 1, 'typing'))).toBe('Hard'); expect(ratingFor(r(true, 3, 'typing-from-audio'))).toBe('Hard');` },
        { name: 'Unaided recall from audio → Easy', code: `expect(ratingFor(r(true, 0, 'typing-from-audio'))).toBe('Easy');` },
        { name: 'Recognition is capped at Good', code: `expect(ratingFor(r(true, 0, 'matching'))).toBe('Good'); expect(ratingFor(r(true, 0, 'multiple-choice'))).toBe('Good');` },
        { name: 'Typing without audio → Good', code: `expect(ratingFor(r(true, 0, 'typing'))).toBe('Good');` },
        {
          name: 'Works for any result',
          code: `await sameAsRef('ratingFor', () => [{ correct: rand.bool(), hintsUsed: rand.pick([0, 0, rand.int(1, 4)]), exerciseType: rand.pick(['typing', 'typing-from-audio', 'matching', 'multiple-choice']), responseMs: rand.int(200, 9000) }], 40);`,
        },
      ],
      typeTests: [
        { name: 'Returns a Rating', code: `const g: GameResult = { correct: true, hintsUsed: 0, exerciseType: 'typing', responseMs: 900 };\nconst rating: Rating = ratingFor(g);` },
        {
          name: 'Only accepts a GameResult',
          hint: 'ratingFor accepts an incomplete object. Annotate the parameter as GameResult.',
          code: `// @ts-expect-error
ratingFor({ correct: true });`,
        },
      ],
      hints: ['Check the conditions from the most important to the least: wrong first, then hints, then exercise type.'],
    },
    {
      id: 'p9-mergeEvents',
      title: 'Idempotent event merge',
      lesson: 8,
      language: 'ts',
      exports: ['mergeEvents'],
      setup: EVENTS,
      prompt: md(
        'When the sync function receives a batch of events, it merges them into the events it already has. Write `mergeEvents(existing, incoming)`:',
        '- Return a **new** array with every event from both lists.',
        '- Events are identified by `id`. If an incoming event has an id that already exists, **ignore it** (keep the existing one).',
        '- Sort the result by `at` (oldest first); if two events have the same `at`, sort by `id`.',
        '- Do not modify the input arrays.',
        '',
        'This makes the sync **idempotent**: merging the same batch twice gives the same result as merging it once.',
      ),
      starter: `${EVENT_TYPES}
function mergeEvents(existing: ReviewEvent[], incoming: ReviewEvent[]): ReviewEvent[] {
  return [...existing, ...incoming];
}
`,
      solution: `${EVENT_TYPES}
function mergeEvents(existing: ReviewEvent[], incoming: ReviewEvent[]): ReviewEvent[] {
  const byId = new Map<string, ReviewEvent>();
  for (const event of existing) byId.set(event.id, event);
  for (const event of incoming) if (!byId.has(event.id)) byId.set(event.id, event);
  return [...byId.values()].sort((a, b) => (a.at === b.at ? a.id.localeCompare(b.id) : a.at.localeCompare(b.at)));
}
`,
      tests: [
        { name: 'Combines two devices in time order', code: `expect(mergeEvents(phone, tablet).map((x) => x.id)).toEqual(['a1', 'a2', 'b1', 'a3', 'b2']);` },
        { name: 'Ignores duplicates (re-uploaded batch)', code: `expect(mergeEvents(phone, phone).map((x) => x.id)).toEqual(['a1', 'a2', 'a3']);` },
        { name: 'Keeps the existing version of a duplicate', code: `const changed = { ...phone[0], rating: 'Easy' }; expect(mergeEvents(phone, [changed])[0].rating).toBe('Good');` },
        { name: 'Merging twice equals merging once', code: `const once = mergeEvents(phone, tablet); expect(mergeEvents(once, tablet)).toEqual(once);` },
        { name: 'Same timestamp: sorted by id', code: `const x = [e('z9', 'w1', 'Good', '2026-11-20T10:00:00Z')]; expect(mergeEvents(x, [e('m5', 'w2', 'Good', '2026-11-20T10:00:00Z')]).map((v) => v.id)).toEqual(['m5', 'z9']);` },
        { name: 'Does not modify the inputs', code: `const a = JSON.stringify(phone); const b = JSON.stringify(tablet); mergeEvents(tablet, phone); expect(JSON.stringify(phone)).toBe(a); expect(JSON.stringify(tablet)).toBe(b);` },
        {
          name: 'Works for any two devices',
          code: `const time = () => '2026-11-' + (10 + rand.int(0, 9)) + 'T' + String(rand.int(0, 23)).padStart(2, '0') + ':00:00Z';
        const randomEvent = (id) => e(id, 'w' + rand.int(1, 4), rand.pick(['Again', 'Hard', 'Good', 'Easy']), time());
        await sameAsRef('mergeEvents', () => {
          const ids = rand.distinct(rand.int(1, 10), () => rand.word(2, 3));
          const pool = ids.map(randomEvent);
          const existing = pool.filter(() => rand.bool());
          const incoming = pool.filter(() => rand.bool()).map((x) => (rand.bool() ? { ...x, rating: 'Easy', deviceId: 'tablet' } : x));
          return [existing, incoming];
        }, 40);`,
        },
      ],
      hints: ['A `Map` keyed by id makes duplicate detection easy.', 'ISO timestamps sort correctly as strings, so `a.at.localeCompare(b.at)` works.', '`.sort()` modifies the array it is called on, so sort a new array.'],
    },
    {
      id: 'p9-replay',
      title: 'Rebuild card state by replay',
      lesson: 4,
      language: 'ts',
      exports: ['replay'],
      setup: EVENTS,
      prompt: md(
        'Card state is never synced; it is rebuilt from events. Write `replay(events)` that returns an object mapping each `wordId` to its `CardState`:',
        '```ts',
        'interface CardState {',
        '  reviews: number;        // how many events',
        '  lapses: number;         // how many Again ratings',
        '  streak: number;         // consecutive non-Again ratings at the end (resets to 0 on Again)',
        '  lastRating: Rating;',
        '  lastReviewedAt: string;',
        '}',
        '```',
        '- Process events in time order (`at`, then `id`), **whatever order they arrive in**.',
        '- Do not modify the input array.',
        '',
        '(This is a simplified stand-in for the FSRS scheduler: the important part is that the same events always rebuild the same state.)',
      ),
      starter: `${EVENT_TYPES}
interface CardState {
  reviews: number;
  lapses: number;
  streak: number;
  lastRating: Rating;
  lastReviewedAt: string;
}

function replay(events: ReviewEvent[]): Record<string, CardState> {
  const cards: Record<string, CardState> = {};
  for (const event of events) {
    const card = cards[event.wordId] ?? { reviews: 0, lapses: 0, streak: 0, lastRating: event.rating, lastReviewedAt: event.at };
    card.reviews++;
    if (event.rating === 'Again') card.lapses++;
    card.streak++;
    card.lastRating = event.rating;
    card.lastReviewedAt = event.at;
    cards[event.wordId] = card;
  }
  return cards;
}
`,
      solution: `${EVENT_TYPES}
interface CardState {
  reviews: number;
  lapses: number;
  streak: number;
  lastRating: Rating;
  lastReviewedAt: string;
}

function replay(events: ReviewEvent[]): Record<string, CardState> {
  const ordered = [...events].sort((a, b) => (a.at === b.at ? a.id.localeCompare(b.id) : a.at.localeCompare(b.at)));
  const cards: Record<string, CardState> = {};
  for (const event of ordered) {
    const prev = cards[event.wordId];
    const again = event.rating === 'Again';
    cards[event.wordId] = {
      reviews: (prev?.reviews ?? 0) + 1,
      lapses: (prev?.lapses ?? 0) + (again ? 1 : 0),
      streak: again ? 0 : (prev?.streak ?? 0) + 1,
      lastRating: event.rating,
      lastReviewedAt: event.at,
    };
  }
  return cards;
}
`,
      tests: [
        { name: 'Counts reviews and lapses per word', code: `const s = replay([...phone, ...tablet]); expect(s.w1.reviews).toBe(3); expect(s.w1.lapses).toBe(1); expect(s.w2.reviews).toBe(2); expect(s.w2.lapses).toBe(1);` },
        { name: 'Again resets the streak', code: `const s = replay([...phone, ...tablet]); expect(s.w1.streak).toBe(0); expect(s.w2.streak).toBe(1);` },
        { name: 'Records the last rating and time', code: `const s = replay([...phone, ...tablet]); expect(s.w1.lastRating).toBe('Again'); expect(s.w1.lastReviewedAt).toBe('2026-11-22T08:00:00Z'); expect(s.w2.lastRating).toBe('Hard');` },
        { name: 'Arrival order does not matter', code: `const a = replay([...phone, ...tablet]); const b = replay([...tablet].reverse().concat([...phone].reverse())); expect(b).toEqual(a);` },
        { name: 'Does not modify the input', code: `const input = [...tablet, ...phone]; const before = JSON.stringify(input); replay(input); expect(JSON.stringify(input)).toBe(before);` },
        { name: 'No events → empty object', code: `expect(replay([])).toEqual({});` },
        {
          name: 'Works for any history',
          code: `const time = () => '2026-11-' + (10 + rand.int(0, 9)) + 'T' + String(rand.int(0, 23)).padStart(2, '0') + ':00:00Z';
        const randomEvent = (id) => e(id, 'w' + rand.int(1, 4), rand.pick(['Again', 'Hard', 'Good', 'Easy']), time());
        await sameAsRef('replay', () => [rand.distinct(rand.int(0, 12), () => rand.word(2, 3)).map(randomEvent)], 40);`,
        },
      ],
      typeTests: [{ name: 'Returns a record of card states', code: `const s: Record<string, CardState> = replay([]);` }],
      hints: ['Sort a copy of the events before processing them.', 'On `Again`, increase `lapses` and set `streak` to 0; otherwise add 1 to `streak`.'],
    },
  ],
};
