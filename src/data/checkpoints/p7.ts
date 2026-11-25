import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

export const p7: Checkpoint = {
  phaseId: 'p7',
  questions: [
    {
      id: 'p7-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Which are the three areas a change moves through in Git?',
      options: [
        'Working directory → staging area → repository (commits)',
        'Editor → terminal → GitHub',
        'Branch → merge → push',
        'Local → cloud → backup',
      ],
      answer: 0,
      explanation: 'You edit files (working directory), choose what to include with `git add` (staging area), then save a snapshot with `git commit` (repository).',
    },
    {
      id: 'p7-q2',
      lesson: 1,
      kind: 'text',
      prompt: 'Which command shows which files have changed and which are staged?',
      accept: ['git status'],
      explanation: '`git status` is the command to run whenever you are unsure what state you are in.',
    },
    {
      id: 'p7-q3',
      lesson: 3,
      kind: 'text',
      prompt: 'Which command stages **all** changes in the current folder?',
      accept: ['git add .', 'git add -A', 'git add --all'],
      explanation: '`git add .` stages everything under the current folder. Use `git add <file>` to stage a single file.',
    },
    {
      id: 'p7-q4',
      lesson: 3,
      kind: 'text',
      prompt: 'Write the command that commits the staged changes with the message `Add quiz screen`.',
      accept: ['git commit -m "Add quiz screen"'],
      explanation: '`-m` passes the message directly; the quotes are needed because the message has spaces. Without `-m`, Git opens an editor for you to write one.',
    },
    {
      id: 'p7-q5',
      lesson: 3,
      kind: 'single',
      prompt: 'Which is the best commit message?',
      options: ['Add multiple-choice quiz screen', 'stuff', 'fix', 'changes from today'],
      answer: 0,
      explanation: 'A good message says what the commit does, in the imperative ("Add…", "Fix…"), so the history reads like a changelog.',
    },
    {
      id: 'p7-q6',
      lesson: 4,
      kind: 'text',
      prompt: 'Write one command that creates a new branch called `feature/quiz` and switches to it.',
      accept: ['git switch -c feature/quiz', 'git checkout -b feature/quiz'],
      explanation: '`git switch -c` (or the older `git checkout -b`) creates the branch and moves you onto it.',
    },
    {
      id: 'p7-q7',
      lesson: 4,
      kind: 'single',
      prompt: 'What is a merge conflict?',
      options: [
        'Both branches changed the same lines, so Git cannot combine them automatically and you must choose the final content',
        'Two people pushed at the same time and one push was deleted',
        'A branch name that already exists',
        'An error that means the repository is corrupted',
      ],
      answer: 0,
      explanation: 'Git marks the conflicting lines with <<<<<<<, ======= and >>>>>>>. You edit the file, remove the markers, then add and commit.',
    },
    {
      id: 'p7-q8',
      lesson: 5,
      kind: 'single',
      prompt: 'What is the difference between `git push` and `git pull`?',
      options: [
        'push sends your local commits to the remote; pull downloads remote commits and merges them into your branch',
        'They do the same thing',
        'push deletes remote changes; pull deletes local ones',
        'pull creates a pull request on GitHub',
      ],
      answer: 0,
      explanation: 'Commits stay on your computer until you push. Pull before starting work if the remote may have changed.',
    },
    {
      id: 'p7-q9',
      lesson: 6,
      kind: 'text',
      prompt: 'Which command discards your uncommitted changes to the file `app.js`?',
      accept: ['git restore app.js', 'git checkout -- app.js', 'git checkout app.js'],
      explanation: '`git restore <file>` returns it to the last committed version. Those edits are gone for good, so be sure.',
    },
    {
      id: 'p7-q10',
      lesson: 6,
      kind: 'single',
      prompt: 'A bad commit is already pushed and others may have pulled it. How should you undo it?',
      options: [
        'git revert <commit>, which adds a new commit that undoes it',
        'git reset --hard and force-push',
        'Delete the repository and create it again',
        'Edit the files on GitHub to look like before',
      ],
      answer: 0,
      explanation: '`revert` keeps history intact, which is safe for shared branches. Rewriting shared history with reset and force-push breaks other people’s copies.',
    },
    {
      id: 'p7-q11',
      lesson: 9,
      kind: 'single',
      prompt: md(
        'Your app crashes with:',
        '```',
        "TypeError: Cannot read properties of undefined (reading 'term')",
        '    at renderCard (cards.js:12:20)',
        '    at showDeck (deck.js:30:5)',
        '```',
        'Where should you look first?',
      ),
      options: [
        'cards.js line 12, where code reads `.term` from a value that is undefined',
        'deck.js line 30, because it is the last line',
        'The CSS files',
        'package.json',
      ],
      answer: 0,
      explanation: 'The top of the stack trace is where the error happened. The lines below show who called it, which helps find where the undefined value came from.',
    },
    {
      id: 'p7-q12',
      lesson: 7,
      kind: 'single',
      prompt: 'What is the first step when fixing a bug?',
      options: [
        'Reproduce it reliably, so you can tell when it is fixed',
        'Rewrite the whole file',
        'Ask an AI to rewrite the app',
        'Add try/catch everywhere so the error disappears',
      ],
      answer: 0,
      explanation: 'Reproduce, isolate, fix, then verify. Hiding errors with try/catch does not fix the cause.',
    },
    {
      id: 'p7-q13',
      lesson: 8,
      kind: 'single',
      prompt: 'What is a unit test?',
      options: [
        'Code that automatically checks one small piece (such as a function) gives the expected result',
        'A manual check on a real phone',
        'A test that measures the app’s speed',
        'A review by another developer',
      ],
      answer: 0,
      explanation: 'Unit tests run in seconds, so you can run them after every change, including changes made by Claude Code.',
    },
    {
      id: 'p7-q14',
      lesson: 10,
      kind: 'single',
      prompt: 'Claude Code made a change that passes the tests, but you don’t understand one of the new functions. What should you do?',
      options: [
        'Ask it to explain the function, read it until you understand it, then accept or adjust it',
        'Accept it, since the tests pass',
        'Delete the function',
        'Ignore it and keep working',
      ],
      answer: 0,
      explanation: 'You are responsible for every line in Lyra. Code you don’t understand is code you can’t debug later.',
    },
  ],
  problems: [
    {
      id: 'p7-debug',
      title: 'Debug: find and fix the bugs',
      lesson: 7,
      language: 'js',
      exports: ['masteredPercentage'],
      setup: `const words = [
  { term: 'Hund', mastered: true },
  { term: 'Katze', mastered: false },
  { term: 'Brot', mastered: true },
  { term: 'Apfel', mastered: false },
];`,
      prompt: md(
        'This function should return the rounded percentage of mastered words (0 for an empty list), but it has **three bugs**.',
        '',
        'Find and fix them. Use `console.log` to inspect values: its output appears under the test results.',
      ),
      starter: `function masteredPercentage(words) {
  let mastered = 0;
  for (let i = 0; i <= words.length; i++) {
    if (words[i].mastered = true) {
      mastered++;
    }
  }
  return Math.round(mastered / words.length) * 100;
}
`,
      solution: `function masteredPercentage(words) {
  if (words.length === 0) return 0;
  let mastered = 0;
  for (let i = 0; i < words.length; i++) {
    if (words[i].mastered === true) {
      mastered++;
    }
  }
  return Math.round((mastered / words.length) * 100);
}
`,
      tests: [
        { name: '2 of 4 → 50', code: `expect(masteredPercentage(words)).toBe(50);` },
        { name: '2 of 3 → 67', code: `expect(masteredPercentage(words.slice(0, 3))).toBe(67);` },
        { name: '0 of 1 → 0', code: `expect(masteredPercentage([{ term: 'X', mastered: false }])).toBe(0);` },
        { name: 'Empty list → 0', code: `expect(masteredPercentage([])).toBe(0);` },
        { name: 'Does not change the words', code: `const copy = JSON.stringify(words); masteredPercentage(words); expect(JSON.stringify(words)).toBe(copy);` },
      ],
      hints: [
        'Look at the loop condition: which index is the last valid one?',
        '`=` assigns, `===` compares.',
        'Check the order of operations in the last line: what is rounded, and when?',
      ],
    },
    {
      id: 'p7-writeTests',
      title: 'Write tests that catch bugs',
      lesson: 8,
      language: 'js',
      exports: ['testNormalize'],
      setup: `const correct = (s) => s.trim().toLowerCase().replace(/\\s+/g, ' ');
const noTrim = (s) => s.toLowerCase().replace(/\\s+/g, ' ');
const noLower = (s) => s.trim().replace(/\\s+/g, ' ');
const noCollapse = (s) => s.trim().toLowerCase();
const broken = () => '';`,
      prompt: md(
        'Lyra compares typed answers with a function `normalizeAnswer(text)` that must:',
        '- remove spaces at the start and end,',
        '- convert to lowercase,',
        '- replace runs of several spaces inside the text with a single space.',
        '',
        'For example `normalizeAnswer("  Der   HUND ")` returns `"der hund"`.',
        '',
        'Your job is **not** to write that function. Write `testNormalize(normalizeAnswer)`, which **tests** whichever implementation it receives and returns `true` if it behaves correctly and `false` otherwise.',
        '',
        'The checker gives your function one correct implementation and several buggy ones. Your tests must accept the correct one and catch every bug.',
      ),
      starter: `function testNormalize(normalizeAnswer) {
  return normalizeAnswer('hund') === 'hund';
}
`,
      solution: `function testNormalize(normalizeAnswer) {
  const cases = [
    ['hund', 'hund'],
    ['  hund  ', 'hund'],
    ['HUND', 'hund'],
    ['der   hund', 'der hund'],
    ['  Der   HUND ', 'der hund'],
  ];
  return cases.every(([input, expected]) => normalizeAnswer(input) === expected);
}
`,
      tests: [
        { name: 'Accepts the correct implementation', code: `expect(testNormalize(correct)).toBe(true);` },
        { name: 'Catches a version that does not trim', code: `expect(testNormalize(noTrim)).toBe(false);` },
        { name: 'Catches a version that does not lowercase', code: `expect(testNormalize(noLower)).toBe(false);` },
        { name: 'Catches a version that does not collapse spaces', code: `expect(testNormalize(noCollapse)).toBe(false);` },
        { name: 'Catches a version that always returns ""', code: `expect(testNormalize(broken)).toBe(false);` },
      ],
      hints: ['Write one test case for each rule: an input that only that rule changes, and the expected output.', 'Store cases as `[input, expected]` pairs and check them all with `every`.'],
    },
  ],
};
