import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const MOCK_FETCH = `const calls = [];
const api = {
  1: { id: 1, term: 'Hund', translation: 'dog' },
  2: { id: 2, term: 'Katze', translation: 'cat' },
};
globalThis.fetch = async (url) => {
  calls.push(url);
  const id = Number(String(url).split('/').pop());
  if (String(url).includes('/words/500')) return { ok: false, status: 500, json: async () => ({ error: 'boom' }) };
  if (!api[id]) return { ok: false, status: 404, json: async () => ({ error: 'not found' }) };
  return { ok: true, status: 200, json: async () => ({ ...api[id] }) };
};`;

export const p2: Checkpoint = {
  phaseId: 'p2',
  questions: [
    {
      id: 'p2-q1',
      lesson: 1,
      kind: 'text',
      prompt: md('What does this print?', '```js', "const { term, level = 1 } = { term: 'Hund' };", 'console.log(level);', '```'),
      accept: ['1'],
      explanation: 'The object has no `level` property, so the default value 1 is used.',
    },
    {
      id: 'p2-q2',
      lesson: 2,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'const a = [1, 2];', 'const b = [...a, 3];', 'b.push(4);', 'console.log(a.length);', '```'),
      accept: ['2'],
      explanation: 'Spread creates a new array. Changing `b` does not affect `a`, which still has 2 items.',
    },
    {
      id: 'p2-q3',
      lesson: 2,
      kind: 'single',
      prompt: md(
        'What happens to `word.tags`?',
        '```js',
        "const word = { term: 'Hund', tags: ['animal'] };",
        'const copy = { ...word };',
        "copy.tags.push('pet');",
        '```',
      ),
      options: [
        "word.tags also contains 'pet', because spread only copies one level deep",
        "word.tags is unchanged, because spread copies everything deeply",
        'It throws an error because objects are read-only',
        'copy.tags becomes undefined',
      ],
      answer: 0,
      explanation: 'Spread makes a shallow copy. Nested arrays and objects are shared, so to change them immutably you must copy them too: `{ ...word, tags: [...word.tags, "pet"] }`.',
    },
    {
      id: 'p2-q4',
      lesson: 4,
      kind: 'single',
      prompt: md(
        'The file `utils.js` contains:',
        '```js',
        'export default function shuffle(items) { /* … */ }',
        'export const VERSION = 2;',
        '```',
        'Which import is correct?',
      ),
      options: [
        "import shuffle, { VERSION } from './utils.js';",
        "import { shuffle, VERSION } from './utils.js';",
        "import shuffle, VERSION from './utils.js';",
        "import { default, VERSION } from './utils.js';",
      ],
      answer: 0,
      explanation: 'The default export is imported without braces (and you choose its name). Named exports go inside braces with their exact names.',
    },
    {
      id: 'p2-q5',
      lesson: 3,
      kind: 'single',
      prompt: 'Why split an app into modules (separate files)?',
      options: [
        'Each file has its own scope and a clear job, so code is easier to find, reuse and test',
        'JavaScript runs faster when spread across files',
        'Browsers cannot load files longer than 100 lines',
        'Modules make variables global so every file can use them',
      ],
      answer: 0,
      explanation: 'Variables in a module are private unless exported, which prevents accidental clashes and makes dependencies explicit.',
    },
    {
      id: 'p2-q6',
      lesson: 5,
      kind: 'single',
      prompt: 'A promise whose operation failed is in which state?',
      options: ['rejected', 'pending', 'fulfilled', 'resolved'],
      answer: 0,
      explanation: 'A promise starts pending, then becomes either fulfilled (success) or rejected (failure).',
    },
    {
      id: 'p2-q7',
      lesson: 6,
      kind: 'text',
      prompt: md(
        'In what order are the letters printed? Write them separated by spaces.',
        '```js',
        "console.log('A');",
        "setTimeout(() => console.log('B'), 0);",
        "Promise.resolve().then(() => console.log('C'));",
        "console.log('D');",
        '```',
      ),
      accept: ['A D C B', 'A, D, C, B', 'ADCB', 'A,D,C,B'],
      explanation: 'Synchronous code runs first (A, D). Then promise callbacks (C), then timers (B), even with a 0 ms delay.',
    },
    {
      id: 'p2-q8',
      lesson: 6,
      kind: 'single',
      prompt: 'What does `await` do inside an async function?',
      options: [
        'Pauses that function until the promise settles, without blocking the rest of the program',
        'Freezes the whole app until the promise settles',
        'Converts a promise into a callback',
        'Makes the code run on another thread',
      ],
      answer: 0,
      explanation: 'Only the async function waits. The rest of the app keeps responding, which is why the UI does not freeze while data loads.',
    },
    {
      id: 'p2-q9',
      lesson: 6,
      kind: 'single',
      prompt: md(
        'Both requests take 1 second. Roughly how long does `loadBoth` take?',
        '```js',
        'async function loadBoth() {',
        "  const [a, b] = await Promise.all([fetchWord(1), fetchWord(2)]);",
        '  return [a, b];',
        '}',
        '```',
      ),
      options: ['About 1 second, because both requests run at the same time', 'About 2 seconds', 'Instantly', 'It depends on the order of the array'],
      answer: 0,
      explanation: '`Promise.all` starts both requests immediately and waits for both. `await fetchWord(1); await fetchWord(2);` would take about 2 seconds.',
    },
    {
      id: 'p2-q10',
      lesson: 7,
      kind: 'single',
      prompt: 'When does a `finally` block run?',
      options: ['Always: after the try block, whether or not an error was thrown', 'Only when there was an error', 'Only when there was no error', 'Only if there is no catch block'],
      answer: 0,
      explanation: '`finally` is the place for cleanup such as hiding a loading spinner, because it runs in every case.',
    },
    {
      id: 'p2-q11',
      lesson: 8,
      kind: 'text',
      prompt: md('What string does this produce? (Write it exactly, without the outer quotes.)', '```js', 'JSON.stringify({ a: 1, b: [true, null] });', '```'),
      accept: ['{"a":1,"b":[true,null]}'],
      explanation: 'JSON uses double quotes around keys and has no spaces by default.',
    },
    {
      id: 'p2-q12',
      lesson: 8,
      kind: 'single',
      prompt: "What happens with `JSON.parse('{ name: \"Lyra\" }')`?",
      options: ['It throws a SyntaxError, because JSON keys must be in double quotes', 'It returns { name: "Lyra" }', 'It returns null', 'It returns the string unchanged'],
      answer: 0,
      explanation: 'JSON is stricter than JavaScript object syntax: keys need double quotes. That is why parsing should be wrapped in try/catch.',
    },
    {
      id: 'p2-q13',
      lesson: 9,
      kind: 'single',
      prompt: 'Your `fetch` call gets a 404 Not Found response. What does `fetch` do?',
      options: [
        'It resolves normally; you must check `response.ok` or `response.status` yourself',
        'It rejects, so the catch block runs automatically',
        'It retries the request three times',
        'It returns undefined',
      ],
      answer: 0,
      explanation: '`fetch` only rejects on network failures. HTTP errors such as 404 or 500 still resolve, so always check `response.ok`.',
    },
  ],
  problems: [
    {
      id: 'p2-destructuring',
      title: 'Destructuring and spread',
      lesson: 1,
      language: 'js',
      exports: ['describeWord', 'updateWord'],
      setup: `const hund = { term: 'Hund', translation: 'dog', level: 2, tags: ['animal'] };
const snapshot = JSON.stringify(hund);`,
      prompt: md(
        'Write two functions:',
        '',
        '1. `describeWord(word)` uses **destructuring in its parameter** to read `term`, `translation` and `level` (default `1` when missing) and returns a string like:',
        '```',
        'Hund (dog), level 2',
        '```',
        '2. `updateWord(word, changes)` returns a **new** word with the changes applied, using spread. The original word must not change.',
        '',
        "Example: `updateWord(hund, { level: 3 })` returns a new object with `level: 3` and everything else the same.",
      ),
      starter: `function describeWord(word) {
  return word.term + ' (' + word.translation + '), level ' + word.level;
}

function updateWord(word, changes) {
  Object.assign(word, changes);
  return word;
}
`,
      solution: `function describeWord({ term, translation, level = 1 }) {
  return term + ' (' + translation + '), level ' + level;
}

function updateWord(word, changes) {
  return { ...word, ...changes };
}
`,
      tests: [
        { name: 'describeWord uses the level', code: `expect(describeWord(hund)).toBe('Hund (dog), level 2');` },
        { name: 'describeWord defaults the level to 1', code: `expect(describeWord({ term: 'Brot', translation: 'bread' })).toBe('Brot (bread), level 1');` },
        { name: 'updateWord applies the changes', code: `expect(updateWord(hund, { level: 3 })).toEqual({ term: 'Hund', translation: 'dog', level: 3, tags: ['animal'] });` },
        { name: 'updateWord does not change the original', code: `updateWord(hund, { level: 5, term: 'X' }); expect(JSON.stringify(hund)).toBe(snapshot);` },
        { name: 'updateWord returns a new object', code: `expect(updateWord(hund, {}) === hund).toBe(false);` },
        {
          name: 'Works for any word',
          code: `const anyWord = () => (rand.bool() ? { term: rand.word(), translation: rand.word(), level: rand.int(1, 9) } : { term: rand.word(), translation: rand.word() });
        await sameAsRef('describeWord', () => [anyWord()]);
        await sameAsRef('updateWord', () => [{ ...anyWord(), tags: [rand.word()] }, rand.pick([{}, { level: rand.int(1, 9) }, { term: rand.word(), tags: [] }])]);`,
        },
      ],
      hints: ['A parameter can be destructured directly: `function f({ a, b = 1 }) { … }`.', '`{ ...word, ...changes }` creates a new object; later properties win.'],
    },
    {
      id: 'p2-parseWordList',
      title: 'Parse JSON safely',
      lesson: 8,
      language: 'js',
      exports: ['parseWordList'],
      prompt: md(
        'Write `parseWordList(json)` that parses a JSON string containing an array of words.',
        '',
        '- Valid JSON array → return the array.',
        '- Invalid JSON → return `[]` instead of throwing.',
        '- Valid JSON that is **not an array** (for example an object or a number) → return `[]`.',
      ),
      starter: `function parseWordList(json) {
  return JSON.parse(json);
}
`,
      solution: `function parseWordList(json) {
  try {
    const value = JSON.parse(json);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
`,
      tests: [
        { name: 'Parses a valid array', code: `expect(parseWordList('[{"term":"Hund"},{"term":"Katze"}]')).toEqual([{ term: 'Hund' }, { term: 'Katze' }]);` },
        { name: 'Invalid JSON returns []', code: `expect(parseWordList('{ term: Hund ')).toEqual([]);` },
        { name: 'An object returns []', code: `expect(parseWordList('{"term":"Hund"}')).toEqual([]);` },
        { name: 'A number returns []', code: `expect(parseWordList('42')).toEqual([]);` },
        { name: 'An empty string returns []', code: `expect(parseWordList('')).toEqual([]);` },
        {
          name: 'Works for any text',
          code: `await sameAsRef('parseWordList', () => {
          const list = JSON.stringify(rand.list(rand.int(0, 4), () => ({ term: rand.word(), level: rand.int(1, 5) })));
          return [rand.pick([list, list.slice(0, rand.int(1, list.length - 1)), JSON.stringify({ term: rand.word() }), String(rand.int(-99, 99)), JSON.stringify(rand.word()), 'null', rand.word()])];
        }, 40);`,
        },
      ],
      hints: ['Wrap `JSON.parse` in `try { … } catch { … }`.', '`Array.isArray(value)` tells you whether something is an array.'],
    },
    {
      id: 'p2-fetchWord',
      title: 'Fetch a word from an API',
      lesson: 9,
      language: 'js',
      exports: ['fetchWord'],
      setup: MOCK_FETCH,
      prompt: md(
        'Write an **async** function `fetchWord(id)` that requests `https://api.example.com/words/` followed by the id (for example `https://api.example.com/words/1`) and returns the parsed JSON body.',
        '',
        'Handle errors:',
        '- Status 404 → throw an Error whose message is `Word <id> not found` (for example `Word 7 not found`).',
        '- Any other non-OK status → throw an Error whose message is `Request failed: <status>` (for example `Request failed: 500`).',
        '',
        'The tests replace `fetch` with a fake API, so no real network is used.',
      ),
      starter: `async function fetchWord(id) {
  const response = await fetch('https://api.example.com/words/' + id);
  return response.json();
}
`,
      solution: `async function fetchWord(id) {
  const response = await fetch('https://api.example.com/words/' + id);
  if (response.status === 404) throw new Error('Word ' + id + ' not found');
  if (!response.ok) throw new Error('Request failed: ' + response.status);
  return response.json();
}
`,
      tests: [
        { name: 'Returns the word', code: `expect(await fetchWord(1)).toEqual({ id: 1, term: 'Hund', translation: 'dog' });` },
        { name: 'Requests the right URL', code: `await fetchWord(2); expect(calls).toEqual(['https://api.example.com/words/2']);` },
        { name: 'Rejects with "Word 7 not found" on 404', code: `await expect(() => fetchWord(7)).toReject('Word 7 not found');` },
        { name: 'Rejects with "Request failed: 500" on a server error', code: `await expect(() => fetchWord(500)).toReject('Request failed: 500');` },
        {
          name: 'Works for any id and server response',
          code: `await sameAsRef('fetchWord', () => {
          const id = rand.int(1, 999);
          const status = rand.pick([200, 200, 404, 500, 503, 401]);
          const body = { id, term: rand.word(), translation: rand.word() };
          globalThis.fetch = async (url) =>
            url === 'https://api.example.com/words/' + id
              ? { ok: status === 200, status, json: async () => ({ ...body }) }
              : { ok: false, status: 404, json: async () => ({}) };
          return [id];
        }, 30);`,
        },
      ],
      hints: ['`fetch` does not reject on 404. Check `response.status` and `response.ok` before reading the body.', '`throw new Error(message)` inside an async function makes its promise reject.'],
    },
    {
      id: 'p2-loadAll',
      title: 'Load many words in parallel',
      lesson: 10,
      language: 'js',
      exports: ['loadAll'],
      setup: `let active = 0;
let maxActive = 0;
const fakeFetchWord = async (id) => {
  active++;
  maxActive = Math.max(maxActive, active);
  await new Promise((r) => setTimeout(r, 20));
  active--;
  if (id < 0) throw new Error('Word ' + id + ' not found');
  return { id, term: 'word' + id };
};`,
      prompt: md(
        'Write an async function `loadAll(ids, fetchWord)` that loads every id using the `fetchWord` function it receives, and returns:',
        '```js',
        '{ words: [/* the successful results, in the same order as ids */], failed: [/* the ids that threw */] }',
        '```',
        'Requirements:',
        '- Run the requests **in parallel**, not one after another.',
        '- One failing request must not stop the others.',
        '',
        'Example: `loadAll([1, -2, 3], fetchWord)` → `{ words: [word 1, word 3], failed: [-2] }`.',
      ),
      starter: `async function loadAll(ids, fetchWord) {
  const words = [];
  for (const id of ids) {
    words.push(await fetchWord(id));
  }
  return { words, failed: [] };
}
`,
      solution: `async function loadAll(ids, fetchWord) {
  const results = await Promise.allSettled(ids.map((id) => fetchWord(id)));
  const words = [];
  const failed = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') words.push(result.value);
    else failed.push(ids[index]);
  });
  return { words, failed };
}
`,
      tests: [
        { name: 'Loads all words in order', code: `expect(await loadAll([1, 2, 3], fakeFetchWord)).toEqual({ words: [{ id: 1, term: 'word1' }, { id: 2, term: 'word2' }, { id: 3, term: 'word3' }], failed: [] });` },
        { name: 'Collects failures without stopping', code: `expect(await loadAll([1, -2, 3], fakeFetchWord)).toEqual({ words: [{ id: 1, term: 'word1' }, { id: 3, term: 'word3' }], failed: [-2] });` },
        { name: 'Runs the requests in parallel', code: `await loadAll([1, 2, 3, 4], fakeFetchWord); expect(maxActive).toBe(4);` },
        { name: 'Handles an empty list', code: `expect(await loadAll([], fakeFetchWord)).toEqual({ words: [], failed: [] });` },
        {
          name: 'Works for any ids',
          code: `const ids = rand.distinct(rand.int(1, 8), () => rand.int(-20, 20));
        active = 0;
        maxActive = 0;
        await sameAsRef('loadAll', () => [ids, fakeFetchWord], 1);
        maxActive = 0;
        await loadAll(ids, fakeFetchWord);
        expect(maxActive).toBe(ids.length);`,
        },
      ],
      hints: [
        'Start every request first (`ids.map(...)` gives you an array of promises), then wait for all of them.',
        '`Promise.allSettled` waits for every promise and tells you which ones were fulfilled and which were rejected.',
      ],
    },
  ],
};
