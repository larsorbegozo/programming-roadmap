import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final5: FinalExam = {
  phaseId: 'p5',
  minutes: 60,
  questions: [
    {
      id: 'f5-q1',
      lesson: 2,
      kind: 'single',
      prompt: 'What is `SafeAreaView` for?',
      options: ['Keeping content away from notches, rounded corners and the status bar', 'Encrypting what is on screen', 'Preventing crashes', 'Making views scroll'],
      answer: 0,
      explanation: 'Phones have screen areas that can hide content; safe-area insets tell you how much padding to add.',
    },
    {
      id: 'f5-q2',
      lesson: 8,
      kind: 'single',
      prompt: 'You render `<Image source={{ uri: "https://…/dog.png" }} />` and nothing appears. What is the most likely fix?',
      options: ['Give the image a width and height in its style', 'Use require() for remote images', 'Wrap it in a Text', 'Use an <img> tag'],
      answer: 0,
      explanation: 'React Native cannot know a remote image’s size in advance, so it renders it at 0 × 0 unless you set dimensions.',
    },
    {
      id: 'f5-q3',
      lesson: 7,
      kind: 'single',
      prompt: 'How do you read what the user types in a `TextInput`?',
      options: ['With the onChangeText prop, which receives the new text', 'With onClick', 'By reading input.value later', 'With document.getElementById'],
      answer: 0,
      explanation: 'Store it in state: `<TextInput value={text} onChangeText={setText} />`.',
    },
    {
      id: 'f5-q4',
      lesson: 3,
      kind: 'single',
      prompt: 'What is `keyExtractor` on a FlatList for?',
      options: ['Giving each row a unique, stable key so the list updates correctly', 'Sorting the rows', 'Extracting text for search', 'Encrypting list data'],
      answer: 0,
      explanation: 'It plays the same role as `key` when you map an array in React.',
    },
    {
      id: 'f5-q5',
      lesson: 5,
      kind: 'single',
      prompt: 'With Expo Router, how do you navigate to the screen for word 42 from code?',
      options: ["router.push('/words/42')", "window.location = '/words/42'", "navigate('WordScreen', 42)", 'You cannot navigate from code'],
      answer: 0,
      explanation: 'Use the `router` object (or the `<Link href="/words/42">` component) from expo-router.',
    },
    {
      id: 'f5-q6',
      lesson: 5,
      kind: 'single',
      prompt: 'What does a `_layout.tsx` that returns `<Stack />` give the screens in its folder?',
      options: ['Stack navigation: screens slide on top of each other with a back button', 'A tab bar', 'A drawer menu', 'Nothing until you register each screen'],
      answer: 0,
      explanation: 'Layouts wrap the routes in their folder. `<Tabs />` would give a tab bar instead.',
    },
    {
      id: 'f5-q7',
      lesson: 4,
      kind: 'single',
      prompt: 'What does `flex: 1` do on a View?',
      options: ['It takes all the remaining space of its parent along the main axis', 'It makes the view 1 pixel tall', 'It hides the view', 'It centres the children'],
      answer: 0,
      explanation: 'Two siblings with flex: 1 and flex: 2 split the space one third and two thirds.',
    },
    {
      id: 'f5-q8',
      lesson: 4,
      kind: 'single',
      prompt: 'In a View with the default column direction, what does `alignItems: "center"` do?',
      options: ['Centres the children horizontally', 'Centres the children vertically', 'Centres the text inside each child only', 'Nothing in React Native'],
      answer: 0,
      explanation: 'alignItems works on the cross axis, which is horizontal for a column.',
    },
    {
      id: 'f5-q9',
      lesson: 10,
      kind: 'single',
      prompt: 'How should you add a device module such as `expo-haptics` to the project?',
      options: ['npx expo install expo-haptics', 'npm install expo-haptics@latest', 'Copy the file from GitHub', 'It is included in every app automatically'],
      answer: 0,
      explanation: '`npx expo install` picks the version that matches your SDK.',
    },
    {
      id: 'f5-q10',
      lesson: 1,
      kind: 'single',
      prompt: 'You save a file while the app runs on your phone. What does Fast Refresh do?',
      options: ['Updates the app within a second or two, keeping component state when it can', 'Rebuilds and reinstalls the whole app', 'Nothing until you restart Expo', 'Clears all data on the phone'],
      answer: 0,
      explanation: 'It is why the edit–see loop in Expo is so quick.',
    },
  ],
  problems: [
    {
      id: 'f5-typingQuiz',
      title: 'Typing quiz screen',
      lesson: 7,
      language: 'rn',
      exports: ['TypingQuiz'],
      setup: `const word = { id: 'w1', term: 'Hund', translation: 'dog' };
const results = [];
const onResult = (correct) => results.push(correct);`,
      prompt: md(
        'Write a React Native component. `View`, `Text`, `TextInput`, `Pressable` and the React hooks are available without importing them.',
        '',
        'Build `TypingQuiz({ word, onResult })`:',
        '- Show the term in `<Text testID="term">`.',
        '- A `<TextInput testID="answer">` the user types into (use `onChangeText`).',
        '- A `Pressable` with `testID="check"`. When pressed:',
        '  - If the answer is empty (or only spaces), show `<Text testID="feedback">Type an answer first</Text>` and do nothing else.',
        '  - Otherwise compare it with `word.translation`, **ignoring case and surrounding spaces**. Show **Correct!** or **Not quite — dog** (with the real translation) in `testID="feedback"`, and call `onResult(true)` or `onResult(false)`.',
        '- `onResult` must be called **only once**, even if check is pressed again.',
      ),
      starter: `function TypingQuiz({ word, onResult }) {
  return (
    <View>
      <Text testID="term">{word.term}</Text>
      <TextInput testID="answer" />
      <Pressable testID="check">
        <Text>Check</Text>
      </Pressable>
    </View>
  );
}
`,
      solution: `function TypingQuiz({ word, onResult }) {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);

  const check = () => {
    if (done) return;
    const answer = text.trim().toLowerCase();
    if (!answer) {
      setFeedback('Type an answer first');
      return;
    }
    const correct = answer === word.translation.toLowerCase();
    setFeedback(correct ? 'Correct!' : 'Not quite — ' + word.translation);
    setDone(true);
    onResult(correct);
  };

  return (
    <View>
      <Text testID="term">{word.term}</Text>
      <TextInput testID="answer" value={text} onChangeText={setText} />
      <Pressable testID="check" onPress={check}>
        <Text>Check</Text>
      </Pressable>
      {feedback && <Text testID="feedback">{feedback}</Text>}
    </View>
  );
}
`,
      tests: [
        { name: 'A correct answer', code: `const r = render(h(TypingQuiz, { word, onResult })); r.type(r.byTestId('answer'), 'dog'); r.press(r.byTestId('check')); expect(r.textOf(r.byTestId('feedback'))).toBe('Correct!'); expect(results).toEqual([true]);` },
        { name: 'Ignores case and spaces', hidden: true, code: `const r = render(h(TypingQuiz, { word, onResult })); r.type(r.byTestId('answer'), '  DoG '); r.press(r.byTestId('check')); expect(r.textOf(r.byTestId('feedback'))).toBe('Correct!');` },
        { name: 'A wrong answer shows the translation', hidden: true, code: `const r = render(h(TypingQuiz, { word, onResult })); r.type(r.byTestId('answer'), 'cat'); r.press(r.byTestId('check')); expect(r.textOf(r.byTestId('feedback'))).toBe('Not quite — dog'); expect(results).toEqual([false]);` },
        { name: 'Empty answer: asks to type, no result', hidden: true, code: `const r = render(h(TypingQuiz, { word, onResult })); r.type(r.byTestId('answer'), '   '); r.press(r.byTestId('check')); expect(r.textOf(r.byTestId('feedback'))).toBe('Type an answer first'); expect(results).toEqual([]);` },
        { name: 'onResult is called only once', hidden: true, code: `const r = render(h(TypingQuiz, { word, onResult })); r.type(r.byTestId('answer'), 'dog'); r.press(r.byTestId('check')); r.press(r.byTestId('check')); expect(results).toEqual([true]);` },
      ],
    },
  ],
};
