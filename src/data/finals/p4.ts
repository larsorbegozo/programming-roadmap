import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final4: FinalExam = {
  phaseId: 'p4',
  minutes: 60,
  questions: [
    {
      id: 'f4-q1',
      lesson: 4,
      kind: 'single',
      prompt: 'Two sibling components both need the same list of words. Where should that state live?',
      options: ['In their closest common parent, passed down as props', 'Copied into each sibling', 'In a global variable', 'In whichever sibling renders first'],
      answer: 0,
      explanation: 'This is called "lifting state up": one owner, one source of truth.',
    },
    {
      id: 'f4-q2',
      lesson: 5,
      kind: 'single',
      prompt: 'What is a controlled input?',
      options: [
        'An input whose value comes from state and whose onChange updates that state',
        'An input that cannot be edited',
        'An input with validation',
        'An input rendered by the browser instead of React',
      ],
      answer: 0,
      explanation: '`<input value={query} onChange={(e) => setQuery(e.target.value)} />` keeps React as the single source of truth.',
    },
    {
      id: 'f4-q3',
      lesson: 9,
      kind: 'single',
      prompt: 'What is the difference between `useState(loadWords())` and `useState(() => loadWords())`?',
      options: [
        'The function form calls loadWords only on the first render; the other calls it on every render',
        'There is no difference',
        'The function form makes the state read-only',
        'The first one is invalid',
      ],
      answer: 0,
      explanation: 'The initial value is only used once, so passing a function avoids repeating expensive work.',
    },
    {
      id: 'f4-q4',
      lesson: 2,
      kind: 'text',
      prompt: 'What is `<>…</>` called in React? (One word.)',
      accept: ['Fragment', 'React.Fragment', 'fragments'],
      explanation: 'A Fragment groups children without adding an extra element to the page.',
    },
    {
      id: 'f4-q5',
      lesson: 3,
      kind: 'single',
      prompt: 'In `<Card>Hello</Card>`, how does Card read "Hello"?',
      options: ['Through the special `children` prop', 'Through `props.text`', 'With useState', 'It cannot'],
      answer: 0,
      explanation: 'Whatever you put between the opening and closing tags arrives as `children`.',
    },
    {
      id: 'f4-q6',
      lesson: 9,
      kind: 'single',
      prompt: 'Why write `setCount((c) => c + 1)` instead of `setCount(count + 1)`?',
      options: [
        'The updater receives the latest state, so several updates in a row all count',
        'It is faster',
        'It skips the re-render',
        'It is required inside useEffect',
      ],
      answer: 0,
      explanation: '`count` is a snapshot of the current render; the updater function always builds on the newest value.',
    },
    {
      id: 'f4-q7',
      lesson: 10,
      kind: 'single',
      prompt: 'When does the cleanup function returned by a `useEffect` run?',
      options: ['Before the effect runs again and when the component is removed', 'Only once, after the first render', 'Before the first render', 'Never automatically'],
      answer: 0,
      explanation: 'Cleanups cancel timers, subscriptions or requests that belong to the previous run.',
    },
    {
      id: 'f4-q8',
      lesson: 10,
      kind: 'single',
      prompt: 'An effect uses the `userId` prop but its dependency array is `[]`. What goes wrong when userId changes?',
      options: [
        'The effect does not run again, so it keeps using the old userId',
        'React throws an error',
        'The effect runs in a loop',
        'Nothing; React tracks it automatically',
      ],
      answer: 0,
      explanation: 'Every value from the component that the effect uses belongs in the dependency array.',
    },
    {
      id: 'f4-q9',
      lesson: 7,
      kind: 'single',
      prompt: 'What happens to a component’s state when its `key` changes?',
      options: ['React treats it as a new component and resets its state', 'Nothing', 'The state is copied to the new key', 'React throws a warning and keeps the old state'],
      answer: 0,
      explanation: 'Changing the key is a clean way to reset a form or a card when switching to a different word.',
    },
    {
      id: 'f4-q10',
      lesson: 3,
      kind: 'single',
      prompt: 'A child component needs to tell its parent that a word was mastered. How?',
      options: ['The parent passes a callback prop (like onMastered) that the child calls', 'The child edits the parent’s state variable directly', 'The child dispatches a DOM event', 'It is not possible in React'],
      answer: 0,
      explanation: 'Data flows down through props; events flow up through callbacks.',
    },
  ],
  problems: [
    {
      id: 'f4-searchList',
      title: 'Searchable word list',
      lesson: 5,
      language: 'jsx',
      exports: ['SearchableWordList'],
      setup: `const words = [
  { id: 'w1', term: 'Hund', translation: 'dog' },
  { id: 'w2', term: 'Katze', translation: 'cat' },
  { id: 'w3', term: 'Brot', translation: 'bread' },
  { id: 'w4', term: 'Kuh', translation: 'cow' },
];
const typeIn = (r, value) => r.type(r.findAll('input')[0], value);`,
      prompt: md(
        'Write a React component with JSX. `useState` and the other hooks are available without importing them.',
        '',
        'Build `SearchableWordList({ words })`:',
        '- A controlled `<input>` for the search text (starts empty).',
        '- A `<ul>` with one `<li>` per matching word, showing `term — translation`. A word matches if its term **or** translation contains the search text, **ignoring case**.',
        '- A `<p>` with `Showing X of Y` (for example `Showing 2 of 4`).',
        '- When nothing matches, show `No matches` instead of the list.',
      ),
      starter: `function SearchableWordList({ words }) {
  return (
    <div>
      <input />
      <ul>
        {words.map((w) => (
          <li key={w.id}>{w.term}</li>
        ))}
      </ul>
    </div>
  );
}
`,
      solution: `function SearchableWordList({ words }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const matches = words.filter((w) => w.term.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q));
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" />
      <p>Showing {matches.length} of {words.length}</p>
      {matches.length === 0 ? (
        <p>No matches</p>
      ) : (
        <ul>
          {matches.map((w) => (
            <li key={w.id}>
              {w.term} — {w.translation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
      tests: [
        { name: 'Shows every word at first', code: `const r = render(h(SearchableWordList, { words })); expect(r.findAll('li')).toHaveLength(4); expect(r.text()).toContain('Showing 4 of 4');` },
        { name: 'Typing filters the list', code: `const r = render(h(SearchableWordList, { words })); typeIn(r, 'K'); expect(r.findAll('li').map((li) => r.textOf(li).split(' ')[0])).toEqual(['Katze', 'Kuh']);` },
        { name: 'Search ignores case', hidden: true, code: `const r = render(h(SearchableWordList, { words })); typeIn(r, 'hUnD'); expect(r.findAll('li')).toHaveLength(1); expect(r.text()).toContain('Showing 1 of 4');` },
        { name: 'Matches the translation too', hidden: true, code: `const r = render(h(SearchableWordList, { words })); typeIn(r, 'brea'); expect(r.textOf(r.findAll('li')[0])).toContain('Brot');` },
        { name: 'No matches message', hidden: true, code: `const r = render(h(SearchableWordList, { words })); typeIn(r, 'zzz'); expect(r.text()).toContain('No matches'); expect(r.findAll('li')).toHaveLength(0); expect(r.text()).toContain('Showing 0 of 4');` },
        { name: 'The input is controlled', hidden: true, code: `const r = render(h(SearchableWordList, { words })); typeIn(r, 'Ku'); expect(r.findAll('input')[0].props.value).toBe('Ku');` },
        {
          name: 'Filters any list by any search',
          hidden: true,
          code: `const cap = (w) => w[0].toUpperCase() + w.slice(1);
        for (let round = 0; round < 8; round++) {
          const list = rand.distinct(rand.int(1, 8), () => cap(rand.word(4, 7))).map((term, i) => ({ id: 'id' + i, term, translation: rand.word(4, 7) }));
          const source = rand.pick(list);
          const text = rand.pick([source.term, source.translation]);
          const start = rand.int(0, text.length - 2);
          const fragment = text.slice(start, start + rand.int(1, 3));
          const query = rand.pick([fragment, fragment.toUpperCase(), ' ' + fragment + ' ', rand.word(5, 6), '']);
          const q = query.trim().toLowerCase();
          const expected = list.filter((w) => w.term.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q));
          const r = render(h(SearchableWordList, { words: list }));
          typeIn(r, query);
          const shown = r.findAll('li').map((li) => r.textOf(li));
          expect(shown.length).toBe(expected.length);
          expected.forEach((w, i) => expect(shown[i]).toContain(w.term));
          expect(r.text()).toContain('Showing ' + expected.length + ' of ' + list.length);
          if (expected.length === 0) expect(r.text()).toContain('No matches');
        }`,
        },
      ],
    },
  ],
};
