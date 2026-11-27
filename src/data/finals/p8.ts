import type { FinalExam } from '../../types/checkpoint';

export const final8: FinalExam = {
  phaseId: 'p8',
  minutes: 45,
  questions: [
    {
      id: 'f8-q1',
      lesson: 3,
      kind: 'single',
      prompt: 'Where should a screen get its vocabulary data from?',
      options: ['From a data module or hook that hides where the data comes from', 'Hard-coded inside the screen', 'From a global window variable', 'Copied into every screen'],
      answer: 0,
      explanation: 'When the source changes from seed data to Supabase, only that module changes.',
    },
    {
      id: 'f8-q2',
      lesson: 4,
      kind: 'single',
      prompt: 'In the screen `app/words/[id].tsx`, how do you read the id?',
      options: ['const { id } = useLocalSearchParams()', 'props.id', 'window.location.id', 'useState(id)'],
      answer: 0,
      explanation: 'Route parameters always arrive as strings, so convert them if you need a number.',
    },
    {
      id: 'f8-q3',
      lesson: 8,
      kind: 'single',
      prompt: 'Where should the Supabase client be created?',
      options: ['Once, in a shared module such as lib/supabase.ts, and imported where needed', 'Inside every component that uses it', 'In app.json', 'In each screen’s useEffect'],
      answer: 0,
      explanation: 'One client keeps one session and one configuration.',
    },
    {
      id: 'f8-q4',
      lesson: 8,
      kind: 'single',
      prompt: 'When is an `EXPO_PUBLIC_` environment variable read?',
      options: ['When the app is bundled; its value is written into the JavaScript', 'Every time the app opens, from the server', 'Only in development', 'Never; Expo ignores env files'],
      answer: 0,
      explanation: 'Changing it requires a new bundle or build, and anyone can read it from the app.',
    },
    {
      id: 'f8-q5',
      lesson: 9,
      kind: 'single',
      prompt: 'The phone is offline when a learner answers. What should happen to the progress?',
      options: ['Save it locally and upload it later when the connection returns', 'Discard it', 'Block the learner until they are online', 'Show an error and lose the answer'],
      answer: 0,
      explanation: 'This is the offline-first idea behind the event log in your architecture review.',
    },
    {
      id: 'f8-q6',
      lesson: 10,
      kind: 'single',
      prompt: 'What is the most valuable thing to unit-test first in a learning session?',
      options: ['The session logic (scoring, what counts as mastered) as pure functions', 'The colours of the buttons', 'The splash screen', 'The app icon'],
      answer: 0,
      explanation: 'Pure logic is fast to test and is where a silent bug would corrupt progress.',
    },
    {
      id: 'f8-q7',
      lesson: 1,
      kind: 'single',
      prompt: 'Why commit after each working milestone?',
      options: ['You can always return to the last state that worked', 'Git requires one commit per file', 'Commits make the app faster', 'It is only for teams'],
      answer: 0,
      explanation: 'Small commits are save points.',
    },
    {
      id: 'f8-q8',
      lesson: 5,
      kind: 'single',
      prompt: 'A word counts as mastered after 3 correct answers in a row. What must Lyra store per word?',
      options: ['The current number of consecutive correct answers', 'Only whether the last answer was correct', 'The total number of answers ever', 'Nothing; it can be guessed'],
      answer: 0,
      explanation: 'A streak counter that resets on a wrong answer is enough for this rule.',
    },
  ],
  problems: [
    {
      id: 'f8-applyAnswer',
      title: 'Update mastery after an answer',
      lesson: 9,
      language: 'ts',
      exports: ['applyAnswer'],
      setup: `const progress = [
  { wordId: 'w1', streak: 2, mastered: false },
  { wordId: 'w2', streak: 5, mastered: true },
];
const snapshot = JSON.stringify(progress);`,
      prompt: [
        'Write `applyAnswer(progress, answer)` that returns a **new** progress array after one answer. Each entry is `{ wordId, streak, mastered }`.',
        '',
        '- Correct answer: `streak + 1`; the word becomes `mastered` when the streak reaches **3**.',
        '- Wrong answer: `streak` becomes 0 and `mastered` becomes false.',
        '- If the word has no entry yet, add one (starting from streak 0).',
        '- Do not modify the input array or its objects.',
        '',
        'The types are given; annotate the function.',
      ].join('\n'),
      starter: `interface WordProgress {
  wordId: string;
  streak: number;
  mastered: boolean;
}

interface Answer {
  wordId: string;
  correct: boolean;
}

function applyAnswer(progress, answer) {
  const entry = progress.find((p) => p.wordId === answer.wordId);
  entry.streak = answer.correct ? entry.streak + 1 : 0;
  return progress;
}
`,
      solution: `interface WordProgress {
  wordId: string;
  streak: number;
  mastered: boolean;
}

interface Answer {
  wordId: string;
  correct: boolean;
}

function applyAnswer(progress: WordProgress[], answer: Answer): WordProgress[] {
  const next = (p: WordProgress): WordProgress => {
    const streak = answer.correct ? p.streak + 1 : 0;
    return { wordId: p.wordId, streak, mastered: answer.correct ? streak >= 3 || p.mastered : false };
  };
  if (!progress.some((p) => p.wordId === answer.wordId)) {
    return [...progress, next({ wordId: answer.wordId, streak: 0, mastered: false })];
  }
  return progress.map((p) => (p.wordId === answer.wordId ? next(p) : p));
}
`,
      tests: [
        { name: 'A correct answer reaching 3 masters the word', code: `const r = applyAnswer(progress, { wordId: 'w1', correct: true }); expect(r[0]).toEqual({ wordId: 'w1', streak: 3, mastered: true });` },
        { name: 'A wrong answer resets the streak and mastery', hidden: true, code: `const r = applyAnswer(progress, { wordId: 'w2', correct: false }); expect(r[1]).toEqual({ wordId: 'w2', streak: 0, mastered: false });` },
        { name: 'New words get an entry', hidden: true, code: `const r = applyAnswer(progress, { wordId: 'w9', correct: true }); expect(r).toHaveLength(3); expect(r[2]).toEqual({ wordId: 'w9', streak: 1, mastered: false });` },
        { name: 'Below 3 is not mastered', hidden: true, code: `const r = applyAnswer([], { wordId: 'a', correct: true }); expect(applyAnswer(r, { wordId: 'a', correct: true })[0]).toEqual({ wordId: 'a', streak: 2, mastered: false });` },
        { name: 'Does not modify the input', hidden: true, code: `applyAnswer(progress, { wordId: 'w1', correct: true }); applyAnswer(progress, { wordId: 'w2', correct: false }); expect(JSON.stringify(progress)).toBe(snapshot);` },
        {
          name: 'Works for any progress and answer',
          hidden: true,
          code: `await sameAsRef('applyAnswer', () => {
          const ids = rand.distinct(rand.int(0, 5), () => 'w' + rand.int(1, 9));
          const list = ids.map((wordId) => {
            const streak = rand.int(0, 6);
            return { wordId, streak, mastered: streak >= 3 && rand.bool() };
          });
          return [list, { wordId: 'w' + rand.int(1, 9), correct: rand.bool() }];
        }, 40);
        let state = [];
        let theirs = [];
        for (let i = 0; i < 30; i++) {
          const answer = { wordId: 'w' + rand.int(1, 3), correct: rand.next() < 0.7 };
          state = applyAnswer(state, answer);
          theirs = ref.applyAnswer(theirs, answer);
          expect(state).toEqual(theirs);
        }`,
        },
      ],
      typeTests: [
        { name: 'Returns WordProgress[]', code: `const r: WordProgress[] = applyAnswer([], { wordId: 'a', correct: true });` },
        { name: 'Answer must be typed', hidden: true, hint: 'applyAnswer accepts an answer without "correct".', code: `// @ts-expect-error\napplyAnswer([], { wordId: 'a' });` },
      ],
    },
  ],
};
