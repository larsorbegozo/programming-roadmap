import type { FinalExam } from '../../types/checkpoint';
import { md } from '../checkpoints/md';

const SCHEMA = `PRAGMA foreign_keys = ON;
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE words (id INTEGER PRIMARY KEY, term TEXT NOT NULL, translation TEXT NOT NULL, category TEXT NOT NULL);
CREATE TABLE progress (
  user_id INTEGER NOT NULL REFERENCES users(id),
  word_id INTEGER NOT NULL REFERENCES words(id),
  mastered INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, word_id)
);
INSERT INTO users (id, name) VALUES (1, 'Ana'), (2, 'Ben'), (3, 'Cleo');
INSERT INTO words (id, term, translation, category) VALUES
  (1, 'Hund', 'dog', 'animals'), (2, 'Katze', 'cat', 'animals'), (3, 'Brot', 'bread', 'food'),
  (4, 'Apfel', 'apple', 'food'), (5, 'Milch', 'milk', 'food'), (6, 'Vogel', 'bird', 'animals'), (7, 'Rot', 'red', 'colors');
INSERT INTO progress (user_id, word_id, mastered) VALUES
  (1, 1, 1), (1, 2, 0), (1, 3, 1), (1, 7, 1), (2, 1, 1), (2, 4, 0);`;

const NOTE = md(
  'Your SQL runs on SQLite with this data:',
  '```sql',
  'users(id, name)                          -- 1 Ana, 2 Ben, 3 Cleo',
  'words(id, term, translation, category)   -- 7 words',
  'progress(user_id, word_id, mastered)     -- mastered is 1 or 0',
  '```',
);

export const final6: FinalExam = {
  phaseId: 'p6',
  minutes: 60,
  questions: [
    {
      id: 'f6-q1',
      lesson: 6,
      kind: 'single',
      prompt: 'What is the difference between `COUNT(*)` and `COUNT(column)`?',
      options: ['COUNT(column) skips rows where that column is NULL', 'There is no difference', 'COUNT(*) skips NULLs', 'COUNT(column) counts distinct values'],
      answer: 0,
      explanation: 'That is why `COUNT(progress.word_id)` after a LEFT JOIN gives 0 for users with no rows.',
    },
    {
      id: 'f6-q2',
      lesson: 6,
      kind: 'single',
      prompt: 'What does `HAVING` do that `WHERE` cannot?',
      options: ['Filter groups after aggregation, e.g. HAVING COUNT(*) > 2', 'Sort the results', 'Join two tables', 'Nothing; they are synonyms'],
      answer: 0,
      explanation: 'WHERE filters rows before grouping; HAVING filters the groups.',
    },
    {
      id: 'f6-q3',
      lesson: 7,
      kind: 'single',
      prompt: 'Why does `SELECT * FROM words WHERE category = NULL` return nothing, even if some categories are NULL?',
      options: ['Comparisons with NULL are never true; use `IS NULL`', 'NULL is not allowed in WHERE', 'You must write "NULL" in quotes', 'It returns every row'],
      answer: 0,
      explanation: 'NULL means "unknown", and unknown = unknown is not true.',
    },
    {
      id: 'f6-q4',
      lesson: 4,
      kind: 'single',
      prompt: '`progress.user_id` references `users(id) ON DELETE CASCADE`. What happens when a user is deleted?',
      options: ['Their progress rows are deleted automatically', 'The delete is refused', 'Their progress rows get user_id = NULL', 'Nothing happens to progress'],
      answer: 0,
      explanation: 'Without CASCADE, the database refuses to delete a user who still has progress rows.',
    },
    {
      id: 'f6-q5',
      lesson: 2,
      kind: 'single',
      prompt: 'What is an index for?',
      options: ['Making lookups on a column faster, at the cost of slightly slower writes', 'Numbering the rows', 'Encrypting a column', 'Preventing NULL values'],
      answer: 0,
      explanation: 'Index the columns you filter or join on often, such as progress.user_id.',
    },
    {
      id: 'f6-q6',
      lesson: 12,
      kind: 'single',
      prompt: "What SQL does `supabase.from('progress').select('*').eq('user_id', id)` correspond to?",
      options: ['SELECT * FROM progress WHERE user_id = id', 'INSERT INTO progress …', 'DELETE FROM progress WHERE user_id = id', 'SELECT * FROM progress ORDER BY user_id'],
      answer: 0,
      explanation: 'The client builds a query for you. Row Level Security still applies on top.',
    },
    {
      id: 'f6-q7',
      lesson: 11,
      kind: 'single',
      prompt: 'Which part of an RLS policy decides whether a user may INSERT a new row?',
      options: ['WITH CHECK (…)', 'USING (…)', 'ON DELETE', 'GRANT ALL'],
      answer: 0,
      explanation: 'USING filters existing rows (select, update, delete); WITH CHECK validates new or changed rows.',
    },
    {
      id: 'f6-q8',
      lesson: 10,
      kind: 'single',
      prompt: 'Where should Lyra store a user’s display name and daily goal when using Supabase Auth?',
      options: ['In a profiles table whose id references the auth user’s id', 'In the password field', 'Only on the phone', 'In the JWT token'],
      answer: 0,
      explanation: 'Supabase manages auth.users; your own table holds the app-specific data, protected by RLS.',
    },
    {
      id: 'f6-q9',
      lesson: 6,
      kind: 'single',
      prompt: "Why must you never build SQL by gluing user input into a string, like `\"SELECT * FROM words WHERE term = '\" + input + \"'\"`?",
      options: ['A crafted input can change the query (SQL injection)', 'It is slower', 'SQL does not support strings', 'It only works in Postgres'],
      answer: 0,
      explanation: 'Use parameterised queries or a client library such as Supabase’s, which escapes values for you.',
    },
  ],
  problems: [
    {
      id: 'f6-masteredPerUser',
      title: 'Mastered words per user',
      lesson: 7,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(NOTE, '', 'Return every user’s `name` and the number of words they have mastered as `mastered_count`. **Include users with 0.** Sort by name.'),
      starter: `SELECT users.name, COUNT(*) AS mastered_count
FROM users
JOIN progress ON progress.user_id = users.id
GROUP BY users.id;
`,
      solution: `SELECT users.name, COUNT(progress.word_id) AS mastered_count
FROM users
LEFT JOIN progress ON progress.user_id = users.id AND progress.mastered = 1
GROUP BY users.id
ORDER BY users.name;
`,
      tests: [
        { name: 'Counts mastered words per user', code: '' },
        { name: 'Still correct when Ben masters another word', hidden: true, code: `UPDATE progress SET mastered = 1 WHERE user_id = 2 AND word_id = 4; {{user}}` },
        { name: 'Still correct after Ana loses her progress', hidden: true, code: `DELETE FROM progress WHERE user_id = 1; {{user}}` },
      ],
    },
    {
      id: 'f6-neverStudied',
      title: 'Words nobody has studied',
      lesson: 7,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(NOTE, '', 'Return the `term` of every word that has **no progress rows at all** (no user has studied it), sorted by term.'),
      starter: `SELECT term FROM words ORDER BY term;
`,
      solution: `SELECT words.term
FROM words
LEFT JOIN progress ON progress.word_id = words.id
WHERE progress.word_id IS NULL
ORDER BY words.term;
`,
      tests: [
        { name: 'Returns the unstudied words', code: '' },
        { name: 'Updates when someone studies a word', hidden: true, code: `INSERT INTO progress (user_id, word_id, mastered) VALUES (3, 5, 0); {{user}}` },
        { name: 'A word studied by two users is still excluded once', hidden: true, code: `INSERT INTO progress (user_id, word_id, mastered) VALUES (3, 1, 0); {{user}}` },
      ],
    },
  ],
};
