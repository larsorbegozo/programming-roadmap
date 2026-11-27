import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const RN_NOTE =
  'Write a React Native component. `View`, `Text`, `Pressable`, `FlatList`, `StyleSheet` and the React hooks are available without importing them. The tests find elements by their `testID` and press them.';

const DECK = `const words = [
  { id: 'w1', term: 'Hund', translation: 'dog' },
  { id: 'w2', term: 'Katze', translation: 'cat' },
  { id: 'w3', term: 'Brot', translation: 'bread' },
];
const question = { prompt: 'Hund', options: ['cat', 'dog', 'bread'], answerIndex: 1 };`;

export const p5: Checkpoint = {
  phaseId: 'p5',
  questions: [
    {
      id: 'p5-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Which command creates a new Expo app?',
      options: ['npx create-expo-app@latest', 'npm install expo-app', 'expo new app', 'git clone expo'],
      answer: 0,
      explanation: '`npx create-expo-app@latest` downloads the latest project template and installs its dependencies.',
    },
    {
      id: 'p5-q2',
      lesson: 2,
      kind: 'single',
      prompt: 'In React Native, where must every piece of text be?',
      options: ['Inside a <Text> component', 'Inside a <View> directly', 'Inside a <p> tag', 'Anywhere, like on the web'],
      answer: 0,
      explanation: 'There is no HTML on a phone. Text rendered outside `<Text>` throws an error.',
    },
    {
      id: 'p5-q3',
      lesson: 4,
      kind: 'single',
      prompt: 'What is the default `flexDirection` in React Native?',
      options: ['column', 'row', 'row-reverse', 'There is no default'],
      answer: 0,
      explanation: 'On the web the default is row; in React Native it is column, because phone screens are tall.',
    },
    {
      id: 'p5-q4',
      lesson: 4,
      kind: 'single',
      prompt: 'In a View with the default flexDirection, what does `justifyContent: "center"` centre?',
      options: ['The children vertically (along the main axis)', 'The children horizontally', 'The text inside each child', 'Nothing; it is a web-only property'],
      answer: 0,
      explanation: '`justifyContent` works along the main axis, which is vertical for a column. `alignItems` works on the cross axis.',
    },
    {
      id: 'p5-q5',
      lesson: 4,
      kind: 'single',
      prompt: 'What unit is `padding: 16` in a React Native style?',
      options: ['Density-independent pixels; you write a plain number', 'CSS pixels; you must write "16px"', 'Percent', 'Points, only on iOS'],
      answer: 0,
      explanation: 'React Native styles use unitless numbers that scale with the screen density.',
    },
    {
      id: 'p5-q6',
      lesson: 3,
      kind: 'single',
      prompt: 'You need to show a list of 5,000 vocabulary words. Which component should you use?',
      options: ['FlatList, because it only renders the rows visible on screen', 'ScrollView with a map over all words', 'A View for each word', 'Text with line breaks'],
      answer: 0,
      explanation: 'ScrollView renders every child at once, which is slow for long lists. FlatList virtualises the list.',
    },
    {
      id: 'p5-q7',
      lesson: 7,
      kind: 'single',
      prompt: 'Which prop does `Pressable` use to react to a tap?',
      options: ['onPress', 'onClick', 'onTap', 'onTouch'],
      answer: 0,
      explanation: 'React Native uses `onPress`. `onClick` belongs to the web.',
    },
    {
      id: 'p5-q8',
      lesson: 5,
      kind: 'single',
      prompt: 'With Expo Router, what does the file `app/words/[id].tsx` create?',
      options: [
        'A dynamic route like /words/42; the screen reads the id with useLocalSearchParams()',
        'A screen that lists every word',
        'A file you must register manually in a navigator',
        'An API endpoint',
      ],
      answer: 0,
      explanation: 'Square brackets mark a dynamic segment. Each file in `app/` becomes a screen automatically.',
    },
    {
      id: 'p5-q9',
      lesson: 6,
      kind: 'single',
      prompt: 'Two screens need the same list of mastered words. What is a good first approach?',
      options: [
        'Keep the state in a shared parent or a React Context and pass it down',
        'Copy the list into each screen’s state and keep them in sync manually',
        'Store it in a global variable',
        'Save it to a file after every change and re-read it',
      ],
      answer: 0,
      explanation: 'Lift shared state to the closest common owner. Context avoids passing it through many levels.',
    },
    {
      id: 'p5-q10',
      lesson: 10,
      kind: 'single',
      prompt: 'How do you run different code on iOS and Android?',
      options: ["Check Platform.OS === 'ios'", 'Check window.navigator', 'Write two separate apps', 'It is impossible in React Native'],
      answer: 0,
      explanation: '`Platform.OS` is "ios" or "android". `Platform.select({ ios: …, android: … })` is a shortcut for values.',
    },
    {
      id: 'p5-q11',
      lesson: 9,
      kind: 'single',
      prompt: 'Why are native-driven animations (for example with Reanimated) smoother?',
      options: [
        'They run on the UI thread, so they keep moving even when JavaScript is busy',
        'They use less colour',
        'They skip frames on purpose',
        'They only run on iOS',
      ],
      answer: 0,
      explanation: 'If an animation depends on the JavaScript thread, any heavy work there makes it stutter.',
    },
    {
      id: 'p5-q12',
      lesson: 8,
      kind: 'single',
      prompt: 'How do you show a local image file bundled with the app?',
      options: ["<Image source={require('./assets/dog.png')} />", '<img src="./assets/dog.png" />', "<Image src='dog.png' />", '<View image="dog.png" />'],
      answer: 0,
      explanation: '`require` tells the bundler to include the file. Remote images use `source={{ uri: "https://…" }}` and need a width and height.',
    },
  ],
  problems: [
    {
      id: 'p5-counter',
      title: 'Project 1: Counter app',
      lesson: 1,
      language: 'rn',
      exports: ['Counter'],
      prompt: md(
        RN_NOTE,
        '',
        'Build `Counter()`:',
        '- Show the current count (starting at 0) in `<Text testID="count">`.',
        '- Three buttons made with `Pressable`, each containing a `<Text>`: **+1**, **-1** and **Reset**.',
        '- The count can never go below 0.',
      ),
      starter: `function Counter() {
  let count = 0;
  return (
    <View>
      <Text testID="count">{count}</Text>
      <Pressable onPress={() => { count = count + 1; }}>
        <Text>+1</Text>
      </Pressable>
    </View>
  );
}
`,
      solution: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <View style={styles.container}>
      <Text testID="count">{count}</Text>
      <Pressable onPress={() => setCount(count + 1)}>
        <Text>+1</Text>
      </Pressable>
      <Pressable onPress={() => setCount(Math.max(0, count - 1))}>
        <Text>-1</Text>
      </Pressable>
      <Pressable onPress={() => setCount(0)}>
        <Text>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
`,
      tests: [
        { name: 'Starts at 0', code: `const r = render(h(Counter)); expect(r.textOf(r.byTestId('count'))).toBe('0');` },
        { name: '+1 increases the count', code: `const r = render(h(Counter)); r.press(r.byText('+1')); r.press(r.byText('+1')); expect(r.textOf(r.byTestId('count'))).toBe('2');` },
        { name: '-1 decreases the count', code: `const r = render(h(Counter)); r.press(r.byText('+1')); r.press(r.byText('+1')); r.press(r.byText('-1')); expect(r.textOf(r.byTestId('count'))).toBe('1');` },
        { name: 'The count never goes below 0', code: `const r = render(h(Counter)); r.press(r.byText('-1')); expect(r.textOf(r.byTestId('count'))).toBe('0');` },
        { name: 'Reset goes back to 0', code: `const r = render(h(Counter)); r.press(r.byText('+1')); r.press(r.byText('+1')); r.press(r.byText('Reset')); expect(r.textOf(r.byTestId('count'))).toBe('0');` },
        {
          name: 'Any sequence of presses',
          code: `for (let round = 0; round < 5; round++) {
          const r = render(h(Counter));
          let expected = 0;
          for (let i = rand.int(5, 25); i > 0; i--) {
            const button = rand.pick(['+1', '+1', '-1', 'Reset']);
            r.press(r.byText(button));
            expected = button === '+1' ? expected + 1 : button === '-1' ? Math.max(0, expected - 1) : 0;
            expect(r.textOf(r.byTestId('count'))).toBe(String(expected));
          }
        }`,
        },
      ],
      hints: ['A plain variable resets on every render. Use `useState`.', '`Math.max(0, n)` returns n, but never less than 0.'],
    },
    {
      id: 'p5-flashcards',
      title: 'Project 2: Vocabulary flashcards',
      lesson: 6,
      language: 'rn',
      exports: ['Flashcards'],
      setup: DECK,
      prompt: md(
        RN_NOTE,
        '',
        'Build `Flashcards({ words })` that shows one card at a time:',
        '- `<Text testID="term">` with the current term.',
        '- `<Text testID="progress">` showing the position, like `1 / 3`.',
        '- A `Pressable` with `testID="flip"`: shows the translation in `<Text testID="translation">`, and hides it again on the next press.',
        '- A `Pressable` with `testID="next"`: moves to the next card (after the last card, back to the first) and hides the translation.',
        '- If `words` is empty, render only `<Text>No cards</Text>`.',
      ),
      starter: `function Flashcards({ words }) {
  const word = words[0];
  return (
    <View>
      <Text testID="term">{word.term}</Text>
      <Text testID="translation">{word.translation}</Text>
    </View>
  );
}
`,
      solution: `function Flashcards({ words }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (words.length === 0) return <Text>No cards</Text>;
  const word = words[index];

  return (
    <View>
      <Text testID="progress">{index + 1} / {words.length}</Text>
      <Text testID="term">{word.term}</Text>
      {flipped && <Text testID="translation">{word.translation}</Text>}
      <Pressable testID="flip" onPress={() => setFlipped(!flipped)}>
        <Text>{flipped ? 'Hide' : 'Show'}</Text>
      </Pressable>
      <Pressable
        testID="next"
        onPress={() => {
          setIndex((index + 1) % words.length);
          setFlipped(false);
        }}
      >
        <Text>Next</Text>
      </Pressable>
    </View>
  );
}
`,
      tests: [
        { name: 'Shows the first term and progress', code: `const r = render(h(Flashcards, { words })); expect(r.textOf(r.byTestId('term'))).toBe('Hund'); expect(r.textOf(r.byTestId('progress'))).toBe('1 / 3');` },
        { name: 'The translation is hidden at first', code: `const r = render(h(Flashcards, { words })); expect(r.queryByTestId('translation')).toBeNull();` },
        { name: 'Flip shows and hides the translation', code: `const r = render(h(Flashcards, { words })); r.press(r.byTestId('flip')); expect(r.textOf(r.byTestId('translation'))).toBe('dog'); r.press(r.byTestId('flip')); expect(r.queryByTestId('translation')).toBeNull();` },
        { name: 'Next moves to the next card and hides the translation', code: `const r = render(h(Flashcards, { words })); r.press(r.byTestId('flip')); r.press(r.byTestId('next')); expect(r.textOf(r.byTestId('term'))).toBe('Katze'); expect(r.textOf(r.byTestId('progress'))).toBe('2 / 3'); expect(r.queryByTestId('translation')).toBeNull();` },
        { name: 'After the last card it wraps to the first', code: `const r = render(h(Flashcards, { words })); r.press(r.byTestId('next')); r.press(r.byTestId('next')); r.press(r.byTestId('next')); expect(r.textOf(r.byTestId('term'))).toBe('Hund');` },
        { name: 'Empty deck shows "No cards"', code: `const r = render(h(Flashcards, { words: [] })); expect(r.text()).toBe('No cards');` },
        {
          name: 'Any deck and any presses',
          code: `const cap = (w) => w[0].toUpperCase() + w.slice(1);
        for (let round = 0; round < 5; round++) {
          const deck = rand.distinct(rand.int(1, 6), () => cap(rand.word(4, 7))).map((term, i) => ({ id: 'w' + i, term, translation: rand.word(4, 7) }));
          const r = render(h(Flashcards, { words: deck }));
          let index = 0;
          let flipped = false;
          for (let i = rand.int(5, 20); i > 0; i--) {
            const button = rand.pick(['flip', 'next']);
            r.press(r.byTestId(button));
            if (button === 'flip') flipped = !flipped;
            else {
              index = (index + 1) % deck.length;
              flipped = false;
            }
            expect(r.textOf(r.byTestId('term'))).toBe(deck[index].term);
            expect(r.textOf(r.byTestId('progress'))).toBe(index + 1 + ' / ' + deck.length);
            if (flipped) expect(r.textOf(r.byTestId('translation'))).toBe(deck[index].translation);
            else expect(r.queryByTestId('translation')).toBeNull();
          }
        }`,
        },
      ],
      hints: [
        'You need two pieces of state: the current index and whether the card is flipped.',
        'The remainder operator wraps around: `(index + 1) % words.length`.',
        'Hooks must be called before any early `return`.',
      ],
    },
    {
      id: 'p5-quiz',
      title: 'Project 3: Multiple-choice quiz',
      lesson: 7,
      language: 'rn',
      exports: ['Quiz'],
      setup: DECK,
      prompt: md(
        RN_NOTE,
        '',
        "Build `Quiz({ question })`, where `question` looks like `{ prompt: 'Hund', options: ['cat', 'dog', 'bread'], answerIndex: 1 }`:",
        '- Show the prompt in `<Text testID="prompt">`.',
        '- Show each option as a `Pressable` with `testID="option-0"`, `"option-1"`, … containing the option text.',
        '- After the first press, show `<Text testID="feedback">`: **Correct!** if right, otherwise **Wrong — the answer is dog** (with the correct option).',
        '- After answering, further presses do nothing (the first answer counts).',
      ),
      starter: `function Quiz({ question }) {
  return (
    <View>
      <Text testID="prompt">{question.prompt}</Text>
      {question.options.map((option, i) => (
        <Pressable key={option} testID={'option-' + i}>
          <Text>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}
`,
      solution: `function Quiz({ question }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;
  const correct = selected === question.answerIndex;

  return (
    <View>
      <Text testID="prompt">{question.prompt}</Text>
      {question.options.map((option, i) => (
        <Pressable key={option} testID={'option-' + i} onPress={() => { if (!answered) setSelected(i); }}>
          <Text>{option}</Text>
        </Pressable>
      ))}
      {answered && (
        <Text testID="feedback">
          {correct ? 'Correct!' : 'Wrong — the answer is ' + question.options[question.answerIndex]}
        </Text>
      )}
    </View>
  );
}
`,
      tests: [
        { name: 'Shows the prompt and options', code: `const r = render(h(Quiz, { question })); expect(r.textOf(r.byTestId('prompt'))).toBe('Hund'); expect(r.textOf(r.byTestId('option-2'))).toBe('bread');` },
        { name: 'No feedback before answering', code: `const r = render(h(Quiz, { question })); expect(r.queryByTestId('feedback')).toBeNull();` },
        { name: 'The right option shows "Correct!"', code: `const r = render(h(Quiz, { question })); r.press(r.byTestId('option-1')); expect(r.textOf(r.byTestId('feedback'))).toBe('Correct!');` },
        { name: 'A wrong option shows the right answer', code: `const r = render(h(Quiz, { question })); r.press(r.byTestId('option-0')); expect(r.textOf(r.byTestId('feedback'))).toBe('Wrong — the answer is dog');` },
        { name: 'Only the first answer counts', code: `const r = render(h(Quiz, { question })); r.press(r.byTestId('option-0')); r.press(r.byTestId('option-1')); expect(r.textOf(r.byTestId('feedback'))).toBe('Wrong — the answer is dog');` },
        {
          name: 'Any question and any answers',
          code: `for (let round = 0; round < 8; round++) {
          const options = rand.distinct(rand.int(2, 5), () => rand.word(3, 7));
          const q = { prompt: rand.word(4, 8), options, answerIndex: rand.int(0, options.length - 1) };
          const r = render(h(Quiz, { question: q }));
          expect(r.textOf(r.byTestId('prompt'))).toBe(q.prompt);
          options.forEach((option, i) => expect(r.textOf(r.byTestId('option-' + i))).toBe(option));
          const first = rand.int(0, options.length - 1);
          r.press(r.byTestId('option-' + first));
          r.press(r.byTestId('option-' + rand.int(0, options.length - 1)));
          expect(r.textOf(r.byTestId('feedback'))).toBe(first === q.answerIndex ? 'Correct!' : 'Wrong — the answer is ' + options[q.answerIndex]);
        }`,
        },
      ],
      hints: ['Store the selected option index in state, starting as `null`.', 'In `onPress`, only update the state if nothing has been selected yet.'],
    },
  ],
};
