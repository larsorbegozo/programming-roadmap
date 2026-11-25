import type { Checkpoint } from '../../types/checkpoint';
import { md } from './md';

const SCHEMA = `PRAGMA foreign_keys = ON;
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE words (id INTEGER PRIMARY KEY, term TEXT NOT NULL, translation TEXT NOT NULL, category TEXT NOT NULL);
CREATE TABLE progress (
  user_id INTEGER NOT NULL REFERENCES users(id),
  word_id INTEGER NOT NULL REFERENCES words(id),
  mastered INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, word_id)
);
INSERT INTO users (id, name) VALUES (1, 'Ana'), (2, 'Ben');
INSERT INTO words (id, term, translation, category) VALUES
  (1, 'Hund', 'dog', 'animals'),
  (2, 'Katze', 'cat', 'animals'),
  (3, 'Brot', 'bread', 'food'),
  (4, 'Apfel', 'apple', 'food'),
  (5, 'Milch', 'milk', 'food'),
  (6, 'Vogel', 'bird', 'animals'),
  (7, 'Rot', 'red', 'colors');
INSERT INTO progress (user_id, word_id, mastered) VALUES
  (1, 1, 1), (1, 2, 0), (1, 3, 1), (1, 7, 1),
  (2, 1, 1), (2, 4, 0);`;

const SCHEMA_NOTE = md(
  'Your SQL runs on a real SQLite database (the same standard SQL works in Postgres and Supabase). It contains:',
  '```sql',
  'users(id, name)                          -- 1 Ana, 2 Ben',
  'words(id, term, translation, category)   -- 7 words: animals, food, colors',
  'progress(user_id, word_id, mastered)     -- mastered is 1 or 0',
  '```',
);

export const p6: Checkpoint = {
  phaseId: 'p6',
  questions: [
    {
      id: 'p6-q1',
      lesson: 3,
      kind: 'single',
      prompt: 'What is a primary key for?',
      options: ['It uniquely identifies each row in a table', 'It encrypts the table', 'It sorts the table alphabetically', 'It is the password for the database'],
      answer: 0,
      explanation: 'No two rows can share a primary key, so you can always point at exactly one row.',
    },
    {
      id: 'p6-q2',
      lesson: 4,
      kind: 'single',
      prompt: '`progress.word_id` is a foreign key referencing `words.id`. What does that guarantee?',
      options: [
        'Every progress row points to a word that actually exists',
        'Every word has at least one progress row',
        'word_id values are unique',
        'Words are deleted automatically every day',
      ],
      answer: 0,
      explanation: 'The database rejects a progress row whose word_id does not match any word. This is called referential integrity.',
    },
    {
      id: 'p6-q3',
      lesson: 5,
      kind: 'single',
      prompt: 'A user can study many words, and a word can be studied by many users. What relationship is that, and how is it stored?',
      options: [
        'Many-to-many, stored with a join table such as progress(user_id, word_id)',
        'One-to-one, stored with a column in users',
        'One-to-many, stored with a list column in words',
        'It cannot be stored in a relational database',
      ],
      answer: 0,
      explanation: 'A join table has one row per user–word pair, with a foreign key to each side.',
    },
    {
      id: 'p6-q4',
      lesson: 6,
      kind: 'single',
      prompt: 'What does `DELETE FROM words;` do?',
      options: ['Deletes every row in the table, because there is no WHERE clause', 'Deletes the table itself', 'Deletes only the first row', 'Nothing until you add COMMIT'],
      answer: 0,
      explanation: 'Without WHERE, DELETE and UPDATE affect every row. `DROP TABLE` is what removes the table itself.',
    },
    {
      id: 'p6-q5',
      lesson: 6,
      kind: 'text',
      prompt: 'Which SQL clause sorts the results of a query? (Two words.)',
      accept: ['ORDER BY'],
      explanation: '`ORDER BY term` sorts ascending; add `DESC` for descending.',
    },
    {
      id: 'p6-q6',
      lesson: 7,
      kind: 'single',
      prompt: 'What is the difference between `JOIN` (inner join) and `LEFT JOIN`?',
      options: [
        'LEFT JOIN keeps every row of the left table, even when there is no match (the right side becomes NULL)',
        'LEFT JOIN is faster',
        'JOIN keeps every row of both tables',
        'There is no difference',
      ],
      answer: 0,
      explanation: 'An inner join keeps only matching rows. Use LEFT JOIN for questions like "every word, and the user’s progress if any".',
    },
    {
      id: 'p6-q7',
      lesson: 8,
      kind: 'single',
      prompt: 'What is Supabase?',
      options: [
        'A hosted Postgres database with authentication, file storage and auto-generated APIs',
        'A JavaScript framework for mobile apps',
        'A NoSQL document database',
        'A code editor',
      ],
      answer: 0,
      explanation: 'Supabase gives you a full Postgres database plus the backend services most apps need, without writing a server.',
    },
    {
      id: 'p6-q8',
      lesson: 10,
      kind: 'single',
      prompt: 'After a user signs in with Supabase Auth, how does your database know who they are?',
      options: [
        'Each request carries the user’s token, and Postgres can read their id with auth.uid()',
        'The app sends the user’s password with every query',
        'It cannot know; you must pass the user id in every query',
        'By the phone’s IP address',
      ],
      answer: 0,
      explanation: 'The Supabase client attaches the session token automatically, and policies use `auth.uid()` to identify the user.',
    },
    {
      id: 'p6-q9',
      lesson: 11,
      kind: 'single',
      prompt: 'You enable Row Level Security on a table but add no policies. What can a signed-in user read through the API?',
      options: ['Nothing: with RLS on and no policies, all access is denied', 'Everything', 'Only their own rows', 'Only the first 100 rows'],
      answer: 0,
      explanation: 'RLS denies by default. Each policy opens up exactly the access it describes.',
    },
    {
      id: 'p6-q10',
      lesson: 11,
      kind: 'single',
      prompt: 'What does the policy condition `using (auth.uid() = user_id)` mean?',
      options: [
        'A user can only access rows whose user_id equals their own id',
        'Only admins can access the table',
        'Users can access every row once signed in',
        'The user_id column is generated automatically',
      ],
      answer: 0,
      explanation: 'The condition is checked for every row. Rows where it is false are invisible to that user.',
    },
    {
      id: 'p6-q11',
      lesson: 12,
      kind: 'single',
      prompt: 'Which Supabase key may be included in your Expo app?',
      options: [
        'The anon (publishable) key, because Row Level Security protects the data',
        'The service_role key',
        'Both keys',
        'Neither; the app must ask the user for a key',
      ],
      answer: 0,
      explanation: 'Anyone can extract keys from an app. The anon key is meant to be public; the service_role key bypasses RLS and must stay on a server.',
    },
    {
      id: 'p6-q12',
      lesson: 2,
      kind: 'single',
      prompt: 'In a relational table, what is a row and what is a column?',
      options: [
        'A row is one record (one word); a column is one attribute of every record (the term)',
        'A row is an attribute; a column is a record',
        'Rows and columns are the same thing',
        'A row is a table; a column is a database',
      ],
      answer: 0,
      explanation: 'Each column has a name and a type; each row fills in a value for every column.',
    },
  ],
  problems: [
    {
      id: 'p6-selectFood',
      title: 'SELECT with WHERE and ORDER BY',
      lesson: 7,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(SCHEMA_NOTE, '', 'Write a query that returns the **term** and **translation** of every word in the `food` category, sorted alphabetically by term.'),
      starter: `SELECT * FROM words;
`,
      solution: `SELECT term, translation
FROM words
WHERE category = 'food'
ORDER BY term;
`,
      tests: [{ name: 'Returns the food words, sorted by term', code: '' }],
      hints: ['Choose the two columns after SELECT.', "Text values go in single quotes: `WHERE category = 'food'`."],
    },
    {
      id: 'p6-countByCategory',
      title: 'Count words per category',
      lesson: 6,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(SCHEMA_NOTE, '', 'Return one row per category with two columns: `category` and `total` (the number of words in it), sorted by category.'),
      starter: `SELECT category FROM words;
`,
      solution: `SELECT category, COUNT(*) AS total
FROM words
GROUP BY category
ORDER BY category;
`,
      tests: [{ name: 'Returns each category with its count', code: '' }],
      hints: ['`GROUP BY category` makes one group per category.', '`COUNT(*) AS total` counts the rows in each group and names the column.'],
    },
    {
      id: 'p6-joinMastered',
      title: 'JOIN: words Ana has mastered',
      lesson: 7,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(SCHEMA_NOTE, '', 'Return the **term** of every word that Ana (user id 1) has mastered (`mastered = 1`), sorted alphabetically.'),
      starter: `SELECT term FROM words;
`,
      solution: `SELECT words.term
FROM progress
JOIN words ON words.id = progress.word_id
WHERE progress.user_id = 1 AND progress.mastered = 1
ORDER BY words.term;
`,
      tests: [{ name: 'Returns the words Ana has mastered', code: '' }],
      hints: ['The terms are in `words`; who mastered what is in `progress`. Join them on the word id.', 'Filter by both user_id and mastered.'],
    },
    {
      id: 'p6-leftJoin',
      title: 'LEFT JOIN: every word with Ben’s progress',
      lesson: 7,
      language: 'sql',
      setup: SCHEMA,
      ordered: true,
      prompt: md(
        SCHEMA_NOTE,
        '',
        'Return **every** word (all 7) with two columns: `term`, and `mastered` showing Ben’s (user id 2) status: 1 or 0, and **0 when Ben has no progress row** for that word. Sort by the word id.',
      ),
      starter: `SELECT words.term, progress.mastered
FROM words
JOIN progress ON progress.word_id = words.id
WHERE progress.user_id = 2;
`,
      solution: `SELECT words.term, COALESCE(progress.mastered, 0) AS mastered
FROM words
LEFT JOIN progress ON progress.word_id = words.id AND progress.user_id = 2
ORDER BY words.id;
`,
      tests: [{ name: 'Returns all 7 words with Ben’s status', code: '' }],
      hints: [
        'An inner JOIN drops words Ben has never studied. You need LEFT JOIN.',
        'A condition on the right table in WHERE turns a LEFT JOIN back into an inner join. Put `progress.user_id = 2` in the ON clause.',
        '`COALESCE(value, 0)` replaces NULL with 0.',
      ],
    },
    {
      id: 'p6-favorites',
      title: 'Create a table with keys and constraints',
      lesson: 4,
      language: 'sql',
      setup: SCHEMA,
      prompt: md(
        SCHEMA_NOTE,
        '',
        'Create a table `favorites` that stores which words each user has marked as favourite:',
        '- `user_id`: required integer that must reference an existing user.',
        '- `word_id`: required integer that must reference an existing word.',
        '- A user cannot favourite the same word twice (use a primary key on the pair).',
        '',
        'The tests insert valid and invalid rows and check that the database accepts or rejects them.',
      ),
      starter: `CREATE TABLE favorites (
  user_id INTEGER,
  word_id INTEGER
);
`,
      solution: `CREATE TABLE favorites (
  user_id INTEGER NOT NULL REFERENCES users(id),
  word_id INTEGER NOT NULL REFERENCES words(id),
  PRIMARY KEY (user_id, word_id)
);
`,
      tests: [
        { name: 'A valid favourite can be inserted', code: `INSERT INTO favorites (user_id, word_id) VALUES (1, 3); SELECT user_id, word_id FROM favorites;` },
        { name: 'The same favourite cannot be added twice', code: `INSERT INTO favorites (user_id, word_id) VALUES (1, 3); INSERT INTO favorites (user_id, word_id) VALUES (1, 3);` },
        { name: 'word_id must reference an existing word', code: `INSERT INTO favorites (user_id, word_id) VALUES (1, 999);` },
        { name: 'user_id must reference an existing user', code: `INSERT INTO favorites (user_id, word_id) VALUES (999, 1);` },
        { name: 'user_id is required', code: `INSERT INTO favorites (word_id) VALUES (1);` },
        { name: 'word_id is required', code: `INSERT INTO favorites (user_id) VALUES (1);` },
      ],
      hints: [
        '`REFERENCES users(id)` makes a column a foreign key.',
        '`NOT NULL` makes a column required. (SQLite, unlike Postgres, does not make primary-key columns NOT NULL automatically.)',
        'A primary key over two columns: `PRIMARY KEY (user_id, word_id)` at the end of the column list.',
      ],
    },
    {
      id: 'p6-insertUpdate',
      title: 'INSERT and UPDATE progress',
      lesson: 6,
      language: 'sql',
      setup: SCHEMA,
      prompt: md(
        SCHEMA_NOTE,
        '',
        'Write two statements:',
        '1. Insert a progress row saying Ben (user 2) has **mastered** word 3.',
        '2. Update Ana’s (user 1) existing progress on word 2 so it is mastered.',
        '',
        'No other rows may change.',
      ),
      starter: `UPDATE progress SET mastered = 1;
`,
      solution: `INSERT INTO progress (user_id, word_id, mastered) VALUES (2, 3, 1);
UPDATE progress SET mastered = 1 WHERE user_id = 1 AND word_id = 2;
`,
      tests: [{ name: 'The progress table ends up correct', code: `SELECT user_id, word_id, mastered FROM progress ORDER BY user_id, word_id;` }],
      hints: ['`INSERT INTO table (columns) VALUES (values);`', 'An UPDATE without WHERE changes every row. Target exactly one row with both user_id and word_id.'],
    },
  ],
};
