import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const QUIZ_TYPES = `interface VocabularyWord {
  id: string;
  term: string;
  translation: string;
}

interface QuizQuestion {
  wordId: string;
  prompt: string;
  options: string[];
  answerIndex: number;
}
`;

const QUIZ_SETUP = `function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const words = [
  { id: 'w1', term: 'Hund', translation: 'dog' },
  { id: 'w2', term: 'Katze', translation: 'cat' },
  { id: 'w3', term: 'Mieze', translation: 'cat' },
  { id: 'w4', term: 'Brot', translation: 'bread' },
  { id: 'w5', term: 'Apfel', translation: 'apple' },
  { id: 'w6', term: 'Milch', translation: 'milk' },
];
const target = words[0];`;

const SESSION_TYPES = `interface Answer {
  wordId: string;
  correct: boolean;
  ms: number;
}

interface SessionSummary {
  total: number;
  correct: number;
  accuracy: number;
  averageMs: number;
  toReview: string[];
}
`;

export const p8: Checkpoint = {
  phaseId: 'p8',
  questions: [
    {
      id: 'p8-q1',
      lesson: 2,
      kind: 'single',
      prompt: 'Why turn on TypeScript `strict` mode for Lyra from day one?',
      options: [
        'It catches more mistakes, such as missing types and possibly-undefined values, before they become bugs',
        'It makes the app smaller',
        'Expo refuses to run without it',
        'It removes the need for tests',
      ],
      answer: 0,
      explanation: 'Turning strict on later means fixing hundreds of errors at once. Starting strict keeps the code honest from the first file.',
    },
    {
      id: 'p8-q2',
      lesson: 3,
      kind: 'single',
      prompt: 'In an Expo Router project, what belongs in the `app/` folder?',
      options: ['Route files: each file is a screen or a layout', 'All of your utility functions', 'Images and fonts', 'Database migrations'],
      answer: 0,
      explanation: 'Keep `app/` thin. Put components, data access and logic in other folders and import them into the screens.',
    },
    {
      id: 'p8-q3',
      lesson: 4,
      kind: 'single',
      prompt: 'Which Expo Router file defines a tab bar for the screens in the `(tabs)` folder?',
      options: ['app/(tabs)/_layout.tsx', 'app/tabs.json', 'app/(tabs)/index.tsx', 'navigation.config.ts'],
      answer: 0,
      explanation: 'A `_layout.tsx` file wraps the screens in its folder. Returning `<Tabs />` there creates the tab bar. Parentheses group routes without adding to the URL.',
    },
    {
      id: 'p8-q4',
      lesson: 5,
      kind: 'single',
      prompt: 'Why define the vocabulary data model (types and seed data) before connecting Supabase?',
      options: [
        'You can build and test screens against a realistic data shape now, then swap the data source later',
        'Supabase cannot store vocabulary',
        'Types are required by Expo Router',
        'Seed data makes the app faster in production',
      ],
      answer: 0,
      explanation: 'A clear type for a word is the contract between UI, storage and backend. Changing the source later does not change the screens.',
    },
    {
      id: 'p8-q5',
      lesson: 6,
      kind: 'single',
      prompt: 'The vocabulary card appears on three screens. How should you build it?',
      options: [
        'One reusable component that receives the word through props',
        'Copy the card code into each screen',
        'One component per screen with slightly different names',
        'Render it as an image',
      ],
      answer: 0,
      explanation: 'One component means one place to fix bugs and change the design.',
    },
    {
      id: 'p8-q6',
      lesson: 7,
      kind: 'single',
      prompt: 'What makes a good wrong option (distractor) in a vocabulary quiz?',
      options: [
        'A real translation of a different word, never equal to the right answer and never repeated',
        'A random string of letters',
        'The right answer with a typo',
        'Always the same three wrong words',
      ],
      answer: 0,
      explanation: 'Plausible, unique distractors make the learner actually recall the word instead of eliminating nonsense.',
    },
    {
      id: 'p8-q7',
      lesson: 9,
      kind: 'single',
      prompt: 'When should Lyra save a learner’s progress?',
      options: [
        'After each answer (or a small batch), so closing the app never loses work',
        'Only when the learner taps a Save button',
        'Once a week',
        'Only when the app is closed properly',
      ],
      answer: 0,
      explanation: 'Phones close apps without warning. Save small and often.',
    },
    {
      id: 'p8-q8',
      lesson: 8,
      kind: 'single',
      prompt: 'Where should the Supabase URL and anon key come from in the Expo app?',
      options: [
        'Environment variables such as EXPO_PUBLIC_SUPABASE_URL, set in a .env file that is not committed',
        'Hard-coded in every screen',
        'The service_role key in app.json',
        'A text file downloaded at startup',
      ],
      answer: 0,
      explanation: 'Variables prefixed with EXPO_PUBLIC_ are bundled into the app (so they must only hold public values like the anon key). Keeping them in .env avoids repeating them and keeps them out of Git.',
    },
  ],
  problems: [
    {
      id: 'p8-buildQuestion',
      title: 'Generate a quiz question',
      lesson: 7,
      language: 'ts',
      exports: ['buildQuestion'],
      setup: QUIZ_SETUP,
      prompt: md(
        'Write `buildQuestion(target, pool, optionCount, random)` that builds one multiple-choice question for the word `target`:',
        '- `wordId` is the target’s id, and `prompt` is the target’s `term`.',
        '- `options` contains the target’s translation **exactly once**, plus wrong options taken from the translations of other words in `pool`.',
        '- Never repeat an option. Skip the target itself and any word with the same translation as the target.',
        '- Use up to `optionCount` options in total. If the pool is too small, return fewer.',
        '- **Shuffle** the options using the `random` function you receive (it returns numbers from 0 to 1, like `Math.random`), so the right answer is not always first.',
        '- `answerIndex` is the position of the right answer in `options`.',
        '',
        'The tests pass a seeded `random` so results are repeatable.',
      ),
      starter: `${QUIZ_TYPES}
function buildQuestion(target, pool, optionCount, random) {
  const wrong = pool.filter((w) => w.id !== target.id).map((w) => w.translation);
  const options = [target.translation, ...wrong].slice(0, optionCount);
  return { wordId: target.id, prompt: target.term, options, answerIndex: 0 };
}
`,
      solution: `${QUIZ_TYPES}
function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildQuestion(target: VocabularyWord, pool: VocabularyWord[], optionCount: number, random: () => number): QuizQuestion {
  const distractors: string[] = [];
  for (const word of pool) {
    const t = word.translation;
    if (word.id === target.id || t === target.translation || distractors.includes(t)) continue;
    distractors.push(t);
  }
  const picked = shuffle(distractors, random).slice(0, Math.max(0, optionCount - 1));
  const options = shuffle([target.translation, ...picked], random);
  return { wordId: target.id, prompt: target.term, options, answerIndex: options.indexOf(target.translation) };
}
`,
      tests: [
        { name: 'Prompt is the term and wordId is kept', code: `const q = buildQuestion(target, words, 4, seeded(1)); expect(q.prompt).toBe('Hund'); expect(q.wordId).toBe('w1');` },
        { name: 'The right answer appears exactly once', code: `const q = buildQuestion(target, words, 4, seeded(2)); expect(q.options.filter((o) => o === 'dog')).toHaveLength(1);` },
        { name: 'answerIndex always points to the right answer', code: `for (let s = 1; s <= 30; s++) { const q = buildQuestion(target, words, 4, seeded(s)); expect(q.options[q.answerIndex]).toBe('dog'); }` },
        { name: 'Uses the requested number of options', code: `expect(buildQuestion(target, words, 4, seeded(3)).options).toHaveLength(4); expect(buildQuestion(target, words, 3, seeded(3)).options).toHaveLength(3);` },
        { name: 'Options are never repeated', code: `for (let s = 1; s <= 30; s++) { const q = buildQuestion(target, words, 5, seeded(s)); expect(new Set(q.options).size).toBe(q.options.length); }` },
        { name: 'Small pool: returns fewer options', code: `const q = buildQuestion(target, words.slice(0, 3), 4, seeded(4)); expect([...q.options].sort()).toEqual(['cat', 'dog']);` },
        { name: 'The right answer is shuffled', code: `const positions = new Set(); for (let s = 1; s <= 30; s++) positions.add(buildQuestion(target, words, 4, seeded(s)).answerIndex); expect(positions.size).toBeGreaterThan(2);` },
        {
          name: 'Works for any pool and option count',
          code: `for (let round = 0; round < 25; round++) {
          const translations = rand.distinct(rand.int(1, 8), () => rand.word(3, 6));
          const pool = rand.list(rand.int(1, 10), (i) => ({ id: 'x' + i, term: rand.word(4, 7), translation: rand.pick(translations) }));
          const t = rand.pick(pool);
          const count = rand.int(2, 6);
          const q = buildQuestion(t, pool, count, seeded(rand.int(1, 100000)));
          const distinct = new Set(pool.map((w) => w.translation));
          expect(q.prompt).toBe(t.term);
          expect(q.wordId).toBe(t.id);
          expect(q.options).toHaveLength(Math.min(count, distinct.size));
          expect(new Set(q.options).size).toBe(q.options.length);
          expect(q.options[q.answerIndex]).toBe(t.translation);
          for (const option of q.options) expect([...distinct]).toContain(option);
        }`,
        },
      ],
      typeTests: [
        { name: 'Returns a QuizQuestion', code: `const w: VocabularyWord = { id: 'a', term: 'b', translation: 'c' };\nconst q: QuizQuestion = buildQuestion(w, [w], 4, Math.random);` },
        {
          name: 'Parameters are typed',
          hint: 'buildQuestion accepts a string as the target. Annotate the parameters.',
          code: `// @ts-expect-error
buildQuestion('Hund', [], 4, Math.random);`,
        },
      ],
      hints: [
        'First collect the unique distractor translations, then shuffle and take `optionCount - 1` of them.',
        'Fisher–Yates shuffle: for i from the last index down to 1, pick `j = Math.floor(random() * (i + 1))` and swap items i and j.',
        'After shuffling, find the answer with `options.indexOf(target.translation)`.',
      ],
    },
    {
      id: 'p8-summarizeSession',
      title: 'Summarize a learning session',
      lesson: 10,
      language: 'ts',
      exports: ['summarizeSession'],
      setup: `const answers = [
  { wordId: 'w1', correct: true, ms: 1200 },
  { wordId: 'w2', correct: false, ms: 3000 },
  { wordId: 'w3', correct: true, ms: 1500 },
  { wordId: 'w2', correct: false, ms: 2500 },
  { wordId: 'w4', correct: false, ms: 4000 },
  { wordId: 'w2', correct: true, ms: 1000 },
];`,
      prompt: md(
        'At the end of a learning session Lyra shows a summary. Write `summarizeSession(answers)` returning a `SessionSummary`:',
        '- `total`: number of answers',
        '- `correct`: number of correct answers',
        '- `accuracy`: percentage correct, rounded (0 when there are no answers)',
        '- `averageMs`: average answer time in ms, rounded (0 when there are no answers)',
        '- `toReview`: ids of words answered wrongly **at least once**, without duplicates, in the order they were first missed',
        '',
        'The types are given. Your code must pass strict mode.',
      ),
      starter: `${SESSION_TYPES}
function summarizeSession(answers) {
  const correct = answers.filter((a) => a.correct).length;
  return {
    total: answers.length,
    correct,
    accuracy: correct / answers.length,
    averageMs: 0,
    toReview: answers.filter((a) => !a.correct).map((a) => a.wordId),
  };
}
`,
      solution: `${SESSION_TYPES}
function summarizeSession(answers: Answer[]): SessionSummary {
  const total = answers.length;
  if (total === 0) return { total: 0, correct: 0, accuracy: 0, averageMs: 0, toReview: [] };
  const correct = answers.filter((a) => a.correct).length;
  const totalMs = answers.reduce((sum, a) => sum + a.ms, 0);
  const toReview: string[] = [];
  for (const a of answers) {
    if (!a.correct && !toReview.includes(a.wordId)) toReview.push(a.wordId);
  }
  return {
    total,
    correct,
    accuracy: Math.round((correct / total) * 100),
    averageMs: Math.round(totalMs / total),
    toReview,
  };
}
`,
      tests: [
        { name: 'Counts and accuracy', code: `const s = summarizeSession(answers); expect(s.total).toBe(6); expect(s.correct).toBe(3); expect(s.accuracy).toBe(50);` },
        { name: 'Average time is rounded', code: `expect(summarizeSession(answers).averageMs).toBe(2200); expect(summarizeSession(answers.slice(0, 2)).averageMs).toBe(2100); expect(summarizeSession([{ wordId: 'a', correct: true, ms: 1 }, { wordId: 'b', correct: true, ms: 2 }]).averageMs).toBe(2);` },
        { name: 'Words to review: unique, in order', code: `expect(summarizeSession(answers).toReview).toEqual(['w2', 'w4']);` },
        { name: 'All correct → nothing to review, 100%', code: `const s = summarizeSession(answers.filter((a) => a.correct)); expect(s.toReview).toEqual([]); expect(s.accuracy).toBe(100);` },
        { name: 'No answers → all zeros', code: `expect(summarizeSession([])).toEqual({ total: 0, correct: 0, accuracy: 0, averageMs: 0, toReview: [] });` },
        {
          name: 'Works for any session',
          code: `await sameAsRef('summarizeSession', () => [rand.list(rand.int(0, 12), () => ({ wordId: 'w' + rand.int(1, 5), correct: rand.bool(), ms: rand.int(1, 6000) }))], 40);`,
        },
      ],
      typeTests: [{ name: 'Returns a SessionSummary', code: `const s: SessionSummary = summarizeSession([]);` }],
      hints: ['Handle the empty list first to avoid dividing by zero.', 'For `toReview`, loop through the answers and push an id only if it is wrong and not already in the list.'],
    },
  ],
};
