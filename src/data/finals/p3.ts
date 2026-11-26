import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

const WORD = `interface VocabularyWord {
  id: string;
  term: string;
  translation: string;
  category: string;
}
`;

export const final3: FinalExam = {
  phaseId: 'p3',
  minutes: 60,
  questions: [
    {
      id: 'f3-q1',
      lesson: 8,
      kind: 'single',
      prompt: md('Why does TypeScript reject this?', '```ts', 'type Id = string | number;', 'function show(id: Id) {', '  return id.toFixed(2);', '}', '```'),
      options: ['`toFixed` only exists on numbers; narrow with `typeof id === "number"` first', 'Type aliases cannot contain unions', 'Functions cannot return strings', 'It compiles without errors'],
      answer: 0,
      explanation: 'On a union you may only use what every member supports.',
    },
    {
      id: 'f3-q2',
      lesson: 5,
      kind: 'single',
      prompt: 'What does `readonly` on a property mean?',
      options: ['TypeScript will not let you reassign it after the object is created', 'The value is encrypted', 'The property is optional', 'The property is hidden from console.log'],
      answer: 0,
      explanation: 'It is a compile-time check only; the JavaScript that runs has no such protection.',
    },
    {
      id: 'f3-q3',
      lesson: 5,
      kind: 'single',
      prompt: 'Which type describes "a pair: a word and how many times it was reviewed", like `["Hund", 3]`?',
      options: ['[string, number]', '(string | number)[]', 'string[] & number[]', 'Array<string, number>'],
      answer: 0,
      explanation: 'A tuple fixes the length and the type at each position. `(string | number)[]` allows any length and any order.',
    },
    {
      id: 'f3-q4',
      lesson: 10,
      kind: 'single',
      prompt: 'What does the return type `void` mean in `function log(message: string): void`?',
      options: ['The function does not return a useful value', 'The function returns null', 'The function never finishes', 'The function returns an empty string'],
      answer: 0,
      explanation: '`never` is the type for functions that never finish (they always throw or loop forever).',
    },
    {
      id: 'f3-q5',
      lesson: 2,
      kind: 'single',
      prompt: md('What happens here?', '```ts', 'const value: unknown = JSON.parse(text);', 'console.log(value.term);', '```'),
      options: ['A type error: you must check what `value` is before reading `.term`', 'It compiles and prints the term', 'It is a syntax error', 'value becomes any automatically'],
      answer: 0,
      explanation: '`unknown` forces you to narrow, for example with `typeof value === "object" && value !== null && "term" in value`.',
    },
    {
      id: 'f3-q6',
      lesson: 9,
      kind: 'single',
      prompt: 'What is `Partial<VocabularyWord>`?',
      options: ['The same shape with every property optional', 'Only the first half of the properties', 'A word with no properties', 'A word whose properties are all strings'],
      answer: 0,
      explanation: 'It is handy for updates: `function updateWord(id: string, changes: Partial<VocabularyWord>)`.',
    },
    {
      id: 'f3-q7',
      lesson: 6,
      kind: 'single',
      prompt: 'Given `interface AudioWord extends VocabularyWord { audioUrl: string }`, what does an AudioWord have?',
      options: ['Every VocabularyWord property plus audioUrl', 'Only audioUrl', 'Either the word properties or audioUrl', 'Nothing until it is instantiated with new'],
      answer: 0,
      explanation: '`extends` adds properties to an existing interface.',
    },
    {
      id: 'f3-q8',
      lesson: 9,
      kind: 'single',
      prompt: '`word.example` is optional and currently undefined. What does `word.example?.length` give?',
      options: ['undefined, without throwing an error', 'A TypeError', '0', 'null'],
      answer: 0,
      explanation: 'Optional chaining `?.` stops and returns undefined when the value on its left is null or undefined.',
    },
    {
      id: 'f3-q9',
      lesson: 11,
      kind: 'single',
      prompt: 'What does `Record<string, number>` describe?',
      options: ['An object whose keys are strings and whose values are numbers', 'An array of strings and numbers', 'A tuple of a string and a number', 'A Map object'],
      answer: 0,
      explanation: 'For example a count of words per category: `{ animals: 3, food: 5 }`.',
    },
    {
      id: 'f3-q10',
      lesson: 3,
      kind: 'single',
      prompt: "What type does TypeScript infer for `const words = ['Hund', 'Katze'];`?",
      options: ['string[]', "['Hund', 'Katze']", 'any[]', 'readonly string[]'],
      answer: 0,
      explanation: 'The array itself can still change, so its element type is widened to `string`. Adding `as const` would give a readonly tuple of literals.',
    },
  ],
  problems: [
    {
      id: 'f3-exercises',
      title: 'A discriminated union of exercises',
      lesson: 8,
      language: 'ts',
      exports: ['describeExercise'],
      prompt: md(
        'Lyra has three exercise types. Define a type `Exercise` that is a **union** of:',
        "- `{ kind: 'flashcard'; front: string; back: string }`",
        "- `{ kind: 'multiple-choice'; prompt: string; options: string[]; answerIndex: number }`",
        "- `{ kind: 'typing'; prompt: string; answer: string }`",
        '',
        'Then write `describeExercise(exercise: Exercise): string` returning:',
        '- `Flashcard: <front>`',
        '- `Multiple choice: <prompt> (<number of options> options)`',
        '- `Typing: <prompt>`',
        '',
        'Use `exercise.kind` to narrow the union.',
      ),
      starter: `type Exercise = any;

function describeExercise(exercise) {
  return 'Exercise';
}
`,
      solution: `type Exercise =
  | { kind: 'flashcard'; front: string; back: string }
  | { kind: 'multiple-choice'; prompt: string; options: string[]; answerIndex: number }
  | { kind: 'typing'; prompt: string; answer: string };

function describeExercise(exercise: Exercise): string {
  switch (exercise.kind) {
    case 'flashcard':
      return 'Flashcard: ' + exercise.front;
    case 'multiple-choice':
      return 'Multiple choice: ' + exercise.prompt + ' (' + exercise.options.length + ' options)';
    case 'typing':
      return 'Typing: ' + exercise.prompt;
  }
}
`,
      tests: [
        { name: 'Describes a flashcard', code: `expect(describeExercise({ kind: 'flashcard', front: 'Hund', back: 'dog' })).toBe('Flashcard: Hund');` },
        { name: 'Describes multiple choice', hidden: true, code: `expect(describeExercise({ kind: 'multiple-choice', prompt: 'Katze', options: ['cat', 'dog', 'cow'], answerIndex: 0 })).toBe('Multiple choice: Katze (3 options)');` },
        { name: 'Describes typing', hidden: true, code: `expect(describeExercise({ kind: 'typing', prompt: 'Brot', answer: 'bread' })).toBe('Typing: Brot');` },
      ],
      typeTests: [
        { name: 'Each exercise kind is accepted', code: `const a: Exercise = { kind: 'flashcard', front: 'Hund', back: 'dog' };\nconst b: Exercise = { kind: 'multiple-choice', prompt: 'p', options: ['a'], answerIndex: 0 };\nconst c: Exercise = { kind: 'typing', prompt: 'p', answer: 'a' };` },
        {
          name: 'A flashcard needs a back',
          hidden: true,
          hint: 'Your Exercise type accepts a flashcard without "back".',
          code: `// @ts-expect-error
const a: Exercise = { kind: 'flashcard', front: 'Hund' };`,
        },
        {
          name: 'Unknown kinds are rejected',
          hidden: true,
          hint: "Your Exercise type accepts kind: 'audio'.",
          code: `// @ts-expect-error
const a: Exercise = { kind: 'audio', prompt: 'x' };`,
        },
        {
          name: 'Each kind has its own fields',
          hidden: true,
          hint: 'Your Exercise type accepts a typing exercise with options instead of an answer.',
          code: `// @ts-expect-error
const a: Exercise = { kind: 'typing', prompt: 'x', options: ['a'] };`,
        },
        { name: 'describeExercise returns a string', code: `const s: string = describeExercise({ kind: 'typing', prompt: 'p', answer: 'a' });` },
      ],
    },
    {
      id: 'f3-groupBy',
      title: 'A generic groupBy',
      lesson: 11,
      language: 'ts',
      exports: ['groupBy'],
      setup: `const words = [
  { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals' },
  { id: 'w2', term: 'Brot', translation: 'bread', category: 'food' },
  { id: 'w3', term: 'Katze', translation: 'cat', category: 'animals' },
];`,
      prompt: md(
        'Write a **generic** function `groupBy(items, getKey)` that groups any kind of item. `getKey` receives an item and returns a string key. The result is `Record<string, T[]>`, keeping the original order inside each group.',
        '',
        '```ts',
        'groupBy(words, (w) => w.category)',
        "// { animals: [Hund, Katze], food: [Brot] }",
        '```',
        '',
        'The `VocabularyWord` interface is provided for the tests. The result type must keep the item type (not `any`).',
      ),
      starter: `${WORD}
function groupBy(items: any[], getKey: (item: any) => any): any {
  return {};
}
`,
      solution: `${WORD}
function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
  }
  return groups;
}
`,
      tests: [
        { name: 'Groups by the key', code: `const g = groupBy(words, (w) => w.category); expect(g.animals.map((w) => w.id)).toEqual(['w1', 'w3']); expect(g.food.map((w) => w.id)).toEqual(['w2']);` },
        { name: 'Works with other item types', hidden: true, code: `expect(groupBy([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'even' : 'odd'))).toEqual({ odd: [1, 3], even: [2, 4] });` },
        { name: 'Empty list → {}', hidden: true, code: `expect(groupBy([], (x) => String(x))).toEqual({});` },
      ],
      typeTests: [
        { name: 'Keeps the item type', code: `const ws: VocabularyWord[] = [];\nconst g = groupBy(ws, (w) => w.category);\nconst first: VocabularyWord | undefined = g['food']?.[0];` },
        {
          name: 'The result is not any',
          hidden: true,
          hint: 'The result of groupBy can be assigned to number[], so it is still any.',
          code: `const ws: VocabularyWord[] = [];
const g = groupBy(ws, (w) => w.category);
// @ts-expect-error
const wrong: number[] = g['food'];`,
        },
        {
          name: 'The key must be a string',
          hidden: true,
          hint: 'getKey may return a number. It should return a string.',
          code: `const ws: VocabularyWord[] = [];
// @ts-expect-error
groupBy(ws, (w) => w.term.length);`,
        },
        {
          name: 'getKey receives the item type',
          hidden: true,
          hint: 'Inside getKey, the item is any. Use the type parameter T.',
          code: `const ws: VocabularyWord[] = [];
// @ts-expect-error
groupBy(ws, (w) => w.nope);`,
        },
      ],
    },
  ],
};
