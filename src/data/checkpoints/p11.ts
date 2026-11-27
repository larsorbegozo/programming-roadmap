import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const DB_TYPES = `interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface ReviewEvent {
  id: string;
  userId: string;
  wordId: string;
  rating: string;
  at: string;
}

interface Settings {
  userId: string;
  dailyGoal: number;
}

interface Database {
  users: User[];
  reviewEvents: ReviewEvent[];
  settings: Settings[];
}
`;

const DB = `const db = {
  users: [
    { id: 'ana', email: 'ana@example.com', createdAt: '2026-10-01' },
    { id: 'ben', email: 'ben@example.com', createdAt: '2026-10-05' },
  ],
  reviewEvents: [
    { id: 'e1', userId: 'ana', wordId: 'w1', rating: 'Good', at: '2026-11-20T09:00:00Z' },
    { id: 'e2', userId: 'ben', wordId: 'w1', rating: 'Again', at: '2026-11-20T09:05:00Z' },
    { id: 'e3', userId: 'ana', wordId: 'w2', rating: 'Easy', at: '2026-11-21T08:00:00Z' },
  ],
  settings: [
    { userId: 'ana', dailyGoal: 20 },
    { userId: 'ben', dailyGoal: 10 },
  ],
};
const snapshot = JSON.stringify(db);`;

export const p11: Checkpoint = {
  phaseId: 'p11',
  questions: [
    {
      id: 'p11-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Which of these is personal data under GDPR?',
      options: [
        'A learner’s review history stored with their user id',
        'The list of German words in a word pack',
        'The app’s source code',
        'The average accuracy of all learners, with no way to identify anyone',
      ],
      answer: 0,
      explanation: 'Data linked to an identifiable person is personal data, even if it is "only" an id. Truly anonymous aggregates are not.',
    },
    {
      id: 'p11-q2',
      lesson: 1,
      kind: 'single',
      prompt: 'You build Lyra outside the EU, but people in Spain can sign up. Does GDPR apply?',
      options: [
        'Yes: it applies when you offer a service to people in the EU, wherever you are based',
        'No: only companies registered in the EU must comply',
        'Only if you charge money',
        'Only if you have more than 250 employees',
      ],
      answer: 0,
      explanation: 'GDPR follows the people whose data you process, not the location of the developer.',
    },
    {
      id: 'p11-q3',
      lesson: 1,
      kind: 'single',
      prompt: 'In GDPR terms, what is Supabase when it stores Lyra’s user data for you?',
      options: ['A processor: it handles the data on your behalf and following your instructions', 'The controller', 'A data subject', 'A supervisory authority'],
      answer: 0,
      explanation: 'You decide why and how the data is used, which makes you the controller. Services that store or process it for you are processors.',
    },
    {
      id: 'p11-q4',
      lesson: 2,
      kind: 'single',
      prompt: 'What does data minimisation mean?',
      options: [
        'Collect and keep only the personal data you actually need for a stated purpose',
        'Compress data so it uses less storage',
        'Delete all data every night',
        'Store data on as few servers as possible',
      ],
      answer: 0,
      explanation: 'Data you never collect cannot leak, does not need protecting, and does not need to be explained in your policy.',
    },
    {
      id: 'p11-q5',
      lesson: 3,
      kind: 'multi',
      prompt: 'Which of these are lawful bases for processing under GDPR? (Select all that apply.)',
      options: ['Consent', 'Performance of a contract', 'Legitimate interests', '"The app is free, so users accept it"'],
      answers: [0, 1, 2],
      explanation: 'The six bases are consent, contract, legal obligation, vital interests, public task and legitimate interests. Being free is not one of them.',
    },
    {
      id: 'p11-q6',
      lesson: 3,
      kind: 'single',
      prompt: 'Which lawful basis usually fits storing a learner’s account and progress so the app can work?',
      options: ['Contract: it is necessary to provide the service they signed up for', 'Consent, collected with a pre-ticked box', 'Legal obligation', 'Vital interests'],
      answer: 0,
      explanation: 'Without saving progress there is no learning app. Optional extras such as analytics usually need consent instead.',
    },
    {
      id: 'p11-q7',
      lesson: 5,
      kind: 'single',
      prompt: 'Which consent screen for non-essential analytics is valid?',
      options: [
        'An unticked opt-in toggle with a clear explanation, that can be turned off later as easily as it was turned on',
        'A pre-ticked box',
        '"By using Lyra you agree to analytics" in the terms of service',
        'Analytics that start immediately, with an opt-out hidden in settings',
      ],
      answer: 0,
      explanation: 'Consent must be freely given, specific, informed and unambiguous, and withdrawing it must be as easy as giving it.',
    },
    {
      id: 'p11-q8',
      lesson: 4,
      kind: 'single',
      prompt: 'Which of these must the privacy policy include?',
      options: [
        'What data you collect, why, the lawful basis, who receives it, how long you keep it, and the user’s rights',
        'The app’s source code',
        'Your Supabase password',
        'Only the date it was written',
      ],
      answer: 0,
      explanation: 'Article 13 lists what people must be told when you collect their data. Write it in plain language.',
    },
    {
      id: 'p11-q9',
      lesson: 6,
      kind: 'single',
      prompt: 'A user asks for a copy of all the data Lyra holds about them. How long do you normally have to respond?',
      options: ['One month', '24 hours', 'One year', 'There is no deadline'],
      answer: 0,
      explanation: 'The deadline is one month, which can be extended in some complex cases. An in-app export button answers it instantly.',
    },
    {
      id: 'p11-q10',
      lesson: 6,
      kind: 'single',
      prompt: 'Lyra lets people create accounts. What does Google Play require for account deletion?',
      options: [
        'A way to request deletion inside the app and also through a web link',
        'Nothing, as long as there is a support email',
        'Deletion only through a phone call',
        'Automatic deletion after 30 days',
      ],
      answer: 0,
      explanation: 'Users must be able to start deletion without reinstalling the app, and the link goes in the Data safety form.',
    },
    {
      id: 'p11-q11',
      lesson: 8,
      kind: 'single',
      prompt: 'Under GDPR, at what age can a child consent to an online service on their own?',
      options: ['16 by default; each EU country may lower it, but not below 13', 'Always 13', 'Always 18', 'There is no age rule'],
      answer: 0,
      explanation: 'Below that age a parent must consent. In the US, COPPA covers children under 13. Decide Lyra’s minimum age early.',
    },
    {
      id: 'p11-q12',
      lesson: 9,
      kind: 'single',
      prompt: 'A personal-data breach is likely to put users at risk. When must you notify the data protection authority?',
      options: ['Within 72 hours of becoming aware of it, where feasible', 'Within a year', 'Only if a journalist asks', 'Never, if you fix it quickly'],
      answer: 0,
      explanation: 'A short written incident plan makes those 72 hours manageable.',
    },
    {
      id: 'p11-q13',
      lesson: 10,
      kind: 'single',
      prompt: 'What must Google Play’s Data safety form match?',
      options: [
        'What the app and its third-party SDKs actually collect and share, consistent with your privacy policy',
        'What competitors declare',
        'Only what your own code collects, not SDKs',
        'Nothing; it is optional',
      ],
      answer: 0,
      explanation: 'Analytics or crash SDKs collect data too. A mismatch between the form, the policy and the app can get the app removed.',
    },
  ],
  problems: [
    {
      id: 'p11-export',
      title: 'Export a user’s data',
      lesson: 6,
      language: 'ts',
      exports: ['exportUserData'],
      setup: DB,
      prompt: md(
        'Implement the "Download my data" feature. Write `exportUserData(db, userId)` returning:',
        '```ts',
        '{ user: User | null; reviewEvents: ReviewEvent[]; settings: Settings | null }',
        '```',
        '- `user`: that user’s record, or `null` if it does not exist.',
        '- `reviewEvents`: **only** that user’s events (in their original order).',
        '- `settings`: that user’s settings, or `null`.',
        '- Never include another user’s data. Do not modify `db`.',
      ),
      starter: `${DB_TYPES}
function exportUserData(db: Database, userId: string) {
  return { user: db.users.find((u) => u.id === userId), reviewEvents: db.reviewEvents, settings: db.settings };
}
`,
      solution: `${DB_TYPES}
interface UserExport {
  user: User | null;
  reviewEvents: ReviewEvent[];
  settings: Settings | null;
}

function exportUserData(db: Database, userId: string): UserExport {
  return {
    user: db.users.find((u) => u.id === userId) ?? null,
    reviewEvents: db.reviewEvents.filter((e) => e.userId === userId),
    settings: db.settings.find((s) => s.userId === userId) ?? null,
  };
}
`,
      tests: [
        { name: 'Includes the user’s record', code: `expect(exportUserData(db, 'ana').user).toEqual({ id: 'ana', email: 'ana@example.com', createdAt: '2026-10-01' });` },
        { name: 'Includes only that user’s events', code: `expect(exportUserData(db, 'ana').reviewEvents.map((e) => e.id)).toEqual(['e1', 'e3']);` },
        { name: 'Includes that user’s settings', code: `expect(exportUserData(db, 'ben').settings).toEqual({ userId: 'ben', dailyGoal: 10 });` },
        { name: 'Never leaks another user’s data', code: `expect(JSON.stringify(exportUserData(db, 'ana'))).not.toContain('ben');` },
        { name: 'Unknown user → nulls and no events', code: `expect(exportUserData(db, 'zoe')).toEqual({ user: null, reviewEvents: [], settings: null });` },
        { name: 'Does not modify the database', code: `exportUserData(db, 'ana'); expect(JSON.stringify(db)).toBe(snapshot);` },
        {
          name: 'Works for any database and user',
          code: `const randomDb = () => {
          const ids = rand.distinct(rand.int(1, 4), () => rand.word(3, 5));
          const users = ids.filter(() => rand.next() < 0.8).map((id) => ({ id, email: id + '@example.com', createdAt: '2026-10-0' + rand.int(1, 9) }));
          const reviewEvents = rand.list(rand.int(0, 8), (i) => ({ id: 'e' + i, userId: rand.pick(ids), wordId: 'w' + rand.int(1, 5), rating: rand.pick(['Again', 'Good', 'Easy']), at: '2026-11-2' + rand.int(0, 5) + 'T09:00:00Z' }));
          const settings = ids.filter(() => rand.bool()).map((userId) => ({ userId, dailyGoal: rand.int(5, 50) }));
          return { ids, db: { users, reviewEvents, settings } };
        };
        await sameAsRef('exportUserData', () => {
          const { ids, db } = randomDb();
          return [db, rand.bool() ? rand.pick(ids) : rand.word(6, 7)];
        }, 40);`,
        },
      ],
      hints: ['`find` returns `undefined` when nothing matches; `?? null` turns that into null.', 'Use `filter` for the events and `find` for the single records.'],
    },
    {
      id: 'p11-delete',
      title: 'Delete a user’s data',
      lesson: 6,
      language: 'ts',
      exports: ['deleteUserData'],
      setup: DB,
      prompt: md(
        'Implement "Delete my account". Write `deleteUserData(db, userId)` that returns a **new** `Database` with every trace of that user removed: their user record, their review events and their settings.',
        '',
        'Other users’ data must stay exactly as it was, and the original `db` must not be modified.',
      ),
      starter: `${DB_TYPES}
function deleteUserData(db: Database, userId: string): Database {
  db.users = db.users.filter((u) => u.id !== userId);
  return db;
}
`,
      solution: `${DB_TYPES}
function deleteUserData(db: Database, userId: string): Database {
  return {
    users: db.users.filter((u) => u.id !== userId),
    reviewEvents: db.reviewEvents.filter((e) => e.userId !== userId),
    settings: db.settings.filter((s) => s.userId !== userId),
  };
}
`,
      tests: [
        { name: 'Removes the user record', code: `expect(deleteUserData(db, 'ana').users.map((u) => u.id)).toEqual(['ben']);` },
        { name: 'Removes the user’s review events', code: `expect(deleteUserData(db, 'ana').reviewEvents.map((e) => e.id)).toEqual(['e2']);` },
        { name: 'Removes the user’s settings', code: `expect(deleteUserData(db, 'ana').settings).toEqual([{ userId: 'ben', dailyGoal: 10 }]);` },
        { name: 'No trace of the user remains', code: `expect(JSON.stringify(deleteUserData(db, 'ana'))).not.toContain('ana');` },
        { name: 'Does not modify the original database', code: `deleteUserData(db, 'ana'); expect(JSON.stringify(db)).toBe(snapshot);` },
        {
          name: 'Works for any database and user',
          code: `const randomDb = () => {
          const ids = rand.distinct(rand.int(1, 4), () => rand.word(3, 5));
          const users = ids.filter(() => rand.next() < 0.8).map((id) => ({ id, email: id + '@example.com', createdAt: '2026-10-0' + rand.int(1, 9) }));
          const reviewEvents = rand.list(rand.int(0, 8), (i) => ({ id: 'e' + i, userId: rand.pick(ids), wordId: 'w' + rand.int(1, 5), rating: rand.pick(['Again', 'Good', 'Easy']), at: '2026-11-2' + rand.int(0, 5) + 'T09:00:00Z' }));
          const settings = ids.filter(() => rand.bool()).map((userId) => ({ userId, dailyGoal: rand.int(5, 50) }));
          return { ids, db: { users, reviewEvents, settings } };
        };
        await sameAsRef('deleteUserData', () => {
          const { ids, db } = randomDb();
          return [db, rand.bool() ? rand.pick(ids) : rand.word(6, 7)];
        }, 40);`,
        },
      ],
      hints: ['Personal data lives in three places here. Filter all three.', 'Build and return a new object instead of assigning to `db`.'],
    },
    {
      id: 'p11-analytics',
      title: 'Consent-aware, minimal analytics',
      lesson: 5,
      language: 'ts',
      exports: ['toAnalyticsEvent'],
      setup: `const answer = { userId: 'ana', email: 'ana@example.com', deviceId: 'pixel-7a-123', wordId: 'w1', exerciseType: 'matching', correct: true, responseMs: 1840 };`,
      prompt: md(
        'Before sending an answer to an analytics tool, Lyra must respect consent and send as little data as possible. Write `toAnalyticsEvent(answer, consented)`:',
        '- If `consented` is `false`, return `null` (send nothing).',
        "- Otherwise return **only** `{ name: 'answer', exerciseType, correct }`. No user id, email, device id, word id or timing.",
      ),
      starter: `interface AnswerRecord {
  userId: string;
  email: string;
  deviceId: string;
  wordId: string;
  exerciseType: string;
  correct: boolean;
  responseMs: number;
}

function toAnalyticsEvent(answer: AnswerRecord, consented: boolean) {
  return { name: 'answer', ...answer };
}
`,
      solution: `interface AnswerRecord {
  userId: string;
  email: string;
  deviceId: string;
  wordId: string;
  exerciseType: string;
  correct: boolean;
  responseMs: number;
}

interface AnalyticsEvent {
  name: 'answer';
  exerciseType: string;
  correct: boolean;
}

function toAnalyticsEvent(answer: AnswerRecord, consented: boolean): AnalyticsEvent | null {
  if (!consented) return null;
  return { name: 'answer', exerciseType: answer.exerciseType, correct: answer.correct };
}
`,
      tests: [
        { name: 'No consent → null', code: `expect(toAnalyticsEvent(answer, false)).toBeNull();` },
        { name: 'With consent → only the minimal fields', code: `expect(toAnalyticsEvent(answer, true)).toEqual({ name: 'answer', exerciseType: 'matching', correct: true });` },
        { name: 'Never contains identifying data', code: `const json = JSON.stringify(toAnalyticsEvent(answer, true)); for (const secret of ['ana', 'example.com', 'pixel', 'w1']) expect(json).not.toContain(secret);` },
        {
          name: 'Works for any answer',
          code: `await sameAsRef('toAnalyticsEvent', () => {
          const user = rand.word(3, 6);
          return [{ userId: user, email: user + '@example.com', deviceId: rand.word() + '-' + rand.int(1, 999), wordId: 'w' + rand.int(1, 99), exerciseType: rand.pick(['matching', 'typing', 'multiple-choice', 'typing-from-audio']), correct: rand.bool(), responseMs: rand.int(100, 9000) }, rand.bool()];
        }, 40);`,
        },
      ],
      hints: ['Check consent first and return early.', 'Build the object field by field instead of spreading the whole answer.'],
    },
  ],
};
