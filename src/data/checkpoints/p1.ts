import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const WORDS = `const words = [
  { term: 'Hund', translation: 'dog', category: 'animals', mastered: true },
  { term: 'Katze', translation: 'cat', category: 'animals', mastered: false },
  { term: 'Brot', translation: 'bread', category: 'food', mastered: true },
  { term: 'Apfel', translation: 'apple', category: 'food', mastered: false },
];
const snapshot = JSON.stringify(words);`;

export const p1: Checkpoint = {
  phaseId: 'p1',
  questions: [
    {
      id: 'p1-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Which keyword should you use for a variable that will never be reassigned?',
      options: ['const', 'let', 'var', 'static'],
      answer: 0,
      explanation: 'Use `const` by default and `let` only when you need to reassign. `var` is the old keyword with confusing scoping rules.',
    },
    {
      id: 'p1-q2',
      lesson: 1,
      kind: 'single',
      prompt: md('What happens when this runs?', '```js', "const word = 'Hund';", "word = 'Katze';", '```'),
      options: ['TypeError: Assignment to constant variable', "word becomes 'Katze'", "word stays 'Hund' silently", 'It prints both words'],
      answer: 0,
      explanation: 'A `const` binding cannot be reassigned. JavaScript throws a TypeError at the second line.',
    },
    {
      id: 'p1-q3',
      lesson: 7,
      kind: 'single',
      prompt: md('What happens when this runs?', '```js', "const word = { term: 'Hund' };", "word.term = 'Katze';", '```'),
      options: [
        "It works: const stops you reassigning the variable, not changing the object's properties",
        'TypeError: Assignment to constant variable',
        'It creates a second object',
        'It silently does nothing',
      ],
      answer: 0,
      explanation: '`const` protects the variable binding. The object it points to can still be modified.',
    },
    {
      id: 'p1-q4',
      lesson: 2,
      kind: 'text',
      prompt: 'What does `typeof 42` return?',
      accept: ['number'],
      explanation: '`typeof` returns a string naming the type: "number".',
    },
    {
      id: 'p1-q5',
      lesson: 2,
      kind: 'single',
      prompt: 'What does `typeof null` return?',
      options: ['"object"', '"null"', '"undefined"', '"boolean"'],
      answer: 0,
      explanation: 'A famous historical bug in JavaScript: `typeof null` is "object". To check for null, use `value === null`.',
    },
    {
      id: 'p1-q6',
      lesson: 3,
      kind: 'single',
      prompt: "What is the result of `5 === '5'`?",
      options: ['false', 'true', 'TypeError', 'undefined'],
      answer: 0,
      explanation: '`===` compares both value and type. A number is never strictly equal to a string.',
    },
    {
      id: 'p1-q7',
      lesson: 3,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'console.log(10 % 3);', '```'),
      accept: ['1'],
      explanation: '`%` is the remainder operator. 10 divided by 3 is 3, remainder 1.',
    },
    {
      id: 'p1-q8',
      lesson: 4,
      kind: 'single',
      prompt: 'Which of these values is truthy?',
      options: ["'0' (a string)", '0', "'' (an empty string)", 'null'],
      answer: 0,
      explanation: 'Every non-empty string is truthy, even "0". The falsy values are false, 0, "", null, undefined and NaN.',
    },
    {
      id: 'p1-q9',
      lesson: 5,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'function greet(name) {', "  return 'Hi ' + name;", '}', "const result = greet('Lyra');", 'console.log(result.length);', '```'),
      accept: ['7'],
      explanation: 'The function returns "Hi Lyra", which has 7 characters (including the space).',
    },
    {
      id: 'p1-q10',
      lesson: 6,
      kind: 'single',
      prompt: md('What is the value of the last expression?', '```js', "const words = ['a', 'b', 'c'];", 'words[words.length - 1];', '```'),
      options: ["'c'", 'undefined', "'b'", '3'],
      answer: 0,
      explanation: 'Indexes start at 0, so the last item is at `length - 1`, which is 2.',
    },
    {
      id: 'p1-q11',
      lesson: 8,
      kind: 'text',
      prompt: md('How many times does the loop body run?', '```js', 'for (let i = 0; i < 5; i++) {', '  console.log(i);', '}', '```'),
      accept: ['5', 'five'],
      explanation: 'It runs for i = 0, 1, 2, 3 and 4: five times. When i becomes 5 the condition is false.',
    },
    {
      id: 'p1-q12',
      lesson: 9,
      kind: 'text',
      prompt: md('What is the result? Write it as an array.', '```js', '[1, 2, 3, 4].filter((n) => n % 2 === 0).map((n) => n * 10);', '```'),
      accept: ['[20, 40]', '[20,40]'],
      explanation: '`filter` keeps 2 and 4, then `map` multiplies each by 10.',
    },
    {
      id: 'p1-q13',
      lesson: 9,
      kind: 'text',
      prompt: md('What is the result?', '```js', '[2, 3, 4].reduce((sum, n) => sum + n, 0);', '```'),
      accept: ['9'],
      explanation: '`reduce` starts with 0 and adds each number: 0 + 2 + 3 + 4 = 9.',
    },
    {
      id: 'p1-q14',
      lesson: 9,
      kind: 'single',
      prompt: 'What is the main difference between `map` and `forEach`?',
      options: [
        '`map` returns a new array of transformed values; `forEach` returns undefined',
        '`forEach` is faster and returns a new array',
        '`map` changes the original array in place',
        'There is no difference',
      ],
      answer: 0,
      explanation: 'Use `map` when you want a new array, and `forEach` only for side effects such as logging.',
    },
    {
      id: 'p1-q15',
      lesson: 10,
      kind: 'text',
      prompt: md(
        'What does this print?',
        '```js',
        'function makeCounter() {',
        '  let count = 0;',
        '  return () => {',
        '    count = count + 1;',
        '    return count;',
        '  };',
        '}',
        'const next = makeCounter();',
        'next();',
        'next();',
        'console.log(next());',
        '```',
      ),
      accept: ['3'],
      explanation: 'The inner function "closes over" `count`, so the variable survives between calls: 1, 2, then 3.',
    },
  ],
  problems: [
    {
      id: 'p1-createWord',
      title: 'Create a vocabulary word',
      lesson: 7,
      language: 'js',
      exports: ['createWord'],
      prompt: md(
        'Write a function `createWord(term, translation, category)` that returns a new **object** with four properties:',
        '- `term`, `translation` and `category`: the values passed in',
        '- `mastered`: always `false` for a new word',
        '',
        "Example: `createWord('Hund', 'dog', 'animals')` returns `{ term: 'Hund', translation: 'dog', category: 'animals', mastered: false }`.",
      ),
      starter: `function createWord(term, translation, category) {
  // Return a new object here
}
`,
      solution: `function createWord(term, translation, category) {
  return { term, translation, category, mastered: false };
}
`,
      tests: [
        { name: 'Returns an object with all four properties', code: `expect(createWord('Hund', 'dog', 'animals')).toEqual({ term: 'Hund', translation: 'dog', category: 'animals', mastered: false });` },
        { name: 'Works with other values', code: `expect(createWord('Brot', 'bread', 'food')).toEqual({ term: 'Brot', translation: 'bread', category: 'food', mastered: false });` },
        { name: 'Returns a new object on every call', code: `const a = createWord('Hund', 'dog', 'animals'); const b = createWord('Hund', 'dog', 'animals'); expect(a === b).toBe(false);` },
      ],
      hints: ['Use `return { ... }` with the property names.', 'Shorthand works: `{ term }` is the same as `{ term: term }`.'],
    },
    {
      id: 'p1-filterByCategory',
      title: 'Filter vocabulary by category',
      lesson: 9,
      language: 'js',
      exports: ['filterByCategory'],
      setup: WORDS,
      prompt: md(
        'Write `filterByCategory(words, category)` that returns a **new array** containing only the words whose `category` equals the given category.',
        '',
        '- Do not change the original array.',
        '- If no word matches, return an empty array.',
        '',
        'Each word looks like `{ term, translation, category, mastered }`.',
      ),
      starter: `function filterByCategory(words, category) {
  // Return only the words in the given category
}
`,
      solution: `function filterByCategory(words, category) {
  return words.filter((word) => word.category === category);
}
`,
      tests: [
        { name: 'Returns the animals', code: `expect(filterByCategory(words, 'animals').map((w) => w.term)).toEqual(['Hund', 'Katze']);` },
        { name: 'Returns the food', code: `expect(filterByCategory(words, 'food').map((w) => w.term)).toEqual(['Brot', 'Apfel']);` },
        { name: 'Returns [] when nothing matches', code: `expect(filterByCategory(words, 'colors')).toEqual([]);` },
        { name: 'Does not change the original array', code: `filterByCategory(words, 'food'); expect(JSON.stringify(words)).toBe(snapshot);` },
      ],
      hints: ['Arrays have a method that keeps only the items for which a function returns true.'],
    },
    {
      id: 'p1-markMastered',
      title: 'Mark a word as mastered',
      lesson: 9,
      language: 'js',
      exports: ['markMastered'],
      setup: WORDS,
      prompt: md(
        'Write `markMastered(words, term)` that returns a **new array** where the word with that `term` has `mastered: true`.',
        '',
        '- All other words stay exactly the same.',
        '- **Do not modify** the original array or the original word objects (create a new object for the changed word).',
        '- If no word has that term, return a copy with nothing changed.',
      ),
      starter: `function markMastered(words, term) {
  for (const word of words) {
    if (word.term === term) {
      word.mastered = true;
    }
  }
  return words;
}
`,
      solution: `function markMastered(words, term) {
  return words.map((word) => (word.term === term ? { ...word, mastered: true } : word));
}
`,
      tests: [
        { name: 'Marks the matching word', code: `const result = markMastered(words, 'Katze'); expect(result.find((w) => w.term === 'Katze').mastered).toBe(true);` },
        { name: 'Leaves other words unchanged', code: `const result = markMastered(words, 'Katze'); expect(result.find((w) => w.term === 'Apfel').mastered).toBe(false); expect(result).toHaveLength(4);` },
        { name: 'Does not modify the original array or objects', code: `markMastered(words, 'Katze'); expect(JSON.stringify(words)).toBe(snapshot);` },
        { name: 'Returns a new array', code: `expect(markMastered(words, 'Katze') === words).toBe(false);` },
        { name: 'Unknown term: nothing changes', code: `expect(markMastered(words, 'Haus')).toEqual(words);` },
      ],
      hints: [
        'The starter code works, but it changes the original objects. That is the bug to fix.',
        '`map` returns a new array. For the matching word, return a new object: `{ ...word, mastered: true }`.',
      ],
    },
    {
      id: 'p1-masteredPercentage',
      title: 'Percentage of mastered words',
      lesson: 9,
      language: 'js',
      exports: ['masteredPercentage'],
      setup: WORDS,
      prompt: md(
        'Write `masteredPercentage(words)` that returns the percentage of words with `mastered: true`, **rounded to the nearest whole number**.',
        '',
        '- 2 mastered out of 4 → `50`',
        '- 1 mastered out of 3 → `33`',
        '- An empty list → `0` (not NaN)',
      ),
      starter: `function masteredPercentage(words) {
  const mastered = words.filter((word) => word.mastered).length;
  return (mastered / words.length) * 100;
}
`,
      solution: `function masteredPercentage(words) {
  if (words.length === 0) return 0;
  const mastered = words.filter((word) => word.mastered).length;
  return Math.round((mastered / words.length) * 100);
}
`,
      tests: [
        { name: '2 of 4 mastered → 50', code: `expect(masteredPercentage(words)).toBe(50);` },
        { name: '1 of 3 mastered → 33', code: `expect(masteredPercentage(words.slice(1))).toBe(33);` },
        { name: '2 of 3 mastered → 67', code: `expect(masteredPercentage([words[0], words[1], words[2]])).toBe(67);` },
        { name: 'Empty list → 0', code: `expect(masteredPercentage([])).toBe(0);` },
      ],
      hints: ['What is 0 / 0 in JavaScript? Handle the empty list first.', '`Math.round` rounds to the nearest whole number.'],
    },
    {
      id: 'p1-summarize',
      title: 'Summarize a vocabulary list',
      lesson: 8,
      language: 'js',
      exports: ['summarize'],
      setup: WORDS,
      prompt: md(
        'Write `summarize(words)` that returns an object with:',
        '- `total`: the number of words',
        '- `mastered`: how many have `mastered: true`',
        '- `byCategory`: an object counting the words in each category',
        '',
        'For the 4 test words (2 animals, 2 food, 2 mastered) the result is:',
        '```js',
        '{ total: 4, mastered: 2, byCategory: { animals: 2, food: 2 } }',
        '```',
        'An empty list gives `{ total: 0, mastered: 0, byCategory: {} }`.',
      ),
      starter: `function summarize(words) {
  const summary = { total: 0, mastered: 0, byCategory: {} };
  // Loop over the words and fill in the summary
  return summary;
}
`,
      solution: `function summarize(words) {
  const summary = { total: 0, mastered: 0, byCategory: {} };
  for (const word of words) {
    summary.total += 1;
    if (word.mastered) summary.mastered += 1;
    summary.byCategory[word.category] = (summary.byCategory[word.category] || 0) + 1;
  }
  return summary;
}
`,
      tests: [
        { name: 'Summarizes the 4 words', code: `expect(summarize(words)).toEqual({ total: 4, mastered: 2, byCategory: { animals: 2, food: 2 } });` },
        { name: 'Counts an uneven list', code: `expect(summarize(words.slice(0, 3))).toEqual({ total: 3, mastered: 2, byCategory: { animals: 2, food: 1 } });` },
        { name: 'Empty list', code: `expect(summarize([])).toEqual({ total: 0, mastered: 0, byCategory: {} });` },
      ],
      hints: [
        'A `for...of` loop visits each word.',
        'For the category count, read the current value (or 0 if it does not exist yet) and add 1: `counts[key] = (counts[key] || 0) + 1`.',
      ],
    },
  ],
};
