import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

export const final7: FinalExam = {
  phaseId: 'p7',
  minutes: 45,
  questions: [
    { id: 'f7-q1', lesson: 3, kind: 'text', prompt: 'Which command shows the history of commits?', accept: ['git log', 'git log --oneline'], explanation: '`git log --oneline` shows one compact line per commit.' },
    { id: 'f7-q2', lesson: 3, kind: 'text', prompt: 'Which command shows, line by line, the changes you have not staged yet?', accept: ['git diff'], explanation: '`git diff --staged` shows what is staged instead.' },
    {
      id: 'f7-q3',
      lesson: 2,
      kind: 'single',
      prompt: 'What is the `.gitignore` file for?',
      options: ['Listing files Git should not track, such as node_modules and .env', 'Listing people who cannot push', 'Hiding the repository on GitHub', 'Ignoring merge conflicts'],
      answer: 0,
      explanation: 'Dependencies can be reinstalled and secrets must never be committed, so both belong in .gitignore.',
    },
    {
      id: 'f7-q4',
      lesson: 6,
      kind: 'single',
      prompt: 'What does `git commit --amend` do, and when should you avoid it?',
      options: [
        'It replaces the last commit; avoid it on commits you have already pushed and shared',
        'It adds a comment to a commit; it is always safe',
        'It deletes the last commit; use it to undo a push',
        'It merges two branches',
      ],
      answer: 0,
      explanation: 'Amending rewrites history. Rewriting shared history causes problems for anyone who already has the old commit.',
    },
    { id: 'f7-q5', lesson: 4, kind: 'text', prompt: 'You are on `main`. Which command merges the branch `feature/quiz` into it?', accept: ['git merge feature/quiz'], explanation: 'Merge brings the other branch’s commits into the one you are on.' },
    {
      id: 'f7-q6',
      lesson: 5,
      kind: 'single',
      prompt: 'What is a pull request on GitHub?',
      options: ['A proposal to merge one branch into another, with a place to review and discuss the changes', 'A command that downloads changes', 'A request to access a private repository', 'An automatic backup'],
      answer: 0,
      explanation: 'Even working alone, PRs give you a clear view of a change before it lands on main.',
    },
    {
      id: 'f7-q7',
      lesson: 6,
      kind: 'single',
      prompt: 'You have half-finished changes and need to switch branches quickly. Which command shelves them temporarily?',
      options: ['git stash', 'git reset --hard', 'git revert', 'git clean'],
      answer: 0,
      explanation: '`git stash` saves them aside; `git stash pop` brings them back.',
    },
    {
      id: 'f7-q8',
      lesson: 7,
      kind: 'single',
      prompt: 'What does a breakpoint do in a debugger?',
      options: ['Pauses the program at that line so you can inspect variables', 'Deletes the line', 'Stops the program permanently', 'Marks the line as a bug in Git'],
      answer: 0,
      explanation: 'From a breakpoint you can step line by line and watch values change.',
    },
    {
      id: 'f7-q9',
      lesson: 8,
      kind: 'single',
      prompt: 'Which is an essential property of a good unit test?',
      options: ['It gives the same result every time it runs (deterministic)', 'It takes several minutes', 'It depends on the internet', 'It tests the whole app at once'],
      answer: 0,
      explanation: 'A test that fails randomly ("flaky") teaches you to ignore failures.',
    },
    {
      id: 'f7-q10',
      lesson: 10,
      kind: 'single',
      prompt: 'You asked Claude Code for a one-line bug fix and it changed 40 files. What should you do?',
      options: ['Review the diff, reject unrelated changes and ask for a focused fix', 'Accept it all, since it compiled', 'Delete the repository', 'Push it straight to main'],
      answer: 0,
      explanation: 'Small, focused changes are easy to review and easy to revert.',
    },
  ],
  problems: [
    {
      id: 'f7-bisect',
      title: 'Find the first bad commit',
      lesson: 7,
      language: 'js',
      exports: ['findFirstBadCommit'],
      setup: `const commits = Array.from({ length: 100 }, (_, i) => 'c' + i);
function checker(firstBad) {
  const checker = { calls: 0, isBad: (c) => { checker.calls++; return Number(c.slice(1)) >= firstBad; } };
  return checker;
}`,
      prompt: md(
        'A bug appeared somewhere in the history. `commits` is ordered from oldest to newest: every commit before a certain point is good, and that commit and every one after it are bad. The last commit is always bad.',
        '',
        'Write `findFirstBadCommit(commits, isBad)` that returns the **first bad commit**. `isBad(commit)` is slow (imagine it builds and tests the app), so call it **as few times as possible**: like `git bisect`, cut the search range in half each time.',
        '',
        'With 100 commits you may call `isBad` at most 8 times.',
      ),
      starter: `function findFirstBadCommit(commits, isBad) {
  for (const commit of commits) {
    if (isBad(commit)) return commit;
  }
}
`,
      solution: `function findFirstBadCommit(commits, isBad) {
  let low = 0;
  let high = commits.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (isBad(commits[mid])) high = mid;
    else low = mid + 1;
  }
  return commits[low];
}
`,
      tests: [
        { name: 'Finds the first bad commit', code: `expect(findFirstBadCommit(commits, checker(37).isBad)).toBe('c37');` },
        { name: 'Bug in the very first commit', hidden: true, code: `expect(findFirstBadCommit(commits, checker(0).isBad)).toBe('c0');` },
        { name: 'Only the last commit is bad', hidden: true, code: `expect(findFirstBadCommit(commits, checker(99).isBad)).toBe('c99');` },
        { name: 'Uses at most 8 checks for 100 commits', hidden: true, code: `for (const bad of [1, 50, 73, 98]) { const c = checker(bad); expect(findFirstBadCommit(commits, c.isBad)).toBe('c' + bad); expect(c.calls <= 8).toBe(true); }` },
        { name: 'Works with a single commit', hidden: true, code: `expect(findFirstBadCommit(['only'], () => true)).toBe('only');` },
      ],
    },
  ],
};
