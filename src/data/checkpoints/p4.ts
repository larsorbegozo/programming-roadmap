import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const WORDS = `const words = [
  { id: 'w1', term: 'Hund', translation: 'dog', mastered: true },
  { id: 'w2', term: 'Katze', translation: 'cat', mastered: false },
  { id: 'w3', term: 'Brot', translation: 'bread', mastered: false },
];
const word = words[0];
const snapshot = JSON.stringify(words);`;

const RENDER_NOTE = 'Write a React component with JSX. `useState` and the other hooks are available without importing them. The tests render your component and click its buttons.';

export const p4: Checkpoint = {
  phaseId: 'p4',
  questions: [
    {
      id: 'p4-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'What is a React component?',
      options: ['A function that returns JSX describing a piece of UI', 'An HTML file', 'A CSS class', 'A database table'],
      answer: 0,
      explanation: 'Components are functions. React calls them and uses the JSX they return to build the screen.',
    },
    {
      id: 'p4-q2',
      lesson: 1,
      kind: 'single',
      prompt: 'Why must component names start with a capital letter, like `VocabCard`?',
      options: [
        'JSX treats lowercase names as built-in HTML tags, so `<vocabCard />` would not render your component',
        'It is only a style convention with no effect',
        'Capitalised functions run faster',
        'TypeScript requires it for all functions',
      ],
      answer: 0,
      explanation: '`<div>` is an HTML element; `<VocabCard>` is your component. The capital letter is how JSX tells them apart.',
    },
    {
      id: 'p4-q3',
      lesson: 2,
      kind: 'single',
      prompt: 'In JSX, how do you set a CSS class on an element?',
      options: ['className="card"', 'class="card"', 'cssClass="card"', 'style="card"'],
      answer: 0,
      explanation: '`class` is a reserved word in JavaScript, so JSX uses `className`.',
    },
    {
      id: 'p4-q4',
      lesson: 3,
      kind: 'single',
      prompt: 'Can a child component change the props it receives?',
      options: [
        'No. Props are read-only; the parent changes them by re-rendering with new values',
        'Yes, by assigning to props.value',
        'Only if the prop is an object',
        'Only inside useEffect',
      ],
      answer: 0,
      explanation: 'Data flows down. To change something, the parent passes a callback prop (like `onMastered`) that the child calls.',
    },
    {
      id: 'p4-q5',
      lesson: 4,
      kind: 'single',
      prompt: 'Why can’t a normal `let count = 0` inside a component be used as state?',
      options: [
        'It is reset on every render, and changing it does not tell React to re-render',
        'let is not allowed inside components',
        'Numbers cannot be state',
        'It works exactly like useState',
      ],
      answer: 0,
      explanation: 'React calls your component function again on every render. `useState` keeps the value between renders and triggers a re-render when it changes.',
    },
    {
      id: 'p4-q6',
      lesson: 9,
      kind: 'single',
      prompt: 'Which is the correct way to add `newWord` to a `words` state array?',
      options: ['setWords([...words, newWord])', 'words.push(newWord)', 'setWords(words.push(newWord))', 'words = [...words, newWord]'],
      answer: 0,
      explanation: 'State must be replaced, not mutated. `push` changes the existing array (and returns a number), so React may not notice.',
    },
    {
      id: 'p4-q7',
      lesson: 9,
      kind: 'text',
      prompt: md(
        '`count` starts at 0. What is `count` after one click?',
        '```jsx',
        'const [count, setCount] = useState(0);',
        'function handleClick() {',
        '  setCount(count + 1);',
        '  setCount(count + 1);',
        '}',
        '```',
      ),
      accept: ['1'],
      explanation: 'Both calls read the same `count` (0) from this render, so both set it to 1. Use `setCount((c) => c + 1)` to build on the latest value.',
    },
    {
      id: 'p4-q8',
      lesson: 5,
      kind: 'single',
      prompt: 'Which onClick is correct for calling `reveal(word.id)` when the button is clicked?',
      options: ['onClick={() => reveal(word.id)}', 'onClick={reveal(word.id)}', 'onClick="reveal(word.id)"', 'onClick={reveal}(word.id)'],
      answer: 0,
      explanation: '`onClick={reveal(word.id)}` calls the function immediately during render. You must pass a function that React will call later.',
    },
    {
      id: 'p4-q9',
      lesson: 7,
      kind: 'single',
      prompt: 'What is the best `key` for items in a list of vocabulary words?',
      options: ['A stable unique id such as word.id', 'The array index', 'Math.random()', 'The word’s translation'],
      answer: 0,
      explanation: 'Keys tell React which item is which between renders. Indexes break when items are reordered or removed, random keys change every render, and translations can repeat.',
    },
    {
      id: 'p4-q10',
      lesson: 6,
      kind: 'single',
      prompt: md('`count` is 0. What does this render?', '```jsx', '<div>{count && <p>You have words to review</p>}</div>', '```'),
      options: ['The number 0', 'Nothing', 'The paragraph', 'An error'],
      answer: 0,
      explanation: '`0 && …` evaluates to 0, and React renders numbers. Use `count > 0 && …` instead.',
    },
    {
      id: 'p4-q11',
      lesson: 10,
      kind: 'single',
      prompt: 'When does `useEffect(fn, [])` run?',
      options: ['Once after the component first appears (and its cleanup when it disappears)', 'Before every render', 'After every render', 'Only when the user clicks'],
      answer: 0,
      explanation: 'An empty dependency array means "nothing this effect depends on can change". In development Strict Mode React runs it twice on purpose to reveal missing cleanups.',
    },
    {
      id: 'p4-q12',
      lesson: 10,
      kind: 'single',
      prompt: 'You need the list of mastered words, derived from a `words` prop. What should you do?',
      options: [
        'Compute it during render: const mastered = words.filter((w) => w.mastered)',
        'Copy it into state with useEffect whenever words changes',
        'Store it in a global variable',
        'Fetch it from the server again',
      ],
      answer: 0,
      explanation: 'Values that can be calculated from props or state should be calculated during render. Syncing them with an effect adds bugs and extra renders.',
    },
    {
      id: 'p4-q13',
      lesson: 8,
      kind: 'single',
      prompt: 'Which is a rule of hooks?',
      options: [
        'Call hooks only at the top level of a component, never inside conditions or loops',
        'Hooks can only be used in class components',
        'Each component can use only one hook',
        'Hooks must be called inside event handlers',
      ],
      answer: 0,
      explanation: 'React identifies each hook by the order it is called. Calling a hook conditionally changes that order and breaks state.',
    },
  ],
  problems: [
    {
      id: 'p4-vocabCard',
      title: 'Vocabulary card that reveals the translation',
      lesson: 5,
      language: 'jsx',
      exports: ['VocabCard'],
      setup: WORDS,
      prompt: md(
        RENDER_NOTE,
        '',
        'Build `VocabCard({ word })` that shows a word as a flashcard:',
        '- The `term` inside an `<h3>`.',
        '- A `<button>` with the text **Show translation**.',
        '- Clicking it shows the `translation` in a `<p>`, and the button text changes to **Hide translation**.',
        '- Clicking again hides the translation.',
        '',
        "`word` looks like `{ id: 'w1', term: 'Hund', translation: 'dog', mastered: true }`.",
      ),
      starter: `function VocabCard({ word }) {
  // Add state so the button reveals and hides the translation
  return (
    <div>
      <h3>{word.term}</h3>
      <button>Show translation</button>
    </div>
  );
}
`,
      solution: `function VocabCard({ word }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div>
      <h3>{word.term}</h3>
      {revealed && <p>{word.translation}</p>}
      <button onClick={() => setRevealed(!revealed)}>
        {revealed ? 'Hide translation' : 'Show translation'}
      </button>
    </div>
  );
}
`,
      tests: [
        { name: 'The term is in an <h3>', code: `const r = render(h(VocabCard, { word })); expect(r.textOf(r.findAll('h3')[0] ?? '')).toBe('Hund');` },
        { name: 'The translation is hidden at first', code: `const r = render(h(VocabCard, { word })); expect(r.text()).not.toContain('dog');` },
        { name: 'Clicking shows the translation', code: `const r = render(h(VocabCard, { word })); r.click(r.byText('Show translation', 'button')); expect(r.text()).toContain('dog'); expect(r.findAll('p').length).toBe(1);` },
        { name: 'The button then says Hide translation', code: `const r = render(h(VocabCard, { word })); r.click(r.byText('Show translation', 'button')); expect(r.queryByText('Hide translation', 'button')).toBeTruthy();` },
        { name: 'Clicking again hides it', code: `const r = render(h(VocabCard, { word })); r.click(r.byText('Show translation', 'button')); r.click(r.byText('Hide translation', 'button')); expect(r.text()).not.toContain('dog'); expect(r.queryByText('Show translation', 'button')).toBeTruthy();` },
      ],
      hints: ['You need one piece of state: whether the translation is revealed (true or false).', 'Use `{revealed && <p>…</p>}` to render the paragraph only when revealed.'],
    },
    {
      id: 'p4-wordList',
      title: 'Render a list of words',
      lesson: 7,
      language: 'jsx',
      exports: ['WordList'],
      setup: WORDS,
      prompt: md(
        RENDER_NOTE,
        '',
        'Build `WordList({ words })`:',
        '- Render a `<ul>` with one `<li>` per word, showing the term and the translation (for example `Hund — dog`).',
        '- Give every `<li>` a proper **key**.',
        '- If the list is empty, render `<p>No words yet</p>` instead.',
      ),
      starter: `function WordList({ words }) {
  return (
    <ul>
      {words.map((word) => (
        <li>{word.term}</li>
      ))}
    </ul>
  );
}
`,
      solution: `function WordList({ words }) {
  if (words.length === 0) return <p>No words yet</p>;
  return (
    <ul>
      {words.map((word) => (
        <li key={word.id}>
          {word.term} — {word.translation}
        </li>
      ))}
    </ul>
  );
}
`,
      tests: [
        { name: 'One <li> per word', code: `const r = render(h(WordList, { words })); expect(r.findAll('li')).toHaveLength(3);` },
        { name: 'Each item shows the term and translation', code: `const r = render(h(WordList, { words })); const first = r.textOf(r.findAll('li')[0]); expect(first).toContain('Hund'); expect(first).toContain('dog');` },
        { name: 'Every list item has a key', code: `expect(keylessListItems(WordList({ words }))).toBe(0);` },
        { name: 'Empty list shows "No words yet"', code: `const r = render(h(WordList, { words: [] })); expect(r.text()).toContain('No words yet'); expect(r.findAll('li')).toHaveLength(0);` },
      ],
      hints: ['Add `key={word.id}` to the element returned inside `map`.', 'You can `return` early from a component: `if (words.length === 0) return …;`.'],
    },
    {
      id: 'p4-masteryTracker',
      title: 'Mastery tracker with state',
      lesson: 9,
      language: 'jsx',
      exports: ['MasteryTracker'],
      setup: WORDS,
      prompt: md(
        RENDER_NOTE,
        '',
        'Build `MasteryTracker({ words })`:',
        '- Show a `<p>` with the text `Mastered: X of Y (Z%)`, for example `Mastered: 1 of 3 (33%)` (percentage rounded).',
        '- Show each word in an `<li>` with its term and a `<button>`.',
        '- The button says **Mark mastered** for words that are not mastered yet. Clicking it marks the word as mastered and the stats update.',
        '- For mastered words the button says **Mastered** and is `disabled`.',
        '- Keep mastery in **state**. Do not modify the `words` prop.',
      ),
      starter: `function MasteryTracker({ words }) {
  const mastered = words.filter((w) => w.mastered).length;
  return (
    <div>
      <p>Mastered: {mastered} of {words.length}</p>
      <ul>
        {words.map((word) => (
          <li key={word.id}>
            {word.term}
            <button onClick={() => { word.mastered = true; }}>Mark mastered</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`,
      solution: `function MasteryTracker({ words }) {
  const [masteredIds, setMasteredIds] = useState(() => words.filter((w) => w.mastered).map((w) => w.id));
  const percent = words.length === 0 ? 0 : Math.round((masteredIds.length / words.length) * 100);
  return (
    <div>
      <p>Mastered: {masteredIds.length} of {words.length} ({percent}%)</p>
      <ul>
        {words.map((word) => {
          const done = masteredIds.includes(word.id);
          return (
            <li key={word.id}>
              {word.term}
              <button disabled={done} onClick={() => setMasteredIds([...masteredIds, word.id])}>
                {done ? 'Mastered' : 'Mark mastered'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
`,
      tests: [
        { name: 'Shows the initial stats', code: `const r = render(h(MasteryTracker, { words })); expect(r.text()).toContain('Mastered: 1 of 3 (33%)');` },
        { name: 'Marking a word updates the stats', code: `const r = render(h(MasteryTracker, { words })); r.click(r.byText('Mark mastered', 'button')); expect(r.text()).toContain('Mastered: 2 of 3 (67%)');` },
        { name: 'Marked words show a disabled "Mastered" button', code: `const r = render(h(MasteryTracker, { words })); const count = () => r.findAll('button').filter((b) => r.textOf(b) === 'Mark mastered').length; expect(count()).toBe(2); r.click(r.byText('Mark mastered', 'button')); expect(count()).toBe(1); const done = r.findAll('button').filter((b) => r.textOf(b) === 'Mastered'); expect(done.length).toBe(2); expect(done.every((b) => b.props.disabled === true)).toBe(true);` },
        { name: 'All mastered → 100%', code: `const r = render(h(MasteryTracker, { words })); r.click(r.byText('Mark mastered', 'button')); r.click(r.byText('Mark mastered', 'button')); expect(r.text()).toContain('Mastered: 3 of 3 (100%)');` },
        { name: 'The words prop is not modified', code: `const r = render(h(MasteryTracker, { words })); r.click(r.byText('Mark mastered', 'button')); expect(JSON.stringify(words)).toBe(snapshot);` },
      ],
      hints: [
        'Store the ids of mastered words in state, initialised from the prop: `useState(() => words.filter(…).map(…))`.',
        'Derive the counts and percentage from that state during render; do not store them separately.',
      ],
    },
  ],
};
