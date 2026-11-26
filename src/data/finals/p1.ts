import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final1: FinalExam = {
  phaseId: 'p1',
  minutes: 60,
  questions: [
    {
      id: 'f1-q1',
      lesson: 3,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'let x = 5;', 'x += 2;', 'x *= 3;', 'console.log(x);', '```'),
      accept: ['21'],
      explanation: 'x becomes 7, then 7 × 3 = 21.',
    },
    {
      id: 'f1-q2',
      lesson: 3,
      kind: 'single',
      prompt: "What is the result of `'5' + 3`?",
      options: ["'53' (a string)", '8', 'NaN', 'TypeError'],
      answer: 0,
      explanation: 'With a string involved, `+` concatenates. Other operators like `-` convert to numbers instead.',
    },
    {
      id: 'f1-q3',
      lesson: 3,
      kind: 'text',
      prompt: "What is the result of `'5' - 3`?",
      accept: ['2'],
      explanation: '`-` only works with numbers, so JavaScript converts "5" to 5.',
    },
    {
      id: 'f1-q4',
      lesson: 2,
      kind: 'single',
      prompt: md('What does this print?', '```js', 'let total;', 'console.log(total);', '```'),
      options: ['undefined', 'null', '0', 'ReferenceError'],
      answer: 0,
      explanation: 'A declared variable without a value is `undefined`. `null` is only ever assigned on purpose.',
    },
    {
      id: 'f1-q5',
      lesson: 5,
      kind: 'single',
      prompt: md('What does `add(2, 3)` return?', '```js', 'function add(a, b) {', '  a + b;', '}', '```'),
      options: ['undefined, because there is no return statement', '5', 'NaN', 'An error'],
      answer: 0,
      explanation: 'A function returns `undefined` unless it uses `return`. Arrow functions without braces return implicitly; normal functions never do.',
    },
    {
      id: 'f1-q6',
      lesson: 10,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'let x = 1;', 'if (true) {', '  let x = 2;', '}', 'console.log(x);', '```'),
      accept: ['1'],
      explanation: 'The inner `let x` is a different variable that only exists inside the block.',
    },
    {
      id: 'f1-q7',
      lesson: 7,
      kind: 'single',
      prompt: md('What does this print?', '```js', "const word = { term: 'Hund' };", 'console.log(word.translation);', '```'),
      options: ['undefined', 'null', "''", 'TypeError'],
      answer: 0,
      explanation: 'Reading a property that does not exist gives `undefined`. Reading a property of `undefined` (like `word.foo.bar`) is what throws.',
    },
    {
      id: 'f1-q8',
      lesson: 9,
      kind: 'text',
      prompt: md('What is the result? Write it as an array.', '```js', '[1, 2, 3].map((n) => n * n);', '```'),
      accept: ['[1, 4, 9]', '[1,4,9]'],
      explanation: '`map` applies the function to each item and returns a new array.',
    },
    {
      id: 'f1-q9',
      lesson: 9,
      kind: 'single',
      prompt: 'What is the result of `[3, 1, 10].sort()`?',
      options: ['[1, 10, 3]', '[1, 3, 10]', '[10, 3, 1]', '[3, 1, 10]'],
      answer: 0,
      explanation: 'Without a compare function, `sort` compares items as strings ("10" < "3"). For numbers use `sort((a, b) => a - b)`. It also changes the original array.',
    },
    {
      id: 'f1-q10',
      lesson: 9,
      kind: 'text',
      prompt: md('What is the result?', '```js', "['Hund', 'Katze', 'Kuh'].find((w) => w.startsWith('K'));", '```'),
      accept: ['Katze'],
      explanation: '`find` returns the first matching item, not all of them (that would be `filter`).',
    },
    {
      id: 'f1-q11',
      lesson: 6,
      kind: 'text',
      prompt: "What is the result of `['a', 'b', 'c'].indexOf('c')`?",
      accept: ['2'],
      explanation: 'Indexes start at 0. `indexOf` returns -1 when the item is not found.',
    },
  ],
  problems: [
    {
      id: 'f1-groupByLetter',
      title: 'Group words by first letter',
      lesson: 7,
      language: 'js',
      exports: ['groupByFirstLetter'],
      prompt: md(
        'Write `groupByFirstLetter(terms)` that receives an array of strings and returns an object whose keys are the **uppercase** first letter and whose values are arrays of the terms starting with that letter, in their original order.',
        '',
        "Example: `groupByFirstLetter(['Hund', 'haus', 'Katze'])` returns `{ H: ['Hund', 'haus'], K: ['Katze'] }`.",
        '',
        'An empty array returns `{}`. Do not modify the input array.',
      ),
      starter: `function groupByFirstLetter(terms) {
  // Your code here
}
`,
      solution: `function groupByFirstLetter(terms) {
  const groups = {};
  for (const term of terms) {
    const letter = term[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(term);
  }
  return groups;
}
`,
      tests: [
        { name: 'Groups by first letter', code: `expect(groupByFirstLetter(['Hund', 'Katze', 'Haus'])).toEqual({ H: ['Hund', 'Haus'], K: ['Katze'] });` },
        { name: 'Lowercase words use the uppercase letter', hidden: true, code: `expect(groupByFirstLetter(['apfel', 'Ast', 'brot'])).toEqual({ A: ['apfel', 'Ast'], B: ['brot'] });` },
        { name: 'Empty list → {}', hidden: true, code: `expect(groupByFirstLetter([])).toEqual({});` },
        { name: 'Does not modify the input', hidden: true, code: `const input = ['Hund', 'Katze']; expect(groupByFirstLetter(input)).toEqual({ H: ['Hund'], K: ['Katze'] }); expect(input).toEqual(['Hund', 'Katze']);` },
      ],
    },
    {
      id: 'f1-wordsToReview',
      title: 'Pick the words to review',
      lesson: 9,
      language: 'js',
      exports: ['wordsToReview'],
      setup: `const words = [
  { term: 'Hund', mastered: true, mistakes: 0 },
  { term: 'Katze', mastered: false, mistakes: 2 },
  { term: 'Brot', mastered: false, mistakes: 5 },
  { term: 'Apfel', mastered: false, mistakes: 2 },
  { term: 'Milch', mastered: false, mistakes: 1 },
];
const snapshot = JSON.stringify(words);`,
      prompt: md(
        'Write `wordsToReview(words, maxCount)` that returns the **terms** of the words that are **not mastered**, sorted by `mistakes` from most to fewest. Words with the same number of mistakes are sorted alphabetically by term. Return at most `maxCount` terms.',
        '',
        'Do not modify the input array (careful: `sort` changes the array it is called on).',
      ),
      starter: `function wordsToReview(words, maxCount) {
  // Your code here
}
`,
      solution: `function wordsToReview(words, maxCount) {
  return words
    .filter((w) => !w.mastered)
    .sort((a, b) => b.mistakes - a.mistakes || a.term.localeCompare(b.term))
    .slice(0, maxCount)
    .map((w) => w.term);
}
`,
      tests: [
        { name: 'Most mistakes first', code: `expect(wordsToReview(words, 2)).toEqual(['Brot', 'Apfel']);` },
        { name: 'Ties are sorted alphabetically', hidden: true, code: `expect(wordsToReview(words, 4)).toEqual(['Brot', 'Apfel', 'Katze', 'Milch']);` },
        { name: 'maxCount larger than the list', hidden: true, code: `expect(wordsToReview(words, 50)).toHaveLength(4);` },
        { name: 'Mastered words are excluded', hidden: true, code: `const r = wordsToReview(words, 50); expect(r).toHaveLength(4); expect(r).not.toContain('Hund');` },
        { name: 'Does not modify the input', hidden: true, code: `expect(wordsToReview(words, 3)).toHaveLength(3); expect(JSON.stringify(words)).toBe(snapshot);` },
      ],
    },
  ],
};
