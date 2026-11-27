import type { LessonExercise } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

const FUNCTIONS_NOTE =
  'Exercises are small functions so the tests can try many inputs. You only write the body; Lesson 5 explains functions in depth.';

/** Phase 1 — JavaScript Fundamentals: a core exercise (required) and a challenge (optional) per lesson. */
export const phase1Exercises: LessonExercise[] = [
  // ---------- Lesson 1: Variables ----------
  {
    id: 'p1-l1-core',
    lessonId: 'p1-l1',
    level: 'core',
    title: 'Fix the review counter and describe progress',
    language: 'js',
    exports: ['countReviews', 'describeProgress'],
    prompt: md(
      FUNCTIONS_NOTE,
      '',
      '1. `countReviews(first, second, third)` should return the total number of words reviewed in three sessions. It crashes. Find out why and fix it.',
      '2. `describeProgress(name, reviewed, goal)` should return a sentence like:',
      '```',
      'Ana reviewed 12 of 20 words',
      '```',
      'Store the pieces in well-named variables before building the sentence.',
    ),
    starter: `function countReviews(first, second, third) {
  const total = 0;
  total = total + first;
  total = total + second;
  total = total + third;
  return total;
}

function describeProgress(name, reviewed, goal) {
  // Build and return the sentence
}
`,
    solution: `function countReviews(first, second, third) {
  let total = 0;
  total = total + first;
  total = total + second;
  total = total + third;
  return total;
}

function describeProgress(name, reviewed, goal) {
  const sentence = name + ' reviewed ' + reviewed + ' of ' + goal + ' words';
  return sentence;
}
`,
    tests: [
      { name: 'countReviews adds three sessions', code: `expect(countReviews(12, 8, 15)).toBe(35);` },
      { name: 'countReviews works with zeros', code: `expect(countReviews(0, 0, 0)).toBe(0);` },
      { name: 'describeProgress builds the sentence', code: `expect(describeProgress('Ana', 12, 20)).toBe('Ana reviewed 12 of 20 words');` },
      { name: 'describeProgress works for other learners', code: `expect(describeProgress('Ben', 0, 5)).toBe('Ben reviewed 0 of 5 words');` },
    ],
    hints: ['A `const` variable can never be reassigned. Which keyword allows it?', 'Join strings with `+`, or use a template literal: `${name} reviewed …`.'],
  },
  {
    id: 'p1-l1-challenge',
    lessonId: 'p1-l1',
    level: 'challenge',
    title: 'Make the broken profile code run',
    language: 'js',
    exports: ['buildProfile'],
    prompt: md(
      'This function has **three** separate variable mistakes. Each one stops the code from running.',
      '',
      'Fix them so `buildProfile()` returns exactly:',
      '```',
      'Hello, Ana! You are level 2.',
      '```',
      'Keep the idea of the code: the name is Ana, and the level starts at 1 and goes up by one.',
      '',
      'Work like a real developer: run the tests, read the error message, fix that one problem, and run again.',
    ),
    starter: `function buildProfile() {
  const greeting = 'Hello, ' + name;
  let name = 'Ana';
  const level = 1;
  level = level + 1;
  let level = 3;
  return greeting + '! You are level ' + level + '.';
}
`,
    solution: `function buildProfile() {
  const name = 'Ana';
  const greeting = 'Hello, ' + name;
  let level = 1;
  level = level + 1;
  return greeting + '! You are level ' + level + '.';
}
`,
    tests: [
      { name: 'Returns the right sentence', code: `expect(buildProfile()).toBe('Hello, Ana! You are level 2.');` },
      { name: 'Gives the same result every time', code: `buildProfile(); expect(buildProfile()).toBe('Hello, Ana! You are level 2.');` },
    ],
    hints: [
      'First error: you cannot declare the same variable twice with `let` in the same block.',
      'Second: a `let` variable cannot be used before the line that declares it.',
      'Third: a variable that changes cannot be `const`.',
    ],
  },

  // ---------- Lesson 2: Data types ----------
  {
    id: 'p1-l2-core',
    lessonId: 'p1-l2',
    level: 'core',
    title: 'Convert form input to real types',
    language: 'js',
    exports: ['toNumber', 'toBoolean'],
    prompt: md(
      'Everything a user types arrives as a **string**. Write two converters:',
      '',
      '1. `toNumber(raw)`: remove surrounding spaces and return the number. If the text is empty or is not a number, return `null`.',
      "   - `'  42 '` → `42`, `'3.5'` → `3.5`, `'0'` → `0`, `''` → `null`, `'abc'` → `null`",
      "2. `toBoolean(raw)`: return `true` only for `'true'`, `'yes'` or `'1'` (ignoring case and spaces), otherwise `false`.",
      '',
      "Watch out: `Boolean('false')` is `true`, and `Number('')` is `0`. You may need a simple `if` (Lesson 4).",
    ),
    starter: `function toNumber(raw) {
  return Number(raw);
}

function toBoolean(raw) {
  return Boolean(raw);
}
`,
    solution: `function toNumber(raw) {
  const text = raw.trim();
  if (text === '') return null;
  const value = Number(text);
  if (Number.isNaN(value)) return null;
  return value;
}

function toBoolean(raw) {
  const text = raw.trim().toLowerCase();
  return text === 'true' || text === 'yes' || text === '1';
}
`,
    tests: [
      { name: 'toNumber trims and converts', code: `expect(toNumber('  42 ')).toBe(42); expect(toNumber('3.5')).toBe(3.5);` },
      { name: "toNumber keeps '0' as 0", code: `expect(toNumber('0')).toBe(0);` },
      { name: 'toNumber returns null for empty text', code: `expect(toNumber('')).toBeNull(); expect(toNumber('   ')).toBeNull();` },
      { name: 'toNumber returns null for non-numbers', code: `expect(toNumber('abc')).toBeNull(); expect(toNumber('12abc')).toBeNull();` },
      { name: 'toBoolean accepts true, yes and 1', code: `expect(toBoolean('true')).toBe(true); expect(toBoolean(' YES ')).toBe(true); expect(toBoolean('1')).toBe(true);` },
      { name: "toBoolean('false') is false", code: `expect(toBoolean('false')).toBe(false); expect(toBoolean('no')).toBe(false); expect(toBoolean('')).toBe(false);` },
    ],
    hints: ['`Number.isNaN(x)` tells you whether a conversion failed.', 'Normalise first: `raw.trim().toLowerCase()`.'],
  },
  {
    id: 'p1-l2-challenge',
    lessonId: 'p1-l2',
    level: 'challenge',
    title: 'What type is it really?',
    language: 'js',
    exports: ['describeType'],
    prompt: md(
      '`typeof` has surprises: `typeof null` is `"object"`, arrays are `"object"`, and `NaN` is a `"number"`.',
      '',
      'Write `describeType(value)` that returns a more honest description:',
      "- `'null'` for `null`",
      "- `'array'` for arrays",
      "- `'NaN'` for `NaN`",
      "- `'integer'` for whole numbers and `'decimal'` for other numbers",
      '- otherwise, whatever `typeof` says',
    ),
    starter: `function describeType(value) {
  return typeof value;
}
`,
    solution: `function describeType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    return Number.isInteger(value) ? 'integer' : 'decimal';
  }
  return typeof value;
}
`,
    tests: [
      { name: 'null', code: `expect(describeType(null)).toBe('null');` },
      { name: 'arrays', code: `expect(describeType([])).toBe('array'); expect(describeType([1, 2])).toBe('array');` },
      { name: 'NaN', code: `expect(describeType(NaN)).toBe('NaN'); expect(describeType(Number('abc'))).toBe('NaN');` },
      { name: 'integers and decimals', code: `expect(describeType(5)).toBe('integer'); expect(describeType(-3)).toBe('integer'); expect(describeType(2.5)).toBe('decimal');` },
      { name: 'everything else uses typeof', code: `expect(describeType('hi')).toBe('string'); expect(describeType(true)).toBe('boolean'); expect(describeType(undefined)).toBe('undefined'); expect(describeType({})).toBe('object');` },
    ],
    hints: ['Check the special cases first, in order: null, array, number.', '`Array.isArray(value)` and `Number.isInteger(value)` exist.'],
  },

  // ---------- Lesson 3: Operators ----------
  {
    id: 'p1-l3-core',
    lessonId: 'p1-l3',
    level: 'core',
    title: 'Study session maths',
    language: 'js',
    exports: ['formatDuration', 'sessionsNeeded', 'isEven'],
    prompt: md(
      '1. `formatDuration(totalMinutes)` returns hours and minutes, like `135` → `"2h 15m"`, `45` → `"0h 45m"`, `120` → `"2h 0m"`.',
      '2. `sessionsNeeded(totalMinutes, sessionLength)` returns how many sessions are needed to cover the time. A partial session still counts: `100` minutes in `25`-minute sessions → `4`, `101` → `5`.',
      '3. `isEven(n)` returns `true` for even numbers.',
      '',
      'Use the operators from this lesson: `/`, `%`, `===` and `Math.floor` / `Math.ceil`.',
    ),
    starter: `function formatDuration(totalMinutes) {
  return totalMinutes / 60 + 'h ' + totalMinutes + 'm';
}

function sessionsNeeded(totalMinutes, sessionLength) {
  return totalMinutes / sessionLength;
}

function isEven(n) {
  // Your code here
}
`,
    solution: `function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours + 'h ' + minutes + 'm';
}

function sessionsNeeded(totalMinutes, sessionLength) {
  return Math.ceil(totalMinutes / sessionLength);
}

function isEven(n) {
  return n % 2 === 0;
}
`,
    tests: [
      { name: 'formatDuration(135)', code: `expect(formatDuration(135)).toBe('2h 15m');` },
      { name: 'formatDuration under an hour and exact hours', code: `expect(formatDuration(45)).toBe('0h 45m'); expect(formatDuration(120)).toBe('2h 0m');` },
      { name: 'sessionsNeeded rounds up', code: `expect(sessionsNeeded(100, 25)).toBe(4); expect(sessionsNeeded(101, 25)).toBe(5); expect(sessionsNeeded(0, 25)).toBe(0);` },
      { name: 'isEven', code: `expect(isEven(4)).toBe(true); expect(isEven(7)).toBe(false); expect(isEven(0)).toBe(true);` },
    ],
    hints: ['`%` gives the remainder: `135 % 60` is `15`.', '`Math.ceil` rounds up; `Math.floor` rounds down.'],
  },
  {
    id: 'p1-l3-challenge',
    lessonId: 'p1-l3',
    level: 'challenge',
    title: 'Accuracy without floating-point surprises',
    language: 'js',
    exports: ['accuracy', 'isPassing'],
    prompt: md(
      '1. `accuracy(correct, total)` returns the percentage of correct answers **rounded to one decimal**: `2` of `3` → `66.7`, `1` of `8` → `12.5`. With `0` answers it returns `0` (not `NaN`).',
      '2. `isPassing(correct, total)` returns `true` when accuracy is **at least 80** and there were **at least 5** answers.',
      '',
      'Rounding to one decimal: multiply by 10, round, divide by 10.',
    ),
    starter: `function accuracy(correct, total) {
  return (correct / total) * 100;
}

function isPassing(correct, total) {
  return correct > total * 0.8;
}
`,
    solution: `function accuracy(correct, total) {
  if (total === 0) return 0;
  return Math.round((correct / total) * 1000) / 10;
}

function isPassing(correct, total) {
  return accuracy(correct, total) >= 80 && total >= 5;
}
`,
    tests: [
      { name: 'accuracy rounds to one decimal', code: `expect(accuracy(2, 3)).toBe(66.7); expect(accuracy(1, 8)).toBe(12.5); expect(accuracy(5, 5)).toBe(100);` },
      { name: 'accuracy with no answers is 0', code: `expect(accuracy(0, 0)).toBe(0);` },
      { name: 'isPassing needs 80% or more', code: `expect(isPassing(8, 10)).toBe(true); expect(isPassing(7, 10)).toBe(false);` },
      { name: 'isPassing needs at least 5 answers', code: `expect(isPassing(4, 4)).toBe(false); expect(isPassing(5, 5)).toBe(true);` },
    ],
    hints: ['`0 / 0` is `NaN`. Handle `total === 0` first.', 'Combine two conditions with `&&`.'],
  },

  // ---------- Lesson 4: Conditionals ----------
  {
    id: 'p1-l4-core',
    lessonId: 'p1-l4',
    level: 'core',
    title: 'Rate an answer',
    language: 'js',
    exports: ['rateAnswer'],
    prompt: md(
      'Lyra rates every answer. Write `rateAnswer(correct, usedHint, seconds)` returning:',
      "- `'again'` when the answer is wrong",
      "- `'hard'` when it is correct but a hint was used **or** it took **more than 20** seconds",
      "- `'good'` when it is correct and took **more than 8** seconds",
      "- `'easy'` otherwise",
      '',
      'Pay attention to the boundaries: exactly 20 seconds is not "more than 20".',
    ),
    starter: `function rateAnswer(correct, usedHint, seconds) {
  if (correct) {
    return 'good';
  }
  return 'again';
}
`,
    solution: `function rateAnswer(correct, usedHint, seconds) {
  if (!correct) return 'again';
  if (usedHint || seconds > 20) return 'hard';
  if (seconds > 8) return 'good';
  return 'easy';
}
`,
    tests: [
      { name: 'Wrong is again', code: `expect(rateAnswer(false, false, 3)).toBe('again'); expect(rateAnswer(false, true, 30)).toBe('again');` },
      { name: 'A hint makes it hard', code: `expect(rateAnswer(true, true, 2)).toBe('hard');` },
      { name: 'Slow answers are hard', code: `expect(rateAnswer(true, false, 21)).toBe('hard');` },
      { name: 'Boundaries: 20 s is good, 8 s is easy', code: `expect(rateAnswer(true, false, 20)).toBe('good'); expect(rateAnswer(true, false, 8)).toBe('easy');` },
      { name: 'Fast and unaided is easy', code: `expect(rateAnswer(true, false, 3)).toBe('easy');` },
    ],
    hints: ['Check the most important rule first and `return` early.', '`||` means "or": either condition is enough.'],
  },
  {
    id: 'p1-l4-challenge',
    lessonId: 'p1-l4',
    level: 'challenge',
    title: 'Level from points',
    language: 'js',
    exports: ['levelFor'],
    prompt: md(
      'Write `levelFor(points)` that returns the learner’s level:',
      '',
      '- `0` to `99` → `A1`',
      '- `100` to `299` → `A2`',
      '- `300` to `699` → `B1`',
      '- `700` to `1199` → `B2`',
      '- `1200` or more → `C1`',
      '',
      "Return `'invalid'` when `points` is not a number (for example the string `'150'`), is `NaN`, or is negative.",
    ),
    starter: `function levelFor(points) {
  if (points < 100) return 'A1';
  return 'A2';
}
`,
    solution: `function levelFor(points) {
  if (typeof points !== 'number' || Number.isNaN(points) || points < 0) return 'invalid';
  if (points < 100) return 'A1';
  if (points < 300) return 'A2';
  if (points < 700) return 'B1';
  if (points < 1200) return 'B2';
  return 'C1';
}
`,
    tests: [
      { name: 'Every level', code: `expect(levelFor(50)).toBe('A1'); expect(levelFor(150)).toBe('A2'); expect(levelFor(400)).toBe('B1'); expect(levelFor(900)).toBe('B2'); expect(levelFor(5000)).toBe('C1');` },
      { name: 'Exact boundaries', code: `expect(levelFor(0)).toBe('A1'); expect(levelFor(99)).toBe('A1'); expect(levelFor(100)).toBe('A2'); expect(levelFor(699)).toBe('B1'); expect(levelFor(700)).toBe('B2'); expect(levelFor(1200)).toBe('C1');` },
      { name: 'Invalid input', code: `expect(levelFor(-1)).toBe('invalid'); expect(levelFor('150')).toBe('invalid'); expect(levelFor(NaN)).toBe('invalid'); expect(levelFor(undefined)).toBe('invalid');` },
    ],
    hints: ['Reject invalid input first, then check the ranges from smallest to largest.'],
  },

  // ---------- Lesson 5: Functions ----------
  {
    id: 'p1-l5-core',
    lessonId: 'p1-l5',
    level: 'core',
    title: 'Format a word card',
    language: 'js',
    exports: ['capitalize', 'formatWord'],
    prompt: md(
      '1. `capitalize(word)` returns the word with its first letter in upper case: `"hund"` → `"Hund"`. An empty string stays empty.',
      '2. `formatWord(term, translation, showTranslation)` returns `"Hund — dog"`. If `showTranslation` is `false` it returns `"Hund — ?"`. `showTranslation` must default to `true` when it is not passed.',
      '',
      '`formatWord` must **reuse** `capitalize` for the term, so `formatWord("hund", "dog")` → `"Hund — dog"`.',
    ),
    starter: `function capitalize(word) {
  return word;
}

function formatWord(term, translation, showTranslation) {
  return term + ' — ' + translation;
}
`,
    solution: `function capitalize(word) {
  if (word === '') return '';
  return word[0].toUpperCase() + word.slice(1);
}

function formatWord(term, translation, showTranslation = true) {
  const shown = showTranslation ? translation : '?';
  return capitalize(term) + ' — ' + shown;
}
`,
    tests: [
      { name: 'capitalize', code: `expect(capitalize('hund')).toBe('Hund'); expect(capitalize('Katze')).toBe('Katze'); expect(capitalize('')).toBe('');` },
      { name: 'formatWord shows the translation by default', code: `expect(formatWord('Hund', 'dog')).toBe('Hund — dog');` },
      { name: 'formatWord can hide it', code: `expect(formatWord('Hund', 'dog', false)).toBe('Hund — ?');` },
      { name: 'formatWord capitalises the term', code: `expect(formatWord('katze', 'cat', true)).toBe('Katze — cat');` },
    ],
    hints: ['A default value is written in the parameter list: `function f(a, b = true)`.', '`word[0]` is the first letter and `word.slice(1)` is the rest.'],
  },
  {
    id: 'p1-l5-challenge',
    lessonId: 'p1-l5',
    level: 'challenge',
    title: 'Functions that make functions',
    language: 'js',
    exports: ['makeMultiplier', 'applyTimes'],
    prompt: md(
      'Functions are values: you can return them and pass them around.',
      '',
      '1. `makeMultiplier(n)` returns a **new function** that multiplies its input by `n`: `makeMultiplier(3)(4)` → `12`.',
      '2. `applyTimes(fn, value, times)` calls `fn` on `value`, then on the result, `times` times in total, and returns the final value. With `times` = `0` it returns `value` unchanged.',
      '',
      '```js',
      'applyTimes(makeMultiplier(2), 1, 5); // 32',
      "applyTimes((s) => s + '!', 'hi', 3); // 'hi!!!'",
      '```',
    ),
    starter: `function makeMultiplier(n) {
  // Return a function
}

function applyTimes(fn, value, times) {
  return fn(value);
}
`,
    solution: `function makeMultiplier(n) {
  return (x) => x * n;
}

function applyTimes(fn, value, times) {
  let result = value;
  for (let i = 0; i < times; i++) {
    result = fn(result);
  }
  return result;
}
`,
    tests: [
      { name: 'makeMultiplier returns a function', code: `const triple = makeMultiplier(3); expect(typeof triple).toBe('function'); expect(triple(4)).toBe(12);` },
      { name: 'Each multiplier keeps its own n', code: `const double = makeMultiplier(2); const ten = makeMultiplier(10); expect(double(5)).toBe(10); expect(ten(5)).toBe(50);` },
      { name: 'applyTimes repeats the function', code: `expect(applyTimes(makeMultiplier(2), 1, 5)).toBe(32); expect(applyTimes((s) => s + '!', 'hi', 3)).toBe('hi!!!');` },
      { name: 'applyTimes with 0 returns the value', code: `expect(applyTimes((x) => x + 1, 7, 0)).toBe(7);` },
    ],
    hints: ['`return (x) => x * n;` returns a function that remembers `n`.', 'Keep the running result in a variable and update it in a loop.'],
  },

  // ---------- Lesson 6: Arrays ----------
  {
    id: 'p1-l6-core',
    lessonId: 'p1-l6',
    level: 'core',
    title: 'Manage a word list without changing it',
    language: 'js',
    exports: ['addWord', 'removeWord', 'lastN'],
    prompt: md(
      'All three functions return a **new** array and must never change the array they receive.',
      '',
      '1. `addWord(list, term)` adds `term` at the end, unless the list already contains it **ignoring case** (then it returns an unchanged copy).',
      '2. `removeWord(list, term)` returns the list without `term` (exact match).',
      '3. `lastN(list, n)` returns the last `n` words. If `n` is bigger than the list, return all of them; if `n` is 0 or less, return `[]`.',
    ),
    starter: `function addWord(list, term) {
  list.push(term);
  return list;
}

function removeWord(list, term) {
  // Your code here
}

function lastN(list, n) {
  return list.slice(-n);
}
`,
    solution: `function addWord(list, term) {
  const lower = term.toLowerCase();
  for (const item of list) {
    if (item.toLowerCase() === lower) return [...list];
  }
  return [...list, term];
}

function removeWord(list, term) {
  return list.filter((item) => item !== term);
}

function lastN(list, n) {
  if (n <= 0) return [];
  return list.slice(-n);
}
`,
    setup: `const words = ['Hund', 'Katze', 'Brot'];\nconst before = JSON.stringify(words);`,
    tests: [
      { name: 'addWord adds a new word', code: `expect(addWord(words, 'Apfel')).toEqual(['Hund', 'Katze', 'Brot', 'Apfel']);` },
      { name: 'addWord ignores duplicates in any case', code: `expect(addWord(words, 'hund')).toEqual(['Hund', 'Katze', 'Brot']);` },
      { name: 'removeWord removes it', code: `expect(removeWord(words, 'Katze')).toEqual(['Hund', 'Brot']); expect(removeWord(words, 'Zug')).toEqual(['Hund', 'Katze', 'Brot']);` },
      { name: 'lastN', code: `expect(lastN(words, 2)).toEqual(['Katze', 'Brot']); expect(lastN(words, 10)).toEqual(['Hund', 'Katze', 'Brot']); expect(lastN(words, 0)).toEqual([]);` },
      { name: 'Never changes the original array', code: `addWord(words, 'Apfel'); removeWord(words, 'Hund'); lastN(words, 1); expect(JSON.stringify(words)).toBe(before);` },
      { name: 'Always returns a new array', code: `expect(addWord(words, 'hund') === words).toBe(false);` },
    ],
    hints: ['`[...list, term]` makes a new array with one more item.', '`list.slice(-0)` returns the whole list, so handle `n <= 0` yourself.'],
  },
  {
    id: 'p1-l6-challenge',
    lessonId: 'p1-l6',
    level: 'challenge',
    title: 'Split into study batches',
    language: 'js',
    exports: ['chunk'],
    prompt: md(
      'Flashcards are studied in small batches. Write `chunk(list, size)` that splits a list into arrays of at most `size` items, in order:',
      '```js',
      "chunk(['a', 'b', 'c', 'd', 'e'], 2); // [['a', 'b'], ['c', 'd'], ['e']]",
      '```',
      '- An empty list returns `[]`.',
      "- If `size` is less than 1, **throw** an Error with the message `size must be at least 1`.",
    ),
    starter: `function chunk(list, size) {
  return [list];
}
`,
    solution: `function chunk(list, size) {
  if (size < 1) throw new Error('size must be at least 1');
  const batches = [];
  for (let i = 0; i < list.length; i += size) {
    batches.push(list.slice(i, i + size));
  }
  return batches;
}
`,
    tests: [
      { name: 'Splits into batches of 2', code: `expect(chunk(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']]);` },
      { name: 'Batch size bigger than the list', code: `expect(chunk([1, 2], 5)).toEqual([[1, 2]]);` },
      { name: 'Exact division', code: `expect(chunk([1, 2, 3, 4, 5, 6], 3)).toEqual([[1, 2, 3], [4, 5, 6]]);` },
      { name: 'Empty list', code: `expect(chunk([], 3)).toEqual([]);` },
      { name: 'Invalid size throws', code: `expect(() => chunk([1], 0)).toThrow('size must be at least 1');` },
    ],
    hints: ['Loop with `i += size` and take `list.slice(i, i + size)` each time.', '`throw new Error(message)` stops the function.'],
  },

  // ---------- Lesson 7: Objects ----------
  {
    id: 'p1-l7-core',
    lessonId: 'p1-l7',
    level: 'core',
    title: 'Flashcards as objects',
    language: 'js',
    exports: ['createCard', 'recordResult'],
    prompt: md(
      '1. `createCard(term, translation)` returns a new card object:',
      '```js',
      "{ term: 'Hund', translation: 'dog', reviews: 0, lastResult: null }",
      '```',
      "2. `recordResult(card, correct)` returns a **new** card with `reviews` increased by 1 and `lastResult` set to `'correct'` or `'wrong'`. The original card must not change.",
    ),
    starter: `function createCard(term, translation) {
  // Return a new object
}

function recordResult(card, correct) {
  card.reviews = card.reviews + 1;
  return card;
}
`,
    solution: `function createCard(term, translation) {
  return { term, translation, reviews: 0, lastResult: null };
}

function recordResult(card, correct) {
  return { ...card, reviews: card.reviews + 1, lastResult: correct ? 'correct' : 'wrong' };
}
`,
    tests: [
      { name: 'createCard', code: `expect(createCard('Hund', 'dog')).toEqual({ term: 'Hund', translation: 'dog', reviews: 0, lastResult: null });` },
      { name: 'recordResult counts the review', code: `const card = recordResult(createCard('Hund', 'dog'), true); expect(card.reviews).toBe(1); expect(card.lastResult).toBe('correct');` },
      { name: 'Wrong answers are recorded too', code: `const card = recordResult(recordResult(createCard('Hund', 'dog'), true), false); expect(card.reviews).toBe(2); expect(card.lastResult).toBe('wrong');` },
      { name: 'The original card does not change', code: `const card = createCard('Hund', 'dog'); recordResult(card, true); expect(card).toEqual({ term: 'Hund', translation: 'dog', reviews: 0, lastResult: null });` },
    ],
    hints: ['`{ ...card, reviews: … }` copies the card and overrides some properties.'],
  },
  {
    id: 'p1-l7-challenge',
    lessonId: 'p1-l7',
    level: 'challenge',
    title: 'Count and invert',
    language: 'js',
    exports: ['countBy', 'invert'],
    prompt: md(
      '1. `countBy(items, key)` counts how many items have each value of a property:',
      '```js',
      "countBy(words, 'category'); // { animals: 2, food: 1 }",
      '```',
      '   Items without that property are skipped.',
      '2. `invert(dictionary)` swaps keys and values: `{ Hund: "dog" }` → `{ dog: "Hund" }`.',
    ),
    starter: `function countBy(items, key) {
  return {};
}

function invert(dictionary) {
  return dictionary;
}
`,
    solution: `function countBy(items, key) {
  const counts = {};
  for (const item of items) {
    const value = item[key];
    if (value === undefined) continue;
    counts[value] = (counts[value] || 0) + 1;
  }
  return counts;
}

function invert(dictionary) {
  const result = {};
  for (const key in dictionary) {
    result[dictionary[key]] = key;
  }
  return result;
}
`,
    setup: `const words = [
  { term: 'Hund', category: 'animals' },
  { term: 'Katze', category: 'animals' },
  { term: 'Brot', category: 'food' },
  { term: 'Zug' },
];`,
    tests: [
      { name: 'countBy category', code: `expect(countBy(words, 'category')).toEqual({ animals: 2, food: 1 });` },
      { name: 'countBy any property', code: `expect(countBy([{ level: 'A1' }, { level: 'A1' }, { level: 'B1' }], 'level')).toEqual({ A1: 2, B1: 1 });` },
      { name: 'countBy of an empty list', code: `expect(countBy([], 'x')).toEqual({});` },
      { name: 'invert', code: `expect(invert({ Hund: 'dog', Katze: 'cat' })).toEqual({ dog: 'Hund', cat: 'Katze' }); expect(invert({})).toEqual({});` },
    ],
    hints: ['Use bracket notation for a property whose name is in a variable: `item[key]`.', '`for (const key in object)` visits every key.'],
  },

  // ---------- Lesson 8: Loops ----------
  {
    id: 'p1-l8-core',
    lessonId: 'p1-l8',
    level: 'core',
    title: "Build today's review queue",
    language: 'js',
    exports: ['reviewQueue'],
    prompt: md(
      "Write `reviewQueue(cards, maxCards)` that returns the **terms** of the cards to study today, in order. Use a loop with `continue` and `break`:",
      '- skip cards that are `suspended: true` (`continue`),',
      '- include cards that are `due: true`,',
      '- **stop the loop** as soon as the queue has `maxCards` terms (`break`). Do not keep looking at the remaining cards.',
    ),
    starter: `function reviewQueue(cards, maxCards) {
  const queue = [];
  for (const card of cards) {
    queue.push(card.term);
  }
  return queue;
}
`,
    solution: `function reviewQueue(cards, maxCards) {
  const queue = [];
  for (const card of cards) {
    if (queue.length >= maxCards) break;
    if (card.suspended) continue;
    if (card.due) queue.push(card.term);
  }
  return queue;
}
`,
    setup: `const cards = [
  { term: 'Hund', due: true },
  { term: 'Katze', due: false },
  { term: 'Brot', due: true, suspended: true },
  { term: 'Apfel', due: true },
  { term: 'Milch', due: true },
];`,
    tests: [
      { name: 'Only due, not suspended', code: `expect(reviewQueue(cards, 10)).toEqual(['Hund', 'Apfel', 'Milch']);` },
      { name: 'Respects maxCards', code: `expect(reviewQueue(cards, 2)).toEqual(['Hund', 'Apfel']); expect(reviewQueue(cards, 0)).toEqual([]);` },
      {
        name: 'Stops as soon as the queue is full',
        code: `const trap = { term: 'Trap', get due() { throw new Error('The loop kept going after the queue was full'); } };
expect(reviewQueue([...cards, trap], 3)).toEqual(['Hund', 'Apfel', 'Milch']);`,
      },
    ],
    hints: ['Check whether the queue is full at the start of each loop iteration.', '`continue` skips to the next card; `break` leaves the loop.'],
  },
  {
    id: 'p1-l8-challenge',
    lessonId: 'p1-l8',
    level: 'challenge',
    title: 'Streaks',
    language: 'js',
    exports: ['longestStreak', 'currentStreak'],
    prompt: md(
      '`results` is an array of booleans, one per day: `true` if the learner studied.',
      '',
      '1. `longestStreak(results)` returns the longest run of consecutive `true` values.',
      '2. `currentStreak(results)` returns how many `true` values there are **at the end** of the array.',
      '```js',
      'longestStreak([true, true, false, true, true, true, false]); // 3',
      'currentStreak([true, false, true, true]);                     // 2',
      '```',
    ),
    starter: `function longestStreak(results) {
  return 0;
}

function currentStreak(results) {
  return 0;
}
`,
    solution: `function longestStreak(results) {
  let best = 0;
  let run = 0;
  for (const studied of results) {
    run = studied ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

function currentStreak(results) {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (!results[i]) break;
    count++;
  }
  return count;
}
`,
    tests: [
      { name: 'longestStreak', code: `expect(longestStreak([true, true, false, true, true, true, false])).toBe(3);` },
      { name: 'longestStreak edge cases', code: `expect(longestStreak([])).toBe(0); expect(longestStreak([false, false])).toBe(0); expect(longestStreak([true, true, true])).toBe(3);` },
      { name: 'currentStreak', code: `expect(currentStreak([true, false, true, true])).toBe(2); expect(currentStreak([true, true, false])).toBe(0); expect(currentStreak([])).toBe(0);` },
    ],
    hints: ['Keep two counters: the current run and the best run so far.', 'For the current streak, loop backwards from the last index.'],
  },

  // ---------- Lesson 9: Array methods ----------
  {
    id: 'p1-l9-core',
    lessonId: 'p1-l9',
    level: 'core',
    title: 'Due today summary',
    language: 'js',
    exports: ['dueSummary', 'totalReviews'],
    prompt: md(
      'Use array methods (`filter`, `map`, `sort`, `join`, `reduce`), not `for` loops.',
      '',
      "1. `dueSummary(words)` returns `\"Due today: Apfel, Hund\"`: the terms of words with `due: true`, **sorted alphabetically**, joined with `\", \"`. If nothing is due, return `\"Nothing due today\"`.",
      '2. `totalReviews(words)` returns the sum of every word’s `reviews`. Words without a `reviews` property count as 0.',
      '',
      'Neither function may change the input array.',
    ),
    starter: `function dueSummary(words) {
  return 'Due today: ' + words.map((w) => w.term).join(', ');
}

function totalReviews(words) {
  // Your code here
}
`,
    solution: `function dueSummary(words) {
  const due = words
    .filter((w) => w.due)
    .map((w) => w.term)
    .sort();
  if (due.length === 0) return 'Nothing due today';
  return 'Due today: ' + due.join(', ');
}

function totalReviews(words) {
  return words.reduce((sum, w) => sum + (w.reviews || 0), 0);
}
`,
    setup: `const words = [
  { term: 'Hund', due: true, reviews: 4 },
  { term: 'Katze', due: false, reviews: 2 },
  { term: 'Apfel', due: true },
  { term: 'Brot', due: false, reviews: 1 },
];
const before = JSON.stringify(words);`,
    tests: [
      { name: 'dueSummary sorts the due terms', code: `expect(dueSummary(words)).toBe('Due today: Apfel, Hund');` },
      { name: 'dueSummary with nothing due', code: `expect(dueSummary(words.filter((w) => !w.due))).toBe('Nothing due today'); expect(dueSummary([])).toBe('Nothing due today');` },
      { name: 'totalReviews treats missing reviews as 0', code: `expect(totalReviews(words)).toBe(7); expect(totalReviews([])).toBe(0);` },
      { name: 'Does not change the input', code: `dueSummary(words); totalReviews(words); expect(JSON.stringify(words)).toBe(before);` },
    ],
    hints: ['Chain the methods: `words.filter(…).map(…).sort()`.', '`reduce((sum, w) => sum + …, 0)` starts the sum at 0.'],
  },
  {
    id: 'p1-l9-challenge',
    lessonId: 'p1-l9',
    level: 'challenge',
    title: 'Weekly leaderboard',
    language: 'js',
    exports: ['leaderboard'],
    prompt: md(
      'Each session adds an entry `{ user, points }`; a user can appear many times. Write `leaderboard(entries)` that returns the **top 3** users as `{ user, total }`:',
      '- sorted by `total` from highest to lowest,',
      '- users with the same total sorted alphabetically,',
      '- without changing the input.',
      '```js',
      "leaderboard([{ user: 'ana', points: 10 }, { user: 'ben', points: 5 }, { user: 'ana', points: 3 }]);",
      "// [{ user: 'ana', total: 13 }, { user: 'ben', total: 5 }]",
      '```',
    ),
    starter: `function leaderboard(entries) {
  return entries.sort((a, b) => b.points - a.points).slice(0, 3);
}
`,
    solution: `function leaderboard(entries) {
  const totals = entries.reduce((acc, entry) => {
    acc[entry.user] = (acc[entry.user] || 0) + entry.points;
    return acc;
  }, {});
  return Object.entries(totals)
    .map(([user, total]) => ({ user, total }))
    .sort((a, b) => b.total - a.total || a.user.localeCompare(b.user))
    .slice(0, 3);
}
`,
    setup: `const entries = [
  { user: 'ana', points: 10 },
  { user: 'ben', points: 5 },
  { user: 'ana', points: 3 },
  { user: 'cleo', points: 13 },
  { user: 'dev', points: 4 },
  { user: 'ben', points: 2 },
];
const before = JSON.stringify(entries);`,
    tests: [
      { name: 'Sums per user and keeps the top 3', code: `expect(leaderboard(entries)).toEqual([{ user: 'ana', total: 13 }, { user: 'cleo', total: 13 }, { user: 'ben', total: 7 }]);` },
      { name: 'Fewer than 3 users', code: `expect(leaderboard([{ user: 'zoe', points: 1 }])).toEqual([{ user: 'zoe', total: 1 }]); expect(leaderboard([])).toEqual([]);` },
      { name: 'Does not change the input', code: `leaderboard(entries); expect(JSON.stringify(entries)).toBe(before);` },
    ],
    hints: ['First build an object of totals with `reduce`, then turn it into an array with `Object.entries`.', '`sort` changes the array it is called on: sort a new array, never the input.'],
  },

  // ---------- Lesson 10: Scope and closures ----------
  {
    id: 'p1-l10-core',
    lessonId: 'p1-l10',
    level: 'core',
    title: 'Independent counters',
    language: 'js',
    exports: ['createCounter'],
    prompt: md(
      'Write `createCounter(start)` that returns an object with three methods: `increment()`, `decrement()` and `value()`.',
      '- `start` defaults to `0`.',
      '- `decrement()` never goes below 0.',
      '- The count must be **private**: stored in a closure, not as a property (`counter.count` is `undefined`).',
      '- Every counter is independent of the others.',
    ),
    starter: `function createCounter(start) {
  return {
    count: start,
    increment() {},
    decrement() {},
    value() {
      return this.count;
    },
  };
}
`,
    solution: `function createCounter(start = 0) {
  let count = start;
  return {
    increment() {
      count++;
    },
    decrement() {
      if (count > 0) count--;
    },
    value() {
      return count;
    },
  };
}
`,
    tests: [
      { name: 'Counts up and down', code: `const c = createCounter(); c.increment(); c.increment(); c.decrement(); expect(c.value()).toBe(1);` },
      { name: 'Starts from a given value', code: `expect(createCounter(5).value()).toBe(5);` },
      { name: 'Never below 0', code: `const c = createCounter(1); c.decrement(); c.decrement(); expect(c.value()).toBe(0);` },
      { name: 'Counters are independent', code: `const a = createCounter(); const b = createCounter(10); a.increment(); expect(a.value()).toBe(1); expect(b.value()).toBe(10);` },
      { name: 'The count is private', code: `const c = createCounter(3); expect(c.count).toBeUndefined(); c.count = 100; expect(c.value()).toBe(3);` },
    ],
    hints: ['Declare `let count = start;` inside `createCounter`; the methods can still see it after it returns.'],
  },
  {
    id: 'p1-l10-challenge',
    lessonId: 'p1-l10',
    level: 'challenge',
    title: 'once and memoize',
    language: 'js',
    exports: ['once', 'memoize'],
    prompt: md(
      'Two classic closure utilities:',
      '',
      '1. `once(fn)` returns a function that calls `fn` only the **first** time; later calls return that first result without calling `fn` again.',
      '2. `memoize(fn)` returns a function for one-argument functions that remembers results: calling it again with the same argument returns the saved result without calling `fn`.',
      '```js',
      'const slowSquare = (n) => { /* slow */ return n * n; };',
      'const fastSquare = memoize(slowSquare);',
      'fastSquare(4); // calls slowSquare',
      'fastSquare(4); // returns 16 from memory',
      '```',
    ),
    starter: `function once(fn) {
  return fn;
}

function memoize(fn) {
  return fn;
}
`,
    solution: `function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
`,
    setup: `let calls = 0;
const square = (n) => {
  calls++;
  return n * n;
};`,
    tests: [
      { name: 'once calls the function a single time', code: `const init = once(() => { calls++; return 'ready'; }); expect(init()).toBe('ready'); expect(init()).toBe('ready'); expect(calls).toBe(1);` },
      { name: 'once passes the arguments the first time', code: `const add = once((a, b) => a + b); expect(add(2, 3)).toBe(5); expect(add(10, 10)).toBe(5);` },
      { name: 'memoize remembers results', code: `const fast = memoize(square); expect(fast(4)).toBe(16); expect(fast(4)).toBe(16); expect(calls).toBe(1); expect(fast(5)).toBe(25); expect(calls).toBe(2);` },
      { name: 'Each memoized function has its own memory', code: `const a = memoize(square); const b = memoize(square); a(3); b(3); expect(calls).toBe(2);` },
    ],
    hints: ['Store "has it been called?" and the result in variables inside `once`.', 'A `Map` (or an object) works as the cache.'],
  },
];
