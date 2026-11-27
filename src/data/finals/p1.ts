import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final1: FinalExam = {
  phaseId: 'p1',
  minutes: 25,
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
    {
      id: 'f1-q12',
      lesson: 10,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'function makeAdder(a) {', '  return (b) => a + b;', '}', 'const add5 = makeAdder(5);', 'console.log(add5(3) + add5(10));', '```'),
      accept: ['23'],
      explanation: 'Each call to `add5` remembers `a = 5`: 8 + 15 = 23.',
    },
    {
      id: 'f1-q13',
      lesson: 8,
      kind: 'text',
      prompt: md('What does this print?', '```js', 'let total = 0;', 'for (let i = 1; i <= 5; i++) {', '  if (i === 3) continue;', '  total += i;', '}', 'console.log(total);', '```'),
      accept: ['12'],
      explanation: '`continue` skips 3, so the total is 1 + 2 + 4 + 5 = 12.',
    },
    {
      id: 'f1-q14',
      lesson: 4,
      kind: 'text',
      prompt: md(
        'What does this print? (Write the word.)',
        '```js',
        "const level = 'B1';",
        "let label = '';",
        'switch (level) {',
        "  case 'A1':",
        "  case 'A2':",
        "    label = 'beginner';",
        '    break;',
        "  case 'B1':",
        "    label = 'intermediate';",
        "  case 'B2':",
        "    label = 'upper';",
        '    break;',
        '}',
        'console.log(label);',
        '```',
      ),
      accept: ['upper'],
      explanation: "The `B1` case has no `break`, so execution falls through into `B2` and overwrites the label with 'upper'.",
    },
  ],
  problems: [],
  project: {
    minutes: 40,
    problem: {
      id: 'f1-project-deck',
      title: 'Mini-project: a vocabulary deck',
      lesson: 10,
      language: 'js',
      exports: ['createDeck'],
      prompt: md(
        'Build the core of Lyra’s vocabulary deck using everything from this unit: variables, conditionals, functions, arrays, objects, loops, array methods and closures.',
        '',
        '`createDeck()` returns a deck object. The words must live **inside a closure**: there is no `deck.words` property, and nobody outside can change them. The deck has these methods:',
        '',
        '1. `add(term, translation, category)`: trims the three texts and stores a word `{ term, translation, category, correct: 0, wrong: 0 }`. Returns `false` (and stores nothing) if any text is empty or a word with the same term already exists **ignoring case**. Otherwise returns `true`.',
        '2. `answer(term, guess)`: finds the word by term ignoring case. Returns `null` if it does not exist. Otherwise compares the guess with the translation, **ignoring case and surrounding spaces**, adds 1 to `correct` or `wrong`, and returns `true` or `false`.',
        '3. `stats()`: returns `{ total, mastered, accuracy, byCategory }`:',
        '   - `total`: number of words',
        '   - `mastered`: words with **at least 3** correct answers and more correct than wrong answers',
        '   - `accuracy`: percentage of correct answers over all answers, rounded to a whole number (`0` if there are no answers yet)',
        '   - `byCategory`: an object counting words per category',
        '4. `hardest(n)`: the terms of words with at least one wrong answer, sorted by `wrong` from most to fewest (ties alphabetically), at most `n` of them.',
        '5. `list()`: returns the words as **copies**, so changing them does not change the deck.',
        '',
        'The example tests only check the basics; more tests run when you submit.',
      ),
      starter: `function createDeck() {
  // Keep the words in a closure

  return {
    add(term, translation, category) {},
    answer(term, guess) {},
    stats() {},
    hardest(n) {},
    list() {},
  };
}
`,
      solution: `function createDeck() {
  const words = [];

  const find = (term) => words.find((w) => w.term.toLowerCase() === term.trim().toLowerCase());

  return {
    add(term, translation, category) {
      const t = term.trim();
      const tr = translation.trim();
      const c = category.trim();
      if (!t || !tr || !c) return false;
      if (find(t)) return false;
      words.push({ term: t, translation: tr, category: c, correct: 0, wrong: 0 });
      return true;
    },
    answer(term, guess) {
      const word = find(term);
      if (!word) return null;
      const ok = guess.trim().toLowerCase() === word.translation.toLowerCase();
      if (ok) word.correct++;
      else word.wrong++;
      return ok;
    },
    stats() {
      let correct = 0;
      let answers = 0;
      const byCategory = {};
      for (const w of words) {
        correct += w.correct;
        answers += w.correct + w.wrong;
        byCategory[w.category] = (byCategory[w.category] || 0) + 1;
      }
      return {
        total: words.length,
        mastered: words.filter((w) => w.correct >= 3 && w.correct > w.wrong).length,
        accuracy: answers === 0 ? 0 : Math.round((correct / answers) * 100),
        byCategory,
      };
    },
    hardest(n) {
      return words
        .filter((w) => w.wrong > 0)
        .sort((a, b) => b.wrong - a.wrong || a.term.localeCompare(b.term))
        .slice(0, n)
        .map((w) => w.term);
    },
    list() {
      return words.map((w) => ({ ...w }));
    },
  };
}
`,
      setup: `function filled() {
  const deck = createDeck();
  deck.add('Hund', 'dog', 'animals');
  deck.add('Katze', 'cat', 'animals');
  deck.add('Brot', 'bread', 'food');
  return deck;
}`,
      tests: [
        { name: 'Example: add and list', code: `const deck = filled(); expect(deck.list().map((w) => w.term)).toEqual(['Hund', 'Katze', 'Brot']); expect(deck.list()[0]).toEqual({ term: 'Hund', translation: 'dog', category: 'animals', correct: 0, wrong: 0 });` },
        { name: 'Example: answer', code: `const deck = filled(); expect(deck.answer('Hund', 'dog')).toBe(true); expect(deck.answer('Hund', 'cat')).toBe(false);` },
        { name: 'Example: stats', code: `const deck = filled(); deck.answer('Hund', 'dog'); expect(deck.stats()).toEqual({ total: 3, mastered: 0, accuracy: 100, byCategory: { animals: 2, food: 1 } });` },
        { name: 'add trims and rejects duplicates ignoring case', hidden: true, code: `const deck = createDeck(); expect(deck.add('  Hund ', ' dog ', ' animals ')).toBe(true); expect(deck.add('HUND', 'dog', 'animals')).toBe(false); expect(deck.list()).toEqual([{ term: 'Hund', translation: 'dog', category: 'animals', correct: 0, wrong: 0 }]);` },
        { name: 'add rejects empty texts', hidden: true, code: `const deck = createDeck(); expect(deck.add('', 'dog', 'animals')).toBe(false); expect(deck.add('Hund', '   ', 'animals')).toBe(false); expect(deck.add('Hund', 'dog', '')).toBe(false); expect(deck.list()).toEqual([]);` },
        { name: 'answer ignores case and spaces, finds terms ignoring case', hidden: true, code: `const deck = filled(); expect(deck.answer('katze', '  CAT ')).toBe(true); expect(deck.list()[1].correct).toBe(1);` },
        { name: 'answer returns null for unknown words', hidden: true, code: `const deck = filled(); expect(deck.answer('Zug', 'train')).toBeNull();` },
        { name: 'stats: mastered needs 3+ correct and more correct than wrong', hidden: true, code: `const deck = filled(); for (let i = 0; i < 3; i++) deck.answer('Hund', 'dog'); for (let i = 0; i < 3; i++) deck.answer('Katze', 'cat'); for (let i = 0; i < 3; i++) deck.answer('Katze', 'x'); expect(deck.stats().mastered).toBe(1);` },
        { name: 'stats: accuracy is rounded and 0 without answers', hidden: true, code: `const deck = filled(); expect(deck.stats().accuracy).toBe(0); deck.answer('Hund', 'dog'); deck.answer('Hund', 'x'); deck.answer('Brot', 'bread'); expect(deck.stats().accuracy).toBe(67);` },
        { name: 'hardest: most wrong first, ties alphabetical, limited, no zero-wrong words', hidden: true, code: `const deck = filled(); deck.answer('Katze', 'x'); deck.answer('Katze', 'x'); deck.answer('Brot', 'x'); deck.answer('Hund', 'x'); deck.answer('Hund', 'dog'); expect(deck.hardest(5)).toEqual(['Katze', 'Brot', 'Hund']); expect(deck.hardest(1)).toEqual(['Katze']); expect(filled().hardest(3)).toEqual([]);` },
        { name: 'The words are private (closure, copies)', hidden: true, code: `const deck = filled(); expect(deck.words).toBeUndefined(); const copy = deck.list(); copy[0].correct = 99; copy.push({ term: 'X' }); expect(deck.list()).toHaveLength(3); expect(deck.list()[0].correct).toBe(0);` },
        { name: 'Every deck is independent', hidden: true, code: `const a = filled(); const b = createDeck(); expect(b.list()).toEqual([]); b.add('Zug', 'train', 'travel'); expect(a.stats().total).toBe(3);` },
        {
          name: 'Behaves like the reference deck for any sequence of actions',
          hidden: true,
          code: `for (let round = 0; round < 20; round++) {
          const mine = createDeck();
          const theirs = ref.createDeck();
          const terms = rand.distinct(4, () => rand.word(3, 6));
          const translations = terms.map(() => rand.word(3, 6));
          const categories = rand.distinct(2, () => rand.word(3, 6));
          const vary = (text) => ' '.repeat(rand.int(0, 1)) + (rand.bool() ? text.toUpperCase() : text) + ' '.repeat(rand.int(0, 1));
          for (let step = 0; step < 25; step++) {
            const i = rand.int(0, terms.length - 1);
            const action = rand.pick(['add', 'add', 'answer', 'answer', 'answer', 'stats', 'hardest', 'list']);
            let args;
            if (action === 'add') args = [vary(terms[i]), rand.int(0, 9) === 0 ? '  ' : vary(translations[i]), vary(rand.pick(categories))];
            else if (action === 'answer') args = [vary(rand.int(0, 5) === 0 ? rand.word() : terms[i]), vary(rand.bool() ? translations[i] : rand.word())];
            else if (action === 'hardest') args = [rand.int(0, 5)];
            else args = [];
            const expected = theirs[action](...args);
            const actual = mine[action](...args);
            assert(JSON.stringify(actual) === JSON.stringify(expected), \`\${action}(\${args.map((a) => JSON.stringify(a)).join(', ')}) should return \${JSON.stringify(expected)}, received \${JSON.stringify(actual)}\`);
          }
        }`,
        },
      ],
    },
  },
};
