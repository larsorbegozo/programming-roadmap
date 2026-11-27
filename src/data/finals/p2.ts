import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final2: FinalExam = {
  phaseId: 'p2',
  minutes: 60,
  questions: [
    {
      id: 'f2-q1',
      lesson: 1,
      kind: 'text',
      prompt: md('What does this print?', '```js', "const [first, , third] = ['a', 'b', 'c'];", 'console.log(third);', '```'),
      accept: ['c'],
      explanation: 'An empty slot in array destructuring skips that item.',
    },
    {
      id: 'f2-q2',
      lesson: 2,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'const { a, ...rest } = { a: 1, b: 2, c: 3 };', 'console.log(Object.keys(rest).length);', '```'),
      accept: ['2'],
      explanation: 'The rest syntax collects every property not already picked: `{ b: 2, c: 3 }`.',
    },
    {
      id: 'f2-q3',
      lesson: 4,
      kind: 'single',
      prompt: md(
        '`utils.js` contains only `export function shuffle(items) { … }`. What happens with this import?',
        '```js',
        "import shuffle from './utils.js';",
        '```',
      ),
      options: [
        'An error: the module has no default export; it should be `import { shuffle } from …`',
        'It works the same as a named import',
        'shuffle is imported but is undefined only on phones',
        'It imports the whole file as an object',
      ],
      answer: 0,
      explanation: 'Named exports need braces and the exact name. Mixing up default and named imports is one of the most common beginner errors.',
    },
    {
      id: 'f2-q4',
      lesson: 6,
      kind: 'single',
      prompt: 'What does an `async` function always return?',
      options: ['A Promise', 'The value directly', 'undefined', 'A callback'],
      answer: 0,
      explanation: 'Even `async function f() { return 7; }` returns a promise that resolves to 7.',
    },
    {
      id: 'f2-q5',
      lesson: 6,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'async function getNumber() {', '  return 7;', '}', 'getNumber().then((n) => console.log(n + 1));', '```'),
      accept: ['8'],
      explanation: 'The promise resolves to 7 and the `then` callback receives it.',
    },
    {
      id: 'f2-q6',
      lesson: 5,
      kind: 'single',
      prompt: 'When does `Promise.all([a, b, c])` reject?',
      options: ['As soon as any one of the promises rejects', 'Only if all three reject', 'Never; it always resolves', 'After a 30-second timeout'],
      answer: 0,
      explanation: 'Use `Promise.allSettled` when you need every result, including the failures.',
    },
    {
      id: 'f2-q7',
      lesson: 6,
      kind: 'single',
      prompt: md(
        '`fetchWords()` returns a promise. What is wrong here?',
        '```js',
        'async function countWords() {',
        '  const words = fetchWords();',
        '  return words.length;',
        '}',
        '```',
      ),
      options: [
        '`await` is missing, so `words` is a Promise and `words.length` is undefined',
        'Async functions cannot return numbers',
        '`const` cannot hold a promise',
        'Nothing; it works',
      ],
      answer: 0,
      explanation: 'Without `await` you get the promise itself, not the value it will resolve to.',
    },
    {
      id: 'f2-q8',
      lesson: 7,
      kind: 'single',
      prompt: md(
        '`fetchWord(1)` returns a promise that rejects. Does the catch block run?',
        '```js',
        'try {',
        '  fetchWord(1);',
        '} catch (error) {',
        "  console.log('caught');",
        '}',
        '```',
      ),
      options: [
        'No: without await, the rejection happens later, outside the try block',
        'Yes, always',
        'Only in the browser',
        'Only if the error is a 404',
      ],
      answer: 0,
      explanation: 'try/catch only catches promise rejections you `await` inside it.',
    },
    {
      id: 'f2-q9',
      lesson: 8,
      kind: 'single',
      prompt: 'Which of these is valid JSON?',
      options: ['{"term": "Hund", "level": 2}', "{'term': 'Hund'}", '{term: "Hund"}', '{"term": "Hund",}'],
      answer: 0,
      explanation: 'JSON requires double quotes around keys and strings, and does not allow trailing commas.',
    },
    {
      id: 'f2-q10',
      lesson: 8,
      kind: 'text',
      prompt: "What is `JSON.parse('[1, 2, 3]').length`?",
      accept: ['3'],
      explanation: 'The string is parsed into a real array with three items.',
    },
    {
      id: 'f2-q11',
      lesson: 10,
      kind: 'single',
      prompt: "You catch an error created with `new Error('Word not found')`. What is `error.message`?",
      options: ["'Word not found'", "'Error'", "'Error: Word not found' including the stack", 'undefined'],
      answer: 0,
      explanation: '`message` is the text you passed in. `error.name` is "Error", and `error.stack` has the trace.',
    },
  ],
  problems: [
    {
      id: 'f2-mergeSettings',
      title: 'Merge settings without mutating',
      lesson: 2,
      language: 'js',
      exports: ['mergeSettings'],
      setup: `const defaults = { dailyGoal: 10, theme: 'dark', notifications: { reminders: true, hour: 19 } };
const before = JSON.stringify(defaults);`,
      prompt: md(
        'Write `mergeSettings(defaults, saved)` that returns a **new** settings object:',
        '- every property from `defaults`, overridden by the ones in `saved`,',
        '- except `notifications`, which is merged one level deep: `saved.notifications` only overrides the keys it contains.',
        '',
        "Example: with `saved = { theme: 'light', notifications: { hour: 8 } }` the result is `{ dailyGoal: 10, theme: 'light', notifications: { reminders: true, hour: 8 } }`.",
        '',
        '`saved` may have no `notifications` at all. Never modify `defaults` or `saved`.',
      ),
      starter: `function mergeSettings(defaults, saved) {
  return Object.assign(defaults, saved);
}
`,
      solution: `function mergeSettings(defaults, saved) {
  return {
    ...defaults,
    ...saved,
    notifications: { ...defaults.notifications, ...saved.notifications },
  };
}
`,
      tests: [
        { name: 'Top-level values are overridden', code: `expect(mergeSettings(defaults, { theme: 'light' })).toEqual({ dailyGoal: 10, theme: 'light', notifications: { reminders: true, hour: 19 } });` },
        { name: 'Notifications are merged one level deep', hidden: true, code: `expect(mergeSettings(defaults, { notifications: { hour: 8 } }).notifications).toEqual({ reminders: true, hour: 8 });` },
        { name: 'Works without saved.notifications', hidden: true, code: `expect(mergeSettings(defaults, { dailyGoal: 20 })).toEqual({ dailyGoal: 20, theme: 'dark', notifications: { reminders: true, hour: 19 } });` },
        { name: 'Never modifies the inputs', hidden: true, code: `const saved = { notifications: { reminders: false } }; const s = JSON.stringify(saved); const r = mergeSettings(defaults, saved); r.notifications.hour = 1; expect(JSON.stringify(defaults)).toBe(before); expect(JSON.stringify(saved)).toBe(s);` },
        {
          name: 'Works for any settings',
          hidden: true,
          code: `await sameAsRef('mergeSettings', () => {
          const d = { dailyGoal: rand.int(1, 50), theme: rand.pick(['dark', 'light']), notifications: { reminders: rand.bool(), hour: rand.int(0, 23) } };
          const saved = {};
          if (rand.bool()) saved.dailyGoal = rand.int(1, 50);
          if (rand.bool()) saved.theme = rand.pick(['dark', 'light', 'system']);
          if (rand.bool()) saved.notifications = rand.pick([{}, { hour: rand.int(0, 23) }, { reminders: rand.bool() }, { reminders: rand.bool(), hour: rand.int(0, 23) }]);
          return [d, saved];
        }, 40);`,
        },
      ],
    },
    {
      id: 'f2-fetchWithRetry',
      title: 'Fetch with retries',
      lesson: 10,
      language: 'js',
      exports: ['fetchWithRetry'],
      setup: `let calls = 0;
function fakeFetch(results) {
  globalThis.fetch = async (url) => {
    const next = results[Math.min(calls, results.length - 1)];
    calls++;
    if (next === 'network') throw new Error('Network down');
    if (next === 'ok') return { ok: true, status: 200, json: async () => ({ url }) };
    return { ok: false, status: next, json: async () => ({}) };
  };
}`,
      prompt: md(
        'Mobile networks fail. Write an async function `fetchWithRetry(url, retries)`:',
        '- Call `fetch(url)`. If the response is OK, return its parsed JSON.',
        '- If the request fails (it throws **or** the response is not OK), try again, up to `retries` more times.',
        '- If every attempt fails, throw an Error with the message `Failed after N attempts`, where N is the total number of attempts (`retries + 1`).',
        '- Stop as soon as one attempt succeeds.',
      ),
      starter: `async function fetchWithRetry(url, retries) {
  const response = await fetch(url);
  return response.json();
}
`,
      solution: `async function fetchWithRetry(url, retries) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch {
      // try again
    }
  }
  throw new Error('Failed after ' + (retries + 1) + ' attempts');
}
`,
      tests: [
        { name: 'Returns the data when the first attempt works', code: `fakeFetch(['ok']); expect(await fetchWithRetry('/words', 2)).toEqual({ url: '/words' }); expect(calls).toBe(1);` },
        { name: 'Retries after a network error', hidden: true, code: `fakeFetch(['network', 'ok']); expect(await fetchWithRetry('/w', 2)).toEqual({ url: '/w' }); expect(calls).toBe(2);` },
        { name: 'A non-OK status counts as a failure', hidden: true, code: `fakeFetch([500, 503, 'ok']); expect(await fetchWithRetry('/w', 2)).toEqual({ url: '/w' }); expect(calls).toBe(3);` },
        { name: 'Throws "Failed after 3 attempts"', hidden: true, code: `fakeFetch(['network']); await expect(() => fetchWithRetry('/w', 2)).toReject('Failed after 3 attempts'); expect(calls).toBe(3);` },
        { name: 'retries = 0 means one attempt', hidden: true, code: `fakeFetch([404]); await expect(() => fetchWithRetry('/w', 0)).toReject('Failed after 1 attempts'); expect(calls).toBe(1);` },
        {
          name: 'Works for any sequence of failures',
          hidden: true,
          code: `const attempt = async (fn, results, retries) => {
          calls = 0;
          fakeFetch(results);
          const outcome = await fn('/w' + retries, retries).then((value) => ({ value }), (e) => ({ error: e.message }));
          return { ...outcome, calls };
        };
        for (let i = 0; i < 20; i++) {
          const results = rand.list(rand.int(1, 6), () => rand.pick(['network', 500, 503, 404, 'ok']));
          const retries = rand.int(0, 4);
          const expected = await attempt(ref.fetchWithRetry, results, retries);
          const actual = await attempt(fetchWithRetry, results, retries);
          assert(JSON.stringify(actual) === JSON.stringify(expected), 'With responses ' + JSON.stringify(results) + ' and retries = ' + retries + ': expected ' + JSON.stringify(expected) + ', received ' + JSON.stringify(actual));
        }`,
        },
      ],
    },
  ],
};
