import type { FinalExam } from '../../types/checkpoint';

export const final9: FinalExam = {
  phaseId: 'p9',
  minutes: 45,
  questions: [
    {
      id: 'f9-q1',
      lesson: 8,
      kind: 'single',
      prompt: 'What does it mean that the sync upload is idempotent?',
      options: ['Sending the same batch twice gives the same result as sending it once', 'Uploads are encrypted', 'Uploads happen once a day', 'The server rejects any repeated request with an error'],
      answer: 0,
      explanation: 'Client-generated event ids let the server recognise and skip events it already has.',
    },
    {
      id: 'f9-q2',
      lesson: 5,
      kind: 'single',
      prompt: 'Why are word packs versioned?',
      options: ['So you can update content without breaking progress tied to existing words, and know which version a device has', 'Versions make packs smaller', 'Google Play requires it', 'To charge for each version'],
      answer: 0,
      explanation: 'Progress refers to word ids; versions make content changes deliberate.',
    },
    {
      id: 'f9-q3',
      lesson: 6,
      kind: 'single',
      prompt: 'What is the session runner’s job?',
      options: ['Run a sequence of exercises from any game and save every result in the same way', 'Draw the game graphics', 'Upload events to Supabase', 'Choose the app theme'],
      answer: 0,
      explanation: 'Games only report a result; the runner and the engine handle the rest.',
    },
    {
      id: 'f9-q4',
      lesson: 7,
      kind: 'single',
      prompt: '"Adding a game needs no change to core/" — what design makes that possible?',
      options: ['Every game returns the same result shape, which the engine already understands', 'Each game has its own scheduler', 'core/ imports every game', 'Games write directly to the database'],
      answer: 0,
      explanation: 'A shared interface keeps the engine stable while games come and go.',
    },
    {
      id: 'f9-q5',
      lesson: 9,
      kind: 'single',
      prompt: 'What is day-7 retention?',
      options: ['The share of testers who come back to the app 7 days after they started', 'How many words a learner remembers after 7 days', 'How long the app stays installed', 'The number of sessions in the first week'],
      answer: 0,
      explanation: 'It is the review’s signal for whether to keep building.',
    },
    {
      id: 'f9-q6',
      lesson: 3,
      kind: 'single',
      prompt: 'Why store the exercise type in every review event instead of tuning FSRS separately per game?',
      options: ['You can analyse or retune later from raw data while keeping one simple scheduler', 'FSRS requires it', 'It makes events smaller', 'Games cannot have different difficulty'],
      answer: 0,
      explanation: 'Raw logs keep every option open; premature tuning closes them.',
    },
    {
      id: 'f9-q7',
      lesson: 8,
      kind: 'single',
      prompt: 'What does the "airplane mode" test prove?',
      options: ['Studying offline works and, after reconnecting, events reach the server exactly once', 'The app works without a phone', 'The app is fast', 'Notifications work'],
      answer: 0,
      explanation: 'It checks both offline-first behaviour and idempotent sync.',
    },
    {
      id: 'f9-q8',
      lesson: 1,
      kind: 'single',
      prompt: 'Why keep persistent data in expo-sqlite and only live session state in Zustand?',
      options: ['So there is a single source of truth for stored data', 'Zustand cannot store numbers', 'SQLite is faster for animations', 'Zustand is not allowed in Expo'],
      answer: 0,
      explanation: 'Two copies of the same data drift apart.',
    },
  ],
  problems: [
    {
      id: 'f9-batches',
      title: 'Batch the pending uploads',
      lesson: 8,
      language: 'ts',
      exports: ['pendingBatches'],
      setup: `const e = (id, at) => ({ id, wordId: 'w', rating: 'Good', at });
const local = [e('c', '2026-11-20T10:02:00Z'), e('a', '2026-11-20T10:00:00Z'), e('d', '2026-11-20T10:03:00Z'), e('b', '2026-11-20T10:01:00Z'), e('e', '2026-11-20T10:04:00Z')];
const snapshot = JSON.stringify(local);`,
      prompt: [
        'Before syncing, the app splits the events that have not been uploaded yet into batches. Write `pendingBatches(local, syncedIds, batchSize)`:',
        '',
        '- `local`: all review events on the phone.',
        '- `syncedIds`: an array of event ids the server already has. Skip those.',
        '- Sort the remaining events by `at` (oldest first) and split them into arrays of at most `batchSize` events.',
        '- Return an array of batches (an empty array when nothing is pending). Do not modify `local`.',
      ].join('\n'),
      starter: `interface ReviewEvent {
  id: string;
  wordId: string;
  rating: string;
  at: string;
}

function pendingBatches(local: ReviewEvent[], syncedIds: string[], batchSize: number): ReviewEvent[][] {
  return [local];
}
`,
      solution: `interface ReviewEvent {
  id: string;
  wordId: string;
  rating: string;
  at: string;
}

function pendingBatches(local: ReviewEvent[], syncedIds: string[], batchSize: number): ReviewEvent[][] {
  const synced = new Set(syncedIds);
  const pending = local.filter((e) => !synced.has(e.id)).sort((a, b) => a.at.localeCompare(b.at));
  const batches: ReviewEvent[][] = [];
  for (let i = 0; i < pending.length; i += batchSize) batches.push(pending.slice(i, i + batchSize));
  return batches;
}
`,
      tests: [
        { name: 'Skips synced events and batches the rest', code: `expect(pendingBatches(local, ['a'], 2).map((b) => b.map((x) => x.id))).toEqual([['b', 'c'], ['d', 'e']]);` },
        { name: 'Sorts by time', hidden: true, code: `expect(pendingBatches(local, [], 10)[0].map((x) => x.id)).toEqual(['a', 'b', 'c', 'd', 'e']);` },
        { name: 'Last batch can be smaller', hidden: true, code: `expect(pendingBatches(local, [], 2).map((b) => b.length)).toEqual([2, 2, 1]);` },
        { name: 'Nothing pending → []', hidden: true, code: `expect(pendingBatches(local, ['a', 'b', 'c', 'd', 'e'], 2)).toEqual([]);` },
        { name: 'Does not modify local', hidden: true, code: `expect(pendingBatches(local, [], 2)).toHaveLength(3); expect(JSON.stringify(local)).toBe(snapshot);` },
        {
          name: 'Works for any queue and batch size',
          hidden: true,
          code: `await sameAsRef('pendingBatches', () => {
          const ids = rand.distinct(rand.int(0, 12), () => rand.word(2, 4));
          const minutes = rand.shuffle(ids.map((_, i) => i));
          const queue = ids.map((id, i) => e(id, '2026-11-20T10:' + String(minutes[i]).padStart(2, '0') + ':00Z'));
          return [queue, ids.filter(() => rand.next() < 0.3), rand.int(1, 5)];
        }, 40);`,
        },
      ],
    },
  ],
};
