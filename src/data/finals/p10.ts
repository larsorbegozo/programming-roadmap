import type { FinalExam } from '../../types/checkpoint';

export const final10: FinalExam = {
  phaseId: 'p10',
  minutes: 45,
  questions: [
    {
      id: 'f10-q1',
      lesson: 1,
      kind: 'single',
      prompt: 'Which policy lets every signed-in user read the `words` content table?',
      options: [
        'create policy "read words" on words for select to authenticated using (true);',
        'alter table words disable row level security;',
        'create policy "read words" on words for all using (true);',
        'grant all on words to anon;',
      ],
      answer: 0,
      explanation: 'Read-only and only for authenticated users. Disabling RLS or allowing "all" would also allow writes.',
    },
    {
      id: 'f10-q2',
      lesson: 2,
      kind: 'single',
      prompt: 'Which key bypasses Row Level Security?',
      options: ['The service_role key', 'The anon (publishable) key', 'A signed-in user’s session token', 'The project URL'],
      answer: 0,
      explanation: 'That is why it only ever lives in server code.',
    },
    {
      id: 'f10-q3',
      lesson: 3,
      kind: 'single',
      prompt: 'An Edge Function computes league XP. What must it do?',
      options: ['Verify the caller’s session and compute XP from the events stored in the database', 'Trust the XP value in the request body', 'Return XP without checking who is asking', 'Read XP from the app’s local storage'],
      answer: 0,
      explanation: 'The server only trusts what it can verify.',
    },
    {
      id: 'f10-q4',
      lesson: 2,
      kind: 'single',
      prompt: 'How do you keep the `.env` file with your keys out of Git?',
      options: ['List it in .gitignore', 'Rename it to .env.txt', 'Make the repository private', 'Delete it before every commit'],
      answer: 0,
      explanation: 'Commit a `.env.example` with empty values so you remember which variables exist.',
    },
    {
      id: 'f10-q5',
      lesson: 4,
      kind: 'single',
      prompt: 'Lyra will have paid subscriptions. Can you use a word list licensed CC BY-NC?',
      options: ['No: NC forbids commercial use', 'Yes, with attribution', 'Yes, CC means free for everything', 'Only on Android'],
      answer: 0,
      explanation: 'BY = attribution, SA = share-alike, NC = non-commercial, ND = no derivatives.',
    },
    {
      id: 'f10-q6',
      lesson: 4,
      kind: 'single',
      prompt: 'What does CC0 (public domain dedication) require?',
      options: ['Nothing; attribution is appreciated but not required', 'Attribution', 'Share-alike', 'Non-commercial use only'],
      answer: 0,
      explanation: 'Still record the source in the pack metadata, so you can show where it came from.',
    },
    {
      id: 'f10-q7',
      lesson: 5,
      kind: 'single',
      prompt: 'During the 14-day closed test, a tester opts out on day 10. What happens?',
      options: ['They stop counting; you need 12 testers opted in continuously for the last 14 days', 'Nothing; they already counted', 'The test is cancelled', 'Google adds a replacement tester'],
      answer: 0,
      explanation: 'Recruit a few more than 12 so that drop-outs do not reset your clock.',
    },
    {
      id: 'f10-q8',
      lesson: 7,
      kind: 'single',
      prompt: 'Why does CLAUDE.md say to ask before adding any dependency?',
      options: ['Every dependency adds code you must trust, update and keep compatible', 'Dependencies are illegal on Google Play', 'Claude Code cannot install packages', 'npm charges per package'],
      answer: 0,
      explanation: 'Fewer dependencies means fewer security issues and fewer version conflicts.',
    },
  ],
  problems: [
    {
      id: 'f10-rlsAudit',
      title: 'Audit a migration for missing RLS',
      lesson: 1,
      language: 'ts',
      exports: ['tablesWithoutRls'],
      setup: `const migration = \`
create table words (id uuid primary key, term text not null);
alter table words enable row level security;

create table if not exists public.review_events (id uuid primary key, user_id uuid not null);

CREATE TABLE Profiles (id uuid primary key);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
\`;`,
      prompt: [
        'Your CLAUDE.md requires RLS on every table. Write `tablesWithoutRls(sql)` that reads a migration file and returns the names of tables that are **created** but never get `enable row level security`.',
        '',
        '- Table creation looks like `create table name`, `create table if not exists name` or with a schema prefix `public.name`.',
        '- RLS looks like `alter table name enable row level security` (also possibly with `public.`).',
        '- SQL keywords and table names are case-insensitive: return names in **lowercase**, without the schema, **sorted** alphabetically.',
      ].join('\n'),
      starter: `function tablesWithoutRls(sql: string): string[] {
  return [];
}
`,
      solution: `function tablesWithoutRls(sql: string): string[] {
  const text = sql.toLowerCase();
  const created = [...text.matchAll(/create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(?:public\\.)?([a-z_][a-z0-9_]*)/g)].map((m) => m[1]);
  const secured = new Set(
    [...text.matchAll(/alter\\s+table\\s+(?:public\\.)?([a-z_][a-z0-9_]*)\\s+enable\\s+row\\s+level\\s+security/g)].map((m) => m[1]),
  );
  return [...new Set(created)].filter((t) => !secured.has(t)).sort();
}
`,
      tests: [
        { name: 'Finds the table without RLS', code: `expect(tablesWithoutRls(migration)).toEqual(['review_events']);` },
        { name: 'A fully secured migration → []', hidden: true, code: `expect(tablesWithoutRls('create table a (id int); alter table a enable row level security; create table b (id int);')).toEqual(['b']);` },
        { name: 'Several missing tables, sorted', hidden: true, code: `expect(tablesWithoutRls('CREATE TABLE zeta (x int); create table alpha (x int); create table mid (x int); alter table mid enable row level security;')).toEqual(['alpha', 'zeta']);` },
        { name: 'Handles extra whitespace and newlines', hidden: true, code: `expect(tablesWithoutRls('create   table\\n  public.notes (id int);\\nalter table\\n  notes\\n  enable row level security;\\ncreate\\ttable tags (id int);')).toEqual(['tags']);` },
        { name: 'Tables are reported once', hidden: true, code: `expect(tablesWithoutRls('create table if not exists x (id int); create table if not exists x (id int);')).toEqual(['x']);` },
      ],
      typeTests: [{ name: 'Returns string[]', code: `const r: string[] = tablesWithoutRls('');` }],
    },
  ],
};
