import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const WORD_INTERFACE = `interface VocabularyWord {
  id: string;
  term: string;
  translation: string;
  category: string;
  mastered: boolean;
}
`;

const WORDS = `const words = [
  { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals', mastered: true },
  { id: 'w2', term: 'Katze', translation: 'cat', category: 'animals', mastered: false },
  { id: 'w3', term: 'Brot', translation: 'bread', category: 'food', mastered: true },
];`;

export const p3: Checkpoint = {
  phaseId: 'p3',
  questions: [
    {
      id: 'p3-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'When are TypeScript type errors reported?',
      options: [
        'Before the code runs: in the editor and when the compiler checks it. Types are removed from the JavaScript that actually runs',
        'Only when the app crashes at runtime',
        'Only on the user’s phone',
        'TypeScript checks types while the program runs',
      ],
      answer: 0,
      explanation: 'TypeScript is a checker that runs before your code. The output is plain JavaScript with no types at all.',
    },
    {
      id: 'p3-q2',
      lesson: 3,
      kind: 'single',
      prompt: 'What type does TypeScript infer for `let count = 5;`?',
      options: ['number', '5', 'any', 'unknown'],
      answer: 0,
      explanation: 'A `let` can be reassigned, so TypeScript widens the value 5 to the general type `number`.',
    },
    {
      id: 'p3-q3',
      lesson: 3,
      kind: 'single',
      prompt: "What type does TypeScript infer for `const level = 'beginner';`?",
      options: ["The literal type 'beginner'", 'string', 'any', 'Level'],
      answer: 0,
      explanation: 'A `const` can never change, so TypeScript keeps the exact literal type `"beginner"`.',
    },
    {
      id: 'p3-q4',
      lesson: 2,
      kind: 'single',
      prompt: 'Why should you avoid `any`?',
      options: ['It switches off type checking for that value, so mistakes slip through', 'It makes the app slower', 'It is not valid TypeScript', 'It only works with numbers'],
      answer: 0,
      explanation: 'With `any`, TypeScript lets you do anything with the value, which defeats the point. Prefer a real type, or `unknown` when you truly do not know.',
    },
    {
      id: 'p3-q5',
      lesson: 2,
      kind: 'single',
      prompt: 'What is the difference between `unknown` and `any`?',
      options: [
        'You must check (narrow) an `unknown` value before using it; `any` lets you use it without checks',
        'They are identical',
        '`unknown` only works with strings',
        '`any` is safer than `unknown`',
      ],
      answer: 0,
      explanation: '`unknown` is the safe choice for data from outside (like `JSON.parse`): TypeScript forces you to check it first.',
    },
    {
      id: 'p3-q6',
      lesson: 5,
      kind: 'multi',
      prompt: 'Which are valid ways to write the type "array of strings"? (Select all that apply.)',
      options: ['string[]', 'Array<string>', '[string]', 'Array(string)'],
      answers: [0, 1],
      explanation: '`string[]` and `Array<string>` are the same type. `[string]` is a tuple with exactly one string, and `Array(string)` is not a type.',
    },
    {
      id: 'p3-q7',
      lesson: 9,
      kind: 'single',
      prompt: md('Given:', '```ts', 'interface User {', '  name: string;', '  email?: string;', '}', '```', 'What is the type of `user.email`?'),
      options: ['string | undefined', 'string', 'undefined', 'any'],
      answer: 0,
      explanation: 'An optional property may be missing, so its type includes `undefined`. You must handle that case before using it as a string.',
    },
    {
      id: 'p3-q8',
      lesson: 8,
      kind: 'single',
      prompt: md('Why does TypeScript reject this?', '```ts', 'function shout(value: string | number) {', '  return value.toUpperCase();', '}', '```'),
      options: [
        '`toUpperCase` does not exist on `number`; you must narrow the union first, for example with `typeof value === "string"`',
        'Functions cannot take union types',
        'It is valid and compiles',
        'Return types are required',
      ],
      answer: 0,
      explanation: 'With a union you can only use what all members share. After a `typeof` check, TypeScript knows which type you have.',
    },
    {
      id: 'p3-q9',
      lesson: 7,
      kind: 'single',
      prompt: 'What can a `type` alias do that an `interface` cannot?',
      options: [
        "Name a union of other types, like `type Level = 'beginner' | 'advanced'`",
        'Describe the shape of an object',
        'Have optional properties',
        'Be exported',
      ],
      answer: 0,
      explanation: 'Interfaces describe object shapes. Type aliases can name any type, including unions, primitives and tuples.',
    },
    {
      id: 'p3-q10',
      lesson: 11,
      kind: 'single',
      prompt: md('Given:', '```ts', 'function first<T>(items: T[]): T | undefined {', '  return items[0];', '}', "const result = first(['a', 'b']);", '```', 'What is the type of `result`?'),
      options: ['string | undefined', 'T', 'any', 'string[]'],
      answer: 0,
      explanation: 'TypeScript infers `T = string` from the argument, so the return type becomes `string | undefined`.',
    },
    {
      id: 'p3-q11',
      lesson: 12,
      kind: 'single',
      prompt: "What does `import type { VocabularyWord } from './types';` do?",
      options: [
        'Imports only the type; it is erased from the compiled JavaScript',
        'Imports the type and creates a runtime value',
        'Copies the file into the current one',
        'It is not valid syntax',
      ],
      answer: 0,
      explanation: '`import type` makes it clear that nothing from that file is needed at runtime.',
    },
    {
      id: 'p3-q12',
      lesson: 10,
      kind: 'single',
      prompt: 'In strict mode, what is wrong with `function total(words) { return words.length; }`?',
      options: [
        'The parameter `words` implicitly has type `any`; it needs a type annotation',
        'Functions must use arrow syntax',
        'You cannot read `.length` in TypeScript',
        'Nothing; it compiles in strict mode',
      ],
      answer: 0,
      explanation: 'Strict mode turns on `noImplicitAny`. TypeScript cannot infer parameter types from the body, so you must annotate them.',
    },
  ],
  problems: [
    {
      id: 'p3-vocabularyWord',
      title: 'The VocabularyWord interface',
      lesson: 6,
      language: 'ts',
      prompt: md(
        'Define an **interface** named `VocabularyWord` with these properties:',
        '- `id`: string',
        '- `term`: string',
        '- `translation`: string',
        '- `category`: string',
        '- `mastered`: boolean',
        '- `example`: an **optional** string',
        '',
        'The tests check that correct words are accepted **and** that wrong ones are rejected by the compiler.',
      ),
      starter: `interface VocabularyWord {
  // Add the properties here
}
`,
      solution: `interface VocabularyWord {
  id: string;
  term: string;
  translation: string;
  category: string;
  mastered: boolean;
  example?: string;
}
`,
      tests: [],
      typeTests: [
        { name: 'A complete word is accepted', code: `const w: VocabularyWord = { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals', mastered: false };` },
        { name: 'example can be set', code: `const w: VocabularyWord = { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals', mastered: false, example: 'Der Hund bellt.' };` },
        {
          name: 'mastered must be a boolean',
          hint: "Your interface accepts mastered: 'yes'. It should only accept true or false.",
          code: `// @ts-expect-error
const w: VocabularyWord = { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals', mastered: 'yes' };`,
        },
        {
          name: 'translation is required',
          hint: 'Your interface accepts a word without a translation. It should be required.',
          code: `// @ts-expect-error
const w: VocabularyWord = { id: 'w1', term: 'Hund', category: 'animals', mastered: false };`,
        },
        {
          name: 'example must be a string',
          hint: 'Your interface accepts example: 42. It should be a string.',
          code: `// @ts-expect-error
const w: VocabularyWord = { id: 'w1', term: 'Hund', translation: 'dog', category: 'animals', mastered: false, example: 42 };`,
        },
        {
          name: 'id must be a string',
          hint: 'Your interface accepts a numeric id.',
          code: `// @ts-expect-error
const w: VocabularyWord = { id: 1, term: 'Hund', translation: 'dog', category: 'animals', mastered: false };`,
        },
      ],
      hints: ['Each property is `name: type;`.', 'An optional property has a `?` after its name: `example?: string;`.'],
    },
    {
      id: 'p3-session',
      title: 'Union types and a LearningSession type',
      lesson: 8,
      language: 'ts',
      prompt: md(
        'Define two type aliases:',
        '',
        "1. `Difficulty`: a **union** of exactly `'beginner'`, `'intermediate'` and `'advanced'`.",
        '2. `LearningSession`: an object type with',
        '   - `id`: string',
        '   - `startedAt`: Date',
        '   - `difficulty`: Difficulty',
        '   - `wordIds`: an array of strings',
        '   - `finishedAt`: an **optional** Date',
      ),
      starter: `type Difficulty = string;

type LearningSession = {
  id: string;
};
`,
      solution: `type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type LearningSession = {
  id: string;
  startedAt: Date;
  difficulty: Difficulty;
  wordIds: string[];
  finishedAt?: Date;
};
`,
      tests: [],
      typeTests: [
        { name: 'All three difficulties are accepted', code: `const all: Difficulty[] = ['beginner', 'intermediate', 'advanced'];` },
        {
          name: 'Other difficulties are rejected',
          hint: "Difficulty accepts 'expert'. It should only allow the three listed values.",
          code: `// @ts-expect-error
const d: Difficulty = 'expert';`,
        },
        { name: 'A valid session is accepted', code: `const s: LearningSession = { id: 's1', startedAt: new Date(), difficulty: 'beginner', wordIds: ['w1', 'w2'] };` },
        { name: 'finishedAt can be set', code: `const s: LearningSession = { id: 's1', startedAt: new Date(), difficulty: 'advanced', wordIds: [], finishedAt: new Date() };` },
        {
          name: 'The session difficulty uses the union',
          hint: "LearningSession accepts difficulty: 'easy'.",
          code: `// @ts-expect-error
const s: LearningSession = { id: 's1', startedAt: new Date(), difficulty: 'easy', wordIds: [] };`,
        },
        {
          name: 'wordIds must be strings',
          hint: 'LearningSession accepts wordIds: [1, 2].',
          code: `// @ts-expect-error
const s: LearningSession = { id: 's1', startedAt: new Date(), difficulty: 'beginner', wordIds: [1, 2] };`,
        },
        {
          name: 'startedAt must be a Date',
          hint: 'LearningSession accepts a string for startedAt.',
          code: `// @ts-expect-error
const s: LearningSession = { id: 's1', startedAt: '2026-01-01', difficulty: 'beginner', wordIds: [] };`,
        },
      ],
      hints: ["A union is written with `|`: `type A = 'x' | 'y';`.", 'You can use one type alias inside another.'],
    },
    {
      id: 'p3-typedFunctions',
      title: 'Typed functions',
      lesson: 10,
      language: 'ts',
      exports: ['masteredPercentage', 'groupByCategory'],
      setup: WORDS,
      prompt: md(
        'The `VocabularyWord` interface is already defined. Complete the two functions **with type annotations** on the parameters and return values:',
        '',
        '1. `masteredPercentage(words)`: returns the rounded percentage of mastered words (0 for an empty list).',
        '2. `groupByCategory(words)`: returns an object whose keys are categories and whose values are arrays of the words in that category. Its return type is `Record<string, VocabularyWord[]>`.',
        '',
        'The code must pass TypeScript **strict mode**, so parameters cannot be left without a type.',
      ),
      starter: `${WORD_INTERFACE}
function masteredPercentage(words) {
  if (words.length === 0) return 0;
  return Math.round((words.filter((w) => w.mastered).length / words.length) * 100);
}

function groupByCategory(words) {
  const groups = {};
  for (const word of words) {
    groups[word.category] = [...(groups[word.category] ?? []), word];
  }
  return groups;
}
`,
      solution: `${WORD_INTERFACE}
function masteredPercentage(words: VocabularyWord[]): number {
  if (words.length === 0) return 0;
  return Math.round((words.filter((w) => w.mastered).length / words.length) * 100);
}

function groupByCategory(words: VocabularyWord[]): Record<string, VocabularyWord[]> {
  const groups: Record<string, VocabularyWord[]> = {};
  for (const word of words) {
    groups[word.category] = [...(groups[word.category] ?? []), word];
  }
  return groups;
}
`,
      tests: [
        { name: 'masteredPercentage: 2 of 3 → 67', code: `expect(masteredPercentage(words)).toBe(67);` },
        { name: 'masteredPercentage: empty → 0', code: `expect(masteredPercentage([])).toBe(0);` },
        { name: 'groupByCategory groups the words', code: `const g = groupByCategory(words); expect(Object.keys(g).sort()).toEqual(['animals', 'food']); expect(g.animals.map((w) => w.id)).toEqual(['w1', 'w2']); expect(g.food.map((w) => w.id)).toEqual(['w3']);` },
      ],
      typeTests: [
        { name: 'masteredPercentage returns a number', code: `const p: number = masteredPercentage([]);` },
        {
          name: 'masteredPercentage only accepts words',
          hint: "masteredPercentage(['Hund']) is accepted. Annotate the parameter as VocabularyWord[].",
          code: `// @ts-expect-error
masteredPercentage(['Hund']);`,
        },
        { name: 'groupByCategory returns Record<string, VocabularyWord[]>', code: `const g: Record<string, VocabularyWord[]> = groupByCategory([]);` },
        {
          name: 'groupByCategory has a precise return type',
          hint: 'The result of groupByCategory can be assigned to a string, so its return type is too loose (any?).',
          code: `// @ts-expect-error
const wrong: string = groupByCategory([]);`,
        },
      ],
      hints: ['Annotate parameters with `name: Type` and the return type after the parentheses: `function f(x: number): string`.', 'Give the `groups` object a type too, otherwise it is `{}` and you cannot index it.'],
    },
    {
      id: 'p3-generics',
      title: 'Generic helpers',
      lesson: 11,
      language: 'ts',
      exports: ['firstOrDefault', 'pluck'],
      setup: WORDS,
      prompt: md(
        'Rewrite the two helpers as **generic** functions so they keep the real types instead of `any`:',
        '',
        '1. `firstOrDefault(items, fallback)`: returns the first item, or `fallback` if the array is empty. Items and fallback have the same type `T`.',
        '2. `pluck(items, key)`: returns an array with the value of `key` from each item. `key` must be a real property name of the items, and the result type must match that property (for example `string[]` for `term`).',
        '',
        'Hint for `pluck`: `K extends keyof T` and the type `T[K]`.',
      ),
      starter: `${WORD_INTERFACE}
function firstOrDefault(items: any[], fallback: any): any {
  return items.length > 0 ? items[0] : fallback;
}

function pluck(items: any[], key: string): any[] {
  return items.map((item) => item[key]);
}
`,
      solution: `${WORD_INTERFACE}
function firstOrDefault<T>(items: T[], fallback: T): T {
  return items.length > 0 ? items[0] : fallback;
}

function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}
`,
      tests: [
        { name: 'firstOrDefault returns the first item', code: `expect(firstOrDefault([3, 4], 0)).toBe(3);` },
        { name: 'firstOrDefault returns the fallback for []', code: `expect(firstOrDefault([], 'none')).toBe('none');` },
        { name: 'pluck reads the property', code: `expect(pluck(words, 'term')).toEqual(['Hund', 'Katze', 'Brot']);` },
      ],
      typeTests: [
        { name: 'firstOrDefault keeps the element type', code: `const s: string = firstOrDefault(['a'], 'z');\nconst n: number = firstOrDefault([1, 2], 0);` },
        {
          name: 'firstOrDefault result is not any',
          hint: 'firstOrDefault([1, 2], 0) can be assigned to a string, so it still returns any.',
          code: `// @ts-expect-error
const wrong: string = firstOrDefault([1, 2], 0);`,
        },
        {
          name: 'items and fallback must share a type',
          hint: "firstOrDefault([1, 2], 'x') is accepted. Use one type parameter for both.",
          code: `// @ts-expect-error
firstOrDefault([1, 2], 'x');`,
        },
        { name: 'pluck returns the property type', code: `const ws: VocabularyWord[] = [];\nconst terms: string[] = pluck(ws, 'term');\nconst flags: boolean[] = pluck(ws, 'mastered');` },
        {
          name: 'pluck rejects unknown keys',
          hint: "pluck(words, 'nope') is accepted. The key should be limited to keyof T.",
          code: `const ws: VocabularyWord[] = [];
// @ts-expect-error
pluck(ws, 'nope');`,
        },
        {
          name: 'pluck result matches the key',
          hint: "pluck(words, 'term') can be assigned to number[]. Use T[K][] as the return type.",
          code: `const ws: VocabularyWord[] = [];
// @ts-expect-error
const wrong: number[] = pluck(ws, 'term');`,
        },
      ],
      hints: ['A generic function declares its type parameter in angle brackets: `function f<T>(x: T): T`.', '`keyof T` is the union of property names of T, and `T[K]` is the type of property K.'],
    },
  ],
};
