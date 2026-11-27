import type { FinalExam } from '../../types/checkpoint';

export const final11: FinalExam = {
  phaseId: 'p11',
  minutes: 45,
  questions: [
    {
      id: 'f11-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Lyra stores review events with a random user id instead of an email. Is that personal data?',
      options: ['Yes: pseudonymised data that can be linked back to a person is still personal data', 'No: without a name it is anonymous', 'Only if the user is in Germany', 'Only if it is shared with third parties'],
      answer: 0,
      explanation: 'Only truly anonymous data, which can no longer be linked to anyone, falls outside GDPR.',
    },
    {
      id: 'f11-q2',
      lesson: 2,
      kind: 'single',
      prompt: 'A user deletes their account. What should happen to their review events?',
      options: ['Delete them (or make them truly anonymous)', 'Keep them forever for statistics', 'Keep them but hide them in the app', 'Move them to another user'],
      answer: 0,
      explanation: 'Storage limitation: keep personal data only as long as it is needed for its purpose.',
    },
    {
      id: 'f11-q3',
      lesson: 6,
      kind: 'single',
      prompt: 'What does the right to data portability require?',
      options: ['Giving users their data in a structured, machine-readable format such as JSON', 'Letting users use the app on several phones', 'Printing the data on paper', 'Moving the data to another country'],
      answer: 0,
      explanation: 'An in-app export button that downloads JSON satisfies it neatly.',
    },
    {
      id: 'f11-q4',
      lesson: 3,
      kind: 'single',
      prompt: 'What does relying on "legitimate interests" require?',
      options: ['A balancing test showing your interest is not overridden by the user’s rights and expectations', 'Nothing; it is the default for apps', 'A signed contract', 'A payment from the user'],
      answer: 0,
      explanation: 'Write the balancing reasoning down; you may need to show it later.',
    },
    {
      id: 'f11-q5',
      lesson: 10,
      kind: 'single',
      prompt: 'You add a crash-reporting SDK. What else must change?',
      options: ['The privacy policy and the Data safety form must disclose the data it collects', 'Nothing; crash data is never personal', 'Only the app icon', 'The app must become paid'],
      answer: 0,
      explanation: 'SDKs collect data on your behalf, so you are responsible for disclosing it.',
    },
    {
      id: 'f11-q6',
      lesson: 8,
      kind: 'single',
      prompt: 'When is a Data Protection Impact Assessment (DPIA) needed?',
      options: ['When processing is likely to be high risk, for example large-scale processing of children’s data', 'For every app, before writing any code', 'Never for small developers', 'Only after a data breach'],
      answer: 0,
      explanation: 'It is a structured look at risks and how you reduce them.',
    },
    {
      id: 'f11-q7',
      lesson: 7,
      kind: 'single',
      prompt: 'Your analytics processor stores data in the United States. What does GDPR require for that transfer?',
      options: ['A valid transfer mechanism, such as the provider’s EU–US Data Privacy Framework certification or Standard Contractual Clauses', 'Nothing; the internet is global', 'The user’s phone number', 'Translating the privacy policy into English'],
      answer: 0,
      explanation: 'Check this in each processor’s DPA, and choose EU regions where you can.',
    },
    {
      id: 'f11-q8',
      lesson: 5,
      kind: 'single',
      prompt: 'What does "privacy by default" mean for Lyra’s settings?',
      options: ['The most privacy-friendly options are on by default, e.g. optional analytics start switched off', 'Every feature is enabled by default', 'Users must read the policy before each session', 'Data is stored only on the default server'],
      answer: 0,
      explanation: 'Users opt in to extras; they should never have to opt out of tracking.',
    },
  ],
  problems: [
    {
      id: 'f11-retention',
      title: 'Apply the retention policy',
      lesson: 2,
      language: 'ts',
      exports: ['applyRetention'],
      setup: `const e = (id, userId, at) => ({ id, userId, at });
const events = [
  e('1', 'ana', '2026-11-20T10:00:00Z'),
  e('2', 'ben', '2026-11-25T10:00:00Z'),
  e('3', 'ana', '2025-01-01T10:00:00Z'),
  e('4', 'cleo', '2026-06-01T10:00:00Z'),
];
const snapshot = JSON.stringify(events);`,
      prompt: [
        'Lyra’s privacy policy promises two things. Write `applyRetention(events, deletedUserIds, today, maxAgeDays)` returning the events that may be **kept**:',
        '',
        '- Remove every event of a user in `deletedUserIds`.',
        '- Remove events older than `maxAgeDays` days. An event’s date is the first 10 characters of `at` (YYYY-MM-DD); `today` is also YYYY-MM-DD. An event exactly `maxAgeDays` days old is kept.',
        '- Keep the original order and do not modify the input.',
        '',
        'Tip: `Date.parse("2026-11-20")` gives milliseconds; one day is 86,400,000 ms.',
      ].join('\n'),
      starter: `interface ReviewEvent {
  id: string;
  userId: string;
  at: string;
}

function applyRetention(events: ReviewEvent[], deletedUserIds: string[], today: string, maxAgeDays: number): ReviewEvent[] {
  return events;
}
`,
      solution: `interface ReviewEvent {
  id: string;
  userId: string;
  at: string;
}

const DAY_MS = 86_400_000;

function applyRetention(events: ReviewEvent[], deletedUserIds: string[], today: string, maxAgeDays: number): ReviewEvent[] {
  const deleted = new Set(deletedUserIds);
  const now = Date.parse(today);
  return events.filter((e) => {
    if (deleted.has(e.userId)) return false;
    const age = Math.round((now - Date.parse(e.at.slice(0, 10))) / DAY_MS);
    return age <= maxAgeDays;
  });
}
`,
      tests: [
        { name: 'Removes deleted users and old events', code: `expect(applyRetention(events, ['ben'], '2026-11-26', 365).map((x) => x.id)).toEqual(['1', '4']);` },
        { name: 'Exactly maxAgeDays old is kept', hidden: true, code: `expect(applyRetention([e('x', 'a', '2026-11-16T23:59:00Z')], [], '2026-11-26', 10).map((x) => x.id)).toEqual(['x']); expect(applyRetention([e('y', 'a', '2026-11-15T00:00:00Z')], [], '2026-11-26', 10)).toEqual([]);` },
        { name: 'Several deleted users', hidden: true, code: `expect(applyRetention(events, ['ana', 'cleo'], '2026-11-26', 10000).map((x) => x.id)).toEqual(['2']);` },
        { name: 'Does not modify the input', hidden: true, code: `expect(applyRetention(events, ['ana'], '2026-11-26', 1).map((x) => x.id)).toEqual(['2']); expect(JSON.stringify(events)).toBe(snapshot);` },
        {
          name: 'Works for any events, users and dates',
          hidden: true,
          code: `await sameAsRef('applyRetention', () => {
          const users = rand.distinct(rand.int(1, 4), () => rand.word(3, 5));
          const day = () => '2026-' + String(rand.int(1, 11)).padStart(2, '0') + '-' + String(rand.int(1, 28)).padStart(2, '0');
          const list = rand.list(rand.int(0, 10), (i) => e(String(i), rand.pick(users), day() + 'T' + String(rand.int(0, 23)).padStart(2, '0') + ':' + String(rand.int(0, 59)).padStart(2, '0') + ':00Z'));
          return [list, users.filter(() => rand.next() < 0.3), '2026-11-' + String(rand.int(1, 28)).padStart(2, '0'), rand.int(0, 200)];
        }, 40);`,
        },
      ],
      typeTests: [{ name: 'Returns ReviewEvent[]', code: `const r: ReviewEvent[] = applyRetention([], [], '2026-01-01', 30);` }],
    },
  ],
};
