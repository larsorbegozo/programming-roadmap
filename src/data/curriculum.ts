import type { Difficulty, Exercise, Lesson, Phase } from '../types/curriculum';

interface LessonInput {
  title: string;
  description: string;
  objectives: string[];
  resources: string[];
  exercises?: string[];
  difficulty?: Difficulty;
  minutes?: number;
}

interface PhaseInput extends Omit<Phase, 'lessons' | 'id' | 'practiceLabel'> {
  practiceLabel?: string;
  lessons: LessonInput[];
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function buildPhase(input: PhaseInput): Phase {
  const id = `p${input.number}`;
  const lessons: Lesson[] = input.lessons.map((l, index) => {
    const lessonId = `${id}-l${index + 1}`;
    const exercises: Exercise[] = (l.exercises ?? []).map((title) => ({
      id: `${lessonId}-ex-${slug(title)}`,
      title,
    }));
    return {
      id: lessonId,
      phaseId: id,
      number: index + 1,
      title: l.title,
      description: l.description,
      objectives: l.objectives,
      resourceIds: l.resources,
      exercises,
      difficulty: l.difficulty ?? 'beginner',
      estimatedMinutes: l.minutes ?? 60,
    };
  });
  return { ...input, id, practiceLabel: input.practiceLabel ?? 'Practical exercises', lessons };
}

const phaseInputs: PhaseInput[] = [
  {
    number: 0,
    title: 'Development Environment',
    duration: '2–3 days',
    estimatedWeeks: 0.5,
    ongoing: false,
    description:
      'Set up your computer for development and learn the basic concepts every programmer relies on: editors, files, folders and the terminal.',
    objectives: [
      'Understand basic computer and programming concepts.',
      'Learn how to use a code editor.',
      'Understand files, folders, and the terminal.',
      'Install the required development tools.',
    ],
    resourceIds: ['vscode', 'nodejs', 'git', 'github', 'mdn-getting-started'],
    lessons: [
      {
        title: 'What is programming?',
        description: 'What code is, how computers run it, and how a mobile app like Lyra is made of many small instructions.',
        objectives: ['Explain what a program is in your own words.', 'Know the difference between source code and a running app.', 'Understand where JavaScript, TypeScript and React fit in.'],
        resources: ['mdn-getting-started'],
        minutes: 45,
      },
      {
        title: 'Understanding code editors',
        description: 'Why programmers use code editors instead of word processors, and what features matter most.',
        objectives: ['Know what syntax highlighting, autocomplete and extensions do.', 'Understand the editor layout: explorer, editor, terminal.'],
        resources: ['vscode-docs'],
        minutes: 30,
      },
      {
        title: 'Installing Visual Studio Code',
        description: 'Install VS Code and configure it for comfortable everyday use.',
        objectives: ['Install VS Code.', 'Open a folder as a project.', 'Install one or two essential extensions (e.g. Prettier, ESLint).'],
        resources: ['vscode', 'vscode-docs'],
        exercises: ['Create a folder called "learning" and open it in VS Code'],
        minutes: 30,
      },
      {
        title: 'Installing Node.js',
        description: 'Install the Node.js LTS release, which gives you the node runtime and the npm package manager.',
        objectives: ['Install Node.js LTS.', 'Verify the install with node -v and npm -v.', 'Run a one-line JavaScript file with node.'],
        resources: ['nodejs'],
        exercises: ['Create hello.js that prints a message and run it with node hello.js'],
        minutes: 30,
      },
      {
        title: 'Installing Git',
        description: 'Install Git and set your name and email so your commits are attributed to you.',
        objectives: ['Install Git.', 'Configure user.name and user.email.', 'Verify the install with git --version.'],
        resources: ['git'],
        minutes: 30,
      },
      {
        title: 'Understanding the terminal',
        description: 'The terminal lets you control your computer with text commands. Most developer tools are used from it.',
        objectives: ['Open the terminal inside VS Code.', 'Understand commands, arguments and the current directory.', 'Read error messages without panicking.'],
        resources: ['mdn-getting-started'],
        minutes: 45,
      },
      {
        title: 'Navigating directories and managing files',
        description: 'Move around the file system and create, rename and delete files from the terminal.',
        objectives: ['Use pwd, ls (or dir), cd, mkdir.', 'Understand absolute vs relative paths.', 'Create and remove files safely.'],
        resources: ['mdn-getting-started'],
        exercises: ['Create a projects folder with two sub-folders using only the terminal'],
        minutes: 45,
      },
      {
        title: 'Introduction to GitHub',
        description: 'Create a GitHub account and understand how GitHub stores and shares Git repositories.',
        objectives: ['Create a GitHub account.', 'Understand the difference between Git and GitHub.', 'Browse a public repository.'],
        resources: ['github'],
        exercises: ['Create your GitHub account and explore one open-source repository'],
        minutes: 30,
      },
    ],
  },
  {
    number: 1,
    title: 'JavaScript Fundamentals',
    duration: '2–3 weeks',
    estimatedWeeks: 2.5,
    ongoing: false,
    description:
      'Learn the core building blocks of JavaScript: values, logic, functions and data structures. Everything later in the roadmap is built on this.',
    objectives: [
      'Write small programs using variables, conditions, loops and functions.',
      'Model real data with arrays and objects.',
      'Transform data with array methods.',
      'Understand scope and closures.',
    ],
    resourceIds: ['fcc-js', 'jsinfo'],
    lessons: [
      {
        title: 'Variables: let and const',
        description: 'Store values with names so your program can remember and reuse them.',
        objectives: ['Declare variables with let and const.', 'Know when to use each.', 'Follow good naming conventions.'],
        resources: ['fcc-js', 'jsinfo-variables'],
      },
      {
        title: 'Data types',
        description: 'Strings, numbers, booleans, null, undefined and how JavaScript treats each.',
        objectives: ['Identify the primitive types.', 'Use typeof to inspect a value.', 'Understand null vs undefined.'],
        resources: ['fcc-js', 'jsinfo-types'],
      },
      {
        title: 'Operators',
        description: 'Arithmetic, comparison and logical operators for computing and comparing values.',
        objectives: ['Use arithmetic and assignment operators.', 'Compare with === and !==.', 'Combine conditions with &&, || and !.'],
        resources: ['fcc-js', 'jsinfo-operators'],
      },
      {
        title: 'Conditional statements',
        description: 'Make decisions in code with if, else if, else and the ternary operator.',
        objectives: ['Write if / else chains.', 'Use the ternary operator for simple choices.', 'Understand truthy and falsy values.'],
        resources: ['fcc-js', 'jsinfo-ifelse'],
      },
      {
        title: 'Functions',
        description: 'Package logic into reusable, named blocks that take inputs and return outputs.',
        objectives: ['Declare functions and arrow functions.', 'Use parameters and return values.', 'Break a problem into small functions.'],
        resources: ['fcc-js', 'jsinfo-functions'],
        minutes: 90,
      },
      {
        title: 'Arrays',
        description: 'Ordered lists of values, such as a list of vocabulary words.',
        objectives: ['Create arrays and access items by index.', 'Add and remove items with push, pop, etc.', 'Get the length of an array.'],
        resources: ['fcc-js', 'jsinfo-array'],
        exercises: ['Build an array of vocabulary words'],
        minutes: 90,
      },
      {
        title: 'Objects',
        description: 'Group related data under named keys, like a word, its translation and its category.',
        objectives: ['Create objects with properties.', 'Read and update properties with dot and bracket notation.', 'Nest objects and arrays.'],
        resources: ['fcc-js', 'jsinfo-object'],
        exercises: ['Create a vocabulary object (word, translation, category, mastered)'],
        minutes: 90,
      },
      {
        title: 'Loops',
        description: 'Repeat work with for, while and for...of loops.',
        objectives: ['Write for and while loops.', 'Iterate arrays with for...of.', 'Avoid infinite loops.'],
        resources: ['fcc-js', 'jsinfo-loops'],
        exercises: ['Mark vocabulary items as mastered by looping over the array'],
      },
      {
        title: 'Array methods: map, filter, find, reduce',
        description: 'The modern, expressive way to transform and query arrays.',
        objectives: ['Transform arrays with map.', 'Select items with filter and find.', 'Compute totals with reduce.'],
        resources: ['jsinfo-array-methods', 'fcc-js'],
        exercises: ['Filter vocabulary by category', 'Calculate the percentage of mastered words'],
        difficulty: 'intermediate',
        minutes: 120,
      },
      {
        title: 'Scope and closures',
        description: 'Where variables are visible, and how functions remember the variables around them.',
        objectives: ['Explain block and function scope.', 'Describe what a closure is.', 'Recognise closures in everyday code.'],
        resources: ['jsinfo-closure'],
        difficulty: 'intermediate',
        minutes: 90,
      },
    ],
  },
  {
    number: 2,
    title: 'Intermediate JavaScript',
    duration: '1–2 weeks',
    estimatedWeeks: 1.5,
    ongoing: false,
    description:
      'Modern JavaScript features used in every React and React Native codebase: destructuring, modules, asynchronous code and talking to APIs.',
    objectives: [
      'Read and write modern JavaScript syntax confidently.',
      'Organise code across multiple files.',
      'Work with asynchronous operations and APIs.',
      'Handle errors gracefully.',
    ],
    resourceIds: ['jsinfo'],
    lessons: [
      {
        title: 'Destructuring',
        description: 'Pull values out of arrays and objects into variables in a single line.',
        objectives: ['Destructure objects and arrays.', 'Use default values.', 'Destructure function parameters.'],
        resources: ['jsinfo-destructuring'],
        difficulty: 'intermediate',
      },
      {
        title: 'Spread operator',
        description: 'Copy and combine arrays and objects without mutating the original.',
        objectives: ['Copy arrays and objects with ...', 'Merge objects.', 'Understand rest parameters.'],
        resources: ['jsinfo-spread'],
        difficulty: 'intermediate',
      },
      {
        title: 'Modules',
        description: 'Why real applications split code across many files and how JavaScript modules work.',
        objectives: ['Explain what a module is.', 'Understand module scope.'],
        resources: ['jsinfo-modules'],
        difficulty: 'intermediate',
        minutes: 45,
      },
      {
        title: 'Import and export',
        description: 'Share functions and data between files with named and default exports.',
        objectives: ['Use named exports and imports.', 'Use default exports.', 'Structure a small multi-file project.'],
        resources: ['jsinfo-import-export'],
        exercises: ['Organize vocabulary data across multiple files'],
        difficulty: 'intermediate',
      },
      {
        title: 'Promises',
        description: 'Represent work that finishes later, such as loading data from the internet.',
        objectives: ['Explain what a Promise represents.', 'Chain .then and .catch.', 'Understand pending, fulfilled and rejected states.'],
        resources: ['jsinfo-promise'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Async and await',
        description: 'Write asynchronous code that reads top to bottom.',
        objectives: ['Write async functions.', 'Await promises.', 'Run operations in sequence vs in parallel.'],
        resources: ['jsinfo-async'],
        exercises: ['Handle asynchronous operations with async/await'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Try and catch',
        description: 'Stop errors from crashing your program and respond to them instead.',
        objectives: ['Wrap risky code in try / catch.', 'Use finally.', 'Combine try / catch with await.'],
        resources: ['jsinfo-try-catch'],
        difficulty: 'intermediate',
      },
      {
        title: 'JSON',
        description: 'The text format used to send and store data between apps and servers.',
        objectives: ['Convert objects to JSON with JSON.stringify.', 'Parse JSON with JSON.parse.', 'Recognise valid JSON.'],
        resources: ['jsinfo-json'],
        minutes: 45,
      },
      {
        title: 'Fetch API',
        description: 'Request data from web APIs and use it in your program.',
        objectives: ['Make GET requests with fetch.', 'Read JSON responses.', 'Check response status.'],
        resources: ['jsinfo-fetch'],
        exercises: ['Retrieve information from a public API'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Error handling',
        description: 'Design code that fails clearly: meaningful messages, fallbacks and custom errors.',
        objectives: ['Handle network and parsing errors.', 'Show useful error messages.', 'Create custom error types.'],
        resources: ['jsinfo-custom-errors', 'jsinfo-try-catch'],
        exercises: ['Handle errors when retrieving data'],
        difficulty: 'intermediate',
      },
    ],
  },
  {
    number: 3,
    title: 'TypeScript',
    duration: '1 week',
    estimatedWeeks: 1,
    ongoing: false,
    description:
      'Add types to JavaScript so your editor catches mistakes before you run the code. Lyra will be written in TypeScript.',
    objectives: [
      'Understand why TypeScript exists and what it checks.',
      'Describe data with interfaces and type aliases.',
      'Type functions and collections.',
      'Read and fix TypeScript errors.',
    ],
    resourceIds: ['ts-from-scratch', 'ts-handbook'],
    lessons: [
      {
        title: 'Introduction to TypeScript',
        description: 'What TypeScript adds to JavaScript and how it is compiled.',
        objectives: ['Explain static typing.', 'Run the TypeScript compiler or playground.'],
        resources: ['ts-from-scratch'],
        minutes: 45,
      },
      {
        title: 'Basic types',
        description: 'string, number, boolean and the special types any and unknown.',
        objectives: ['Use the primitive types.', 'Know why any should be avoided.'],
        resources: ['ts-everyday-types'],
        minutes: 45,
      },
      {
        title: 'Type inference',
        description: 'TypeScript can often work out types for you.',
        objectives: ['Recognise inferred types by hovering in the editor.', 'Know when to rely on inference.'],
        resources: ['ts-inference'],
        minutes: 30,
      },
      {
        title: 'Type annotations',
        description: 'Explicitly declare the type of variables, parameters and return values.',
        objectives: ['Annotate variables and parameters.', 'Annotate return types.'],
        resources: ['ts-everyday-types'],
        minutes: 30,
      },
      {
        title: 'Arrays and object types',
        description: 'Describe lists and object shapes.',
        objectives: ['Type arrays with string[] and Array<T>.', 'Write inline object types.'],
        resources: ['ts-everyday-types', 'ts-objects'],
        exercises: ['Create typed vocabulary collections'],
      },
      {
        title: 'Interfaces',
        description: 'Name and reuse the shape of an object.',
        objectives: ['Declare interfaces.', 'Extend interfaces.'],
        resources: ['ts-everyday-types', 'ts-objects'],
        exercises: ['Create a VocabularyWord interface'],
      },
      {
        title: 'Type aliases',
        description: 'Give a name to any type, including unions and primitives.',
        objectives: ['Declare type aliases.', 'Know the practical differences from interfaces.'],
        resources: ['ts-everyday-types'],
        exercises: ['Define user and learning-session types'],
        minutes: 45,
      },
      {
        title: 'Union types',
        description: 'A value that can be one of several types, such as "beginner" | "advanced".',
        objectives: ['Write union types.', 'Narrow unions with checks.'],
        resources: ['ts-everyday-types'],
        difficulty: 'intermediate',
        minutes: 45,
      },
      {
        title: 'Optional properties',
        description: 'Mark object properties that may be missing.',
        objectives: ['Use ? for optional properties.', 'Safely read optional values.'],
        resources: ['ts-objects'],
        minutes: 30,
      },
      {
        title: 'Typed functions',
        description: 'Type parameters, return values and callback functions.',
        objectives: ['Type function parameters and returns.', 'Type callback parameters.'],
        resources: ['ts-functions'],
        difficulty: 'intermediate',
      },
      {
        title: 'Introduction to generics',
        description: 'Write functions and types that work with many types while staying safe.',
        objectives: ['Read generic syntax like Array<T>.', 'Write a simple generic function.'],
        resources: ['ts-generics'],
        difficulty: 'advanced',
      },
      {
        title: 'Importing and exporting types',
        description: 'Share types across files in a project.',
        objectives: ['Export interfaces and types.', 'Use import type.'],
        resources: ['ts-modules'],
        exercises: ['Understand and fix TypeScript errors in a small project'],
        difficulty: 'intermediate',
        minutes: 45,
      },
    ],
  },
  {
    number: 4,
    title: 'React Fundamentals',
    duration: '1–2 weeks',
    estimatedWeeks: 1.5,
    ongoing: false,
    description:
      'Build user interfaces from components. React concepts transfer directly to React Native, which Lyra will use.',
    objectives: [
      'Build interfaces from reusable components.',
      'Pass data with props and manage state.',
      'Respond to user events.',
      'Use the core hooks.',
    ],
    resourceIds: ['react-learn'],
    lessons: [
      {
        title: 'Components',
        description: 'Components are reusable pieces of UI written as functions.',
        objectives: ['Write a function component.', 'Compose components inside each other.'],
        resources: ['react-learn', 'react-components'],
        exercises: ['Create a vocabulary card component'],
      },
      {
        title: 'JSX',
        description: 'The HTML-like syntax used to describe UI in React.',
        objectives: ['Write JSX markup.', 'Embed JavaScript expressions with { }.'],
        resources: ['react-jsx'],
        minutes: 45,
      },
      {
        title: 'Props',
        description: 'Pass data from a parent component to a child component.',
        objectives: ['Pass and read props.', 'Type props with TypeScript.'],
        resources: ['react-props'],
        exercises: ['Build reusable components driven by props'],
      },
      {
        title: 'State',
        description: 'Let components remember values that change over time.',
        objectives: ['Explain why regular variables are not enough.', 'Understand re-rendering.'],
        resources: ['react-state'],
        difficulty: 'intermediate',
      },
      {
        title: 'Events',
        description: 'React to clicks, typing and other interactions.',
        objectives: ['Attach event handlers.', 'Pass handlers as props.'],
        resources: ['react-events'],
        exercises: ['Reveal and hide translations on click'],
      },
      {
        title: 'Conditional rendering',
        description: 'Show different UI depending on state or props.',
        objectives: ['Use && and ternaries in JSX.', 'Return early from components.'],
        resources: ['react-conditional'],
        minutes: 45,
      },
      {
        title: 'Rendering lists',
        description: 'Turn arrays of data into lists of components.',
        objectives: ['Render arrays with map.', 'Use stable keys.'],
        resources: ['react-lists'],
        minutes: 45,
      },
      {
        title: 'Hooks',
        description: 'Hooks let function components use React features such as state and effects.',
        objectives: ['Know the rules of hooks.', 'Recognise the most common built-in hooks.'],
        resources: ['react-hooks'],
        difficulty: 'intermediate',
        minutes: 45,
      },
      {
        title: 'useState',
        description: 'The hook for local component state.',
        objectives: ['Use useState with primitives, arrays and objects.', 'Update state immutably.'],
        resources: ['react-usestate', 'react-state'],
        exercises: ['Mark words as mastered', 'Display mastery statistics'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'useEffect',
        description: 'Synchronise a component with something outside React, such as fetching data.',
        objectives: ['Write effects with dependency arrays.', 'Clean up effects.', 'Know when you do not need an effect.'],
        resources: ['react-useeffect'],
        difficulty: 'advanced',
        minutes: 90,
      },
    ],
  },
  {
    number: 5,
    title: 'React Native and Expo',
    duration: '2 weeks',
    estimatedWeeks: 2,
    ongoing: false,
    practiceLabel: 'Practical projects',
    description:
      'Move from the web to mobile. Build real apps that run on your phone with Expo, the toolkit Lyra will be built with.',
    objectives: [
      'Create and run an Expo app on a device.',
      'Lay out screens with core components and Flexbox.',
      'Navigate between screens with Expo Router.',
      'Build three small but complete mobile apps.',
    ],
    resourceIds: ['expo-tutorial', 'rn-getting-started'],
    lessons: [
      {
        title: 'Creating an Expo project',
        description: 'Generate a new app with create-expo-app and run it on your phone with Expo Go.',
        objectives: ['Create a project.', 'Run it on a device or simulator.', 'Understand the project structure.'],
        resources: ['expo-tutorial', 'expo-create'],
        exercises: ['Build a counter application'],
      },
      {
        title: 'React Native components',
        description: 'How React Native replaces HTML elements with native components.',
        objectives: ['Explain native vs web components.', 'Map familiar React ideas to React Native.'],
        resources: ['rn-core-components'],
        minutes: 45,
      },
      {
        title: 'View, Text, Image, ScrollView, FlatList',
        description: 'The core building blocks used on almost every screen.',
        objectives: ['Use each core component.', 'Choose FlatList over ScrollView for long lists.'],
        resources: ['rn-core-components', 'rn-flatlist'],
        minutes: 90,
      },
      {
        title: 'Styling and Flexbox',
        description: 'Style components with StyleSheet and lay them out with Flexbox.',
        objectives: ['Use StyleSheet.create.', 'Lay out with flexDirection, justifyContent and alignItems.'],
        resources: ['rn-flexbox', 'expo-tutorial'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Navigation with Expo Router',
        description: 'File-based routing: each file in the app folder becomes a screen.',
        objectives: ['Create stack and tab navigation.', 'Pass parameters between screens.'],
        resources: ['expo-router'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'State management',
        description: 'Share state between screens using lifted state and React context.',
        objectives: ['Lift state up.', 'Use React context for shared data.'],
        resources: ['react-learn', 'expo-tutorial'],
        exercises: ['Build a vocabulary flashcard application'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'User interactions',
        description: 'Buttons, pressables, text inputs and gestures.',
        objectives: ['Use Pressable and TextInput.', 'Give users feedback on interaction.'],
        resources: ['expo-tutorial'],
        exercises: ['Build a multiple-choice quiz application'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Images and assets',
        description: 'Include images, icons and fonts in your app.',
        objectives: ['Load local and remote images.', 'Manage the assets folder.'],
        resources: ['expo-tutorial'],
        minutes: 45,
      },
      {
        title: 'Animations',
        description: 'Add subtle motion to make interfaces feel responsive.',
        objectives: ['Use the Animated API for a simple transition.', 'Know when animation helps and when it distracts.'],
        resources: ['rn-animations', 'expo-tutorial'],
        difficulty: 'advanced',
        minutes: 90,
      },
      {
        title: 'Device-specific functionality',
        description: 'Use device features through Expo SDK modules, and handle iOS vs Android differences.',
        objectives: ['Install and use an Expo SDK module.', 'Use Platform to handle OS differences.'],
        resources: ['expo-tutorial', 'expo-docs'],
        difficulty: 'advanced',
      },
    ],
  },
  {
    number: 6,
    title: 'SQL and Supabase',
    duration: '1–2 weeks',
    estimatedWeeks: 1.5,
    ongoing: false,
    description:
      'Learn how data is stored in relational databases and connect your Expo app to Supabase to save user progress in the cloud.',
    objectives: [
      'Design simple relational tables.',
      'Query and modify data with SQL.',
      'Use Supabase for database and authentication.',
      'Protect user data with Row Level Security.',
    ],
    resourceIds: ['sqlbolt', 'supabase-start', 'supabase-expo'],
    lessons: [
      {
        title: 'Introduction to relational databases',
        description: 'What a database is and why apps store data in related tables.',
        objectives: ['Explain what a relational database is.', 'Know why apps need a server-side database.'],
        resources: ['sqlbolt'],
        minutes: 45,
      },
      {
        title: 'Tables, rows, and columns',
        description: 'The basic structure of relational data.',
        objectives: ['Describe tables, rows and columns.', 'Choose sensible column types.'],
        resources: ['sqlbolt'],
        exercises: ['Create a vocabulary table'],
        minutes: 45,
      },
      {
        title: 'Primary keys',
        description: 'A unique identifier for every row.',
        objectives: ['Explain why every table needs a primary key.', 'Use UUID or serial keys.'],
        resources: ['sqlbolt'],
        exercises: ['Create a user table'],
        minutes: 30,
      },
      {
        title: 'Foreign keys',
        description: 'Link rows in one table to rows in another.',
        objectives: ['Define a foreign key.', 'Understand referential integrity.'],
        resources: ['sqlbolt'],
        difficulty: 'intermediate',
        minutes: 45,
      },
      {
        title: 'Database relationships',
        description: 'One-to-many and many-to-many relationships, such as users and their word progress.',
        objectives: ['Model one-to-many and many-to-many relationships.', 'Design a join table.'],
        resources: ['sqlbolt'],
        exercises: ['Create a user vocabulary progress table'],
        difficulty: 'intermediate',
      },
      {
        title: 'SELECT, INSERT, UPDATE, DELETE',
        description: 'The four core SQL statements for reading and changing data.',
        objectives: ['Read data with SELECT.', 'Write data with INSERT, UPDATE and DELETE.'],
        resources: ['sqlbolt'],
        minutes: 90,
      },
      {
        title: 'WHERE and JOIN',
        description: 'Filter rows and combine data from related tables.',
        objectives: ['Filter with WHERE.', 'Combine tables with INNER and LEFT JOIN.'],
        resources: ['sqlbolt', 'sqlbolt-joins'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Introduction to Supabase',
        description: 'Supabase gives you a hosted Postgres database, authentication and APIs.',
        objectives: ['Understand what Supabase provides.', 'Create a free Supabase project.'],
        resources: ['supabase-start'],
        minutes: 45,
      },
      {
        title: 'Database creation',
        description: 'Create tables in Supabase using the dashboard and the SQL editor.',
        objectives: ['Create tables in the dashboard.', 'Run SQL in the SQL editor.'],
        resources: ['supabase-start'],
        difficulty: 'intermediate',
      },
      {
        title: 'Authentication',
        description: 'Let users sign up and sign in to your app.',
        objectives: ['Enable email authentication.', 'Understand sessions and the current user.'],
        resources: ['supabase-auth'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Row Level Security',
        description: 'Make sure each user can only read and write their own data.',
        objectives: ['Enable RLS on a table.', 'Write a policy based on auth.uid().'],
        resources: ['supabase-rls'],
        difficulty: 'advanced',
        minutes: 90,
      },
      {
        title: 'Connecting Expo to Supabase',
        description: 'Install the Supabase client in your Expo app and read and write data.',
        objectives: ['Configure the Supabase client.', 'Query and insert data from the app.'],
        resources: ['supabase-expo'],
        exercises: ['Connect the application to Supabase', 'Retrieve and save vocabulary progress'],
        difficulty: 'advanced',
        minutes: 120,
      },
    ],
  },
  {
    number: 7,
    title: 'Git, Testing, and Development Workflow',
    duration: 'Ongoing, with a dedicated consolidation week',
    estimatedWeeks: 1,
    ongoing: true,
    description:
      'Professional habits that keep your work safe and your code trustworthy: version control, debugging, testing and reviewing AI-generated code.',
    objectives: [
      'Use Git daily to save and share work.',
      'Work with branches safely.',
      'Debug problems methodically.',
      'Critically review code written by Claude Code.',
    ],
    resourceIds: ['github-skills', 'git-docs', 'github-learning'],
    lessons: [
      {
        title: 'Understanding Git',
        description: 'How Git tracks the history of your project as snapshots.',
        objectives: ['Explain the working directory, staging area and repository.', 'Read git status output.'],
        resources: ['pro-git', 'github-skills'],
        minutes: 45,
      },
      {
        title: 'Repositories',
        description: 'Create local repositories and connect them to GitHub.',
        objectives: ['Use git init and git clone.', 'Add a remote.'],
        resources: ['github-skills', 'git-docs'],
        exercises: ['Create a GitHub repository'],
        minutes: 45,
      },
      {
        title: 'Commits',
        description: 'Save meaningful snapshots of your work with clear messages.',
        objectives: ['Stage and commit changes.', 'Write clear commit messages.', 'View history with git log.'],
        resources: ['pro-git'],
        exercises: ['Commit each completed project'],
        minutes: 45,
      },
      {
        title: 'Branches',
        description: 'Work on features in isolation and merge them back.',
        objectives: ['Create and switch branches.', 'Merge branches.', 'Resolve a simple merge conflict.'],
        resources: ['pro-git', 'github-skills'],
        exercises: ['Create and merge branches'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Pushing code to GitHub',
        description: 'Share your local commits with GitHub and keep them in sync.',
        objectives: ['Push and pull.', 'Open a pull request.'],
        resources: ['github-skills', 'github-learning'],
        minutes: 45,
      },
      {
        title: 'Reverting changes',
        description: 'Undo mistakes safely with restore, revert and reset.',
        objectives: ['Discard uncommitted changes.', 'Revert a commit.', 'Know when reset is dangerous.'],
        resources: ['pro-git', 'git-docs'],
        exercises: ['Practice reverting changes'],
        difficulty: 'intermediate',
      },
      {
        title: 'Debugging',
        description: 'Find the cause of a problem systematically instead of guessing.',
        objectives: ['Use console.log and breakpoints.', 'Reproduce, isolate and fix bugs.'],
        resources: ['vscode-docs'],
        exercises: ['Test and debug an application'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Introduction to testing',
        description: 'Automated tests check that your code still works after changes.',
        objectives: ['Explain unit tests.', 'Read and run an existing test.'],
        resources: ['github-learning'],
        difficulty: 'intermediate',
      },
      {
        title: 'Understanding application errors',
        description: 'Read stack traces and error messages to find the real problem.',
        objectives: ['Read a stack trace.', 'Distinguish syntax, type and runtime errors.'],
        resources: ['jsinfo-try-catch'],
        minutes: 45,
      },
      {
        title: 'Reviewing AI-generated code',
        description: 'Treat code from Claude Code as a pull request: read it, run it, question it.',
        objectives: ['Read generated code before accepting it.', 'Verify behaviour by running it.', 'Ask for explanations of anything unclear.'],
        resources: ['github-learning'],
        difficulty: 'intermediate',
      },
    ],
  },
  {
    number: 8,
    title: 'Build the Lyra Prototype',
    duration: 'Ongoing',
    estimatedWeeks: 4,
    ongoing: true,
    practiceLabel: 'Implementation goals',
    description:
      'Apply everything you have learned to build the first version of Lyra, your vocabulary-learning app. Advanced features such as FSRS, leagues and multiplayer come later.',
    objectives: [
      'Apply everything learned to the actual vocabulary-learning application.',
      'Ship a working prototype with cards, a quiz and saved progress.',
      'Work productively with Claude Code while understanding every change.',
    ],
    resourceIds: ['expo-docs', 'expo-typescript', 'supabase-expo'],
    lessons: [
      { title: 'Create the Expo project', description: 'Start the real Lyra project and commit it to GitHub.', objectives: ['Create the project with create-expo-app.', 'Push the initial commit.'], resources: ['expo-create'], difficulty: 'intermediate' },
      { title: 'Configure TypeScript', description: 'Make sure TypeScript is set up with strict checks.', objectives: ['Enable strict mode.', 'Fix any initial type errors.'], resources: ['expo-typescript'], difficulty: 'intermediate', minutes: 45 },
      { title: 'Create the application folder structure', description: 'Decide where screens, components, data and utilities live.', objectives: ['Create a clear folder structure.', 'Document it in a README.'], resources: ['expo-router'], difficulty: 'intermediate', minutes: 45 },
      { title: 'Build the primary navigation', description: 'Set up the main tabs and screens with Expo Router.', objectives: ['Create tab navigation.', 'Add placeholder screens.'], resources: ['expo-router'], difficulty: 'intermediate', minutes: 90 },
      { title: 'Create the vocabulary data model', description: 'Define TypeScript types and seed data for vocabulary.', objectives: ['Define a VocabularyWord type.', 'Create seed data.'], resources: ['ts-everyday-types'], difficulty: 'intermediate' },
      { title: 'Build vocabulary cards', description: 'A card component that shows a word and reveals its translation.', objectives: ['Build a reusable card.', 'Reveal and hide the translation.'], resources: ['rn-core-components'], difficulty: 'intermediate', minutes: 120 },
      { title: 'Build a basic quiz', description: 'A multiple-choice quiz drawn from the vocabulary list.', objectives: ['Generate questions.', 'Track score.'], resources: ['expo-docs'], difficulty: 'advanced', minutes: 120 },
      { title: 'Connect Supabase', description: 'Connect Lyra to your Supabase project with authentication.', objectives: ['Configure the client.', 'Sign users in.'], resources: ['supabase-expo', 'supabase-auth'], difficulty: 'advanced', minutes: 120 },
      { title: 'Save user progress', description: 'Persist which words a user has mastered.', objectives: ['Write progress to the database.', 'Load progress on start.', 'Protect it with RLS.'], resources: ['supabase-expo', 'supabase-rls'], difficulty: 'advanced', minutes: 120 },
      { title: 'Implement a basic learning session', description: 'Combine cards and quiz into a short learning session flow.', objectives: ['Design a session flow.', 'Show a summary at the end.'], resources: ['expo-docs'], difficulty: 'advanced', minutes: 180 },
    ],
  },
  {
    number: 9,
    title: 'Lyra MVP Build Plan',
    duration: 'Ongoing, after the Phase 8 prototype',
    estimatedWeeks: 6,
    ongoing: true,
    practiceLabel: 'Done when…',
    description:
      'The stage-by-stage plan from your architecture review: build the learning engine and one finished game before polished screens, and add leagues, iOS and web only after a closed test shows people come back. Phase 8 is the simple first prototype; this phase is the fuller build.',
    objectives: [
      'Follow the recommended offline-first architecture: the phone owns the study loop, Supabase owns accounts, content and competition.',
      'Build the engine and one finished game before any polished screens.',
      'Store every answer as an immutable review event and derive card state from those events.',
      'Validate with a closed test before adding anything else.',
    ],
    resourceIds: ['expo-agents', 'expo-sdk-57', 'expo-sqlite-ref', 'ts-fsrs', 'reanimated-start'],
    lessons: [
      {
        title: 'Understand the recommended architecture',
        description:
          'An offline-first app that stores every answer as an event. Games only report a result; the engine turns it into a rating and a next review date. New review events upload once, and word packs download from Storage.',
        objectives: [
          'Explain why you store immutable review events instead of syncing mutable rows.',
          'Describe what lives on the phone (SQLite, session state) and what lives on Supabase (auth, content, leagues).',
          'Know which technologies are deliberately left out of the MVP: NativeWind, PowerSync, Next.js, a monorepo, leagues, PvP, iOS, web and subscriptions.',
        ],
        resources: ['expo-new-arch', 'expo-sqlite-ref'],
        difficulty: 'intermediate',
        minutes: 60,
      },
      {
        title: 'Setup: SDK, development build and CLAUDE.md',
        description:
          'Create the project on the latest stable Expo SDK (SDK 57 at expo@57.0.17 or later is a safe fallback), run a development build on a real Android phone, install the Expo plugin for Claude Code and write a strict CLAUDE.md.',
        objectives: [
          'Create the project with create-expo-app and run a development build, not Expo Go.',
          'Install the official Expo plugin for Claude Code.',
          'Add typecheck and lint scripts; install packages only with npx expo install.',
        ],
        resources: ['expo-agents', 'expo-sdk-57', 'expo-new-arch'],
        exercises: ['Done when: the app runs on your phone and typecheck plus lint pass'],
        difficulty: 'intermediate',
        minutes: 120,
      },
      {
        title: 'Engine: rating policy and scheduler wrapper',
        description:
          'A plain TypeScript module in core/learning with no React and no network. Every game returns the same result shape; a rating policy maps it to FSRS ratings and ts-fsrs computes the next review. Wrap ts-fsrs behind your own interface.',
        objectives: [
          'Define the shared game result: word, exercise type, correct or not, hints used, response time.',
          'Map results to ratings: wrong is Again, correct with a hint is Hard, correct is Good, unaided recall can earn Easy; recognition exercises are capped at Good.',
          'Write unit tests for every rating-policy change, and keep React Native imports out of core/.',
        ],
        resources: ['ts-fsrs'],
        exercises: ['Done when: tests prove ratings map correctly and a replay rebuilds identical card state'],
        difficulty: 'advanced',
        minutes: 180,
      },
      {
        title: 'Engine: append-only review events and replay',
        description:
          'review_events is append-only with a client-generated UUID, card, exercise type, rating, hints, timing, timestamp and device id. Card state is rebuilt by replaying events in order.',
        objectives: [
          'Design the review_events record.',
          'Rebuild card state by replaying events.',
          'Keep scheduler fuzz off or seeded so replays match.',
        ],
        resources: ['ts-fsrs', 'expo-sqlite-ref'],
        difficulty: 'advanced',
        minutes: 120,
      },
      {
        title: 'Content and storage',
        description:
          'A SQLite schema with migrations, a 200 to 500 word pack with audio, and a local import. Record each content source and licence in the pack metadata.',
        objectives: [
          'Create the SQLite schema and migrations.',
          'Import a versioned word pack, with audio, from local files.',
          'Store the source and licence of every item in the pack metadata.',
        ],
        resources: ['expo-sqlite-ref'],
        exercises: ['Done when: a pack loads offline and survives app restarts'],
        difficulty: 'intermediate',
        minutes: 180,
      },
      {
        title: 'First game: article sorter and session runner',
        description:
          'Build the article sorter with drag and drop, plus the shared session runner that saves review events. Test on a low-end Android phone before building a second game.',
        objectives: [
          'Build drag and drop with Gesture Handler and Reanimated.',
          'Build a session runner that saves a review event for every answer.',
          'Run the game on a low-end Android device and keep few animated views on screen at once.',
        ],
        resources: ['reanimated-start'],
        exercises: ['Done when: a five-minute session saves events and schedules next reviews'],
        difficulty: 'advanced',
        minutes: 240,
      },
      {
        title: 'More games and real screens',
        description:
          'Two more games on the same session runner, then Home, Learn and Stats screens built from real data (not mock data).',
        objectives: [
          'Add two games without changing core/.',
          'Build Home, Learn and Stats from real stored data.',
        ],
        resources: ['reanimated-start'],
        exercises: ['Done when: adding a game needs no change to core/'],
        difficulty: 'advanced',
        minutes: 240,
      },
      {
        title: 'Auth and sync',
        description:
          'Supabase Auth, Row Level Security, an Edge Function that inserts uploaded review events idempotently, and restore on a fresh install by replaying events.',
        objectives: [
          'Add sign-up and sign-in.',
          'Upload unsynced events in batches to an Edge Function that ignores duplicates.',
          'Restore a second device by downloading and replaying events.',
        ],
        resources: ['supabase-auth', 'supabase-rls', 'supabase-expo'],
        exercises: ['Done when: you study in airplane mode, reconnect, and events appear exactly once; a second device matches'],
        difficulty: 'advanced',
        minutes: 240,
      },
      {
        title: 'Closed test and validation',
        description:
          'Run a Google Play closed test with 12 or more testers for 14 days, add PostHog with the first testers, and use day-7 retention and session counts to decide whether to continue.',
        objectives: [
          'Recruit testers during the build, not after it.',
          'Add analytics only once real testers exist.',
          'Decide whether to continue based on retention, not feelings.',
        ],
        resources: ['google-play-testing'],
        exercises: ['Done when: day-7 retention and session counts tell you whether to continue'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'After validation (later)',
        description:
          'Only after the closed test shows people return: XP, streaks and goals; then leagues and async PvP; then iOS, web and subscriptions. Each stage ships only after the previous one proves its value.',
        objectives: [
          'Resist building leagues, PvP, iOS, web or subscriptions before retention is proven.',
          'Know that web is online-first at launch because expo-sqlite on web is still alpha.',
        ],
        resources: ['expo-router-static', 'expo-sqlite-ref'],
        difficulty: 'advanced',
        minutes: 45,
      },
    ],
  },
  {
    number: 10,
    title: 'Security, Legal and Store Release',
    duration: 'Ongoing, alongside Phase 9',
    estimatedWeeks: 2,
    ongoing: true,
    practiceLabel: 'Checks',
    description:
      'The security, content-licensing and store-release items from your architecture review. They are cheap to do early and expensive to fix later.',
    objectives: [
      'Protect user data with Row Level Security on every table.',
      'Keep secrets and the service_role key out of the app and the repository.',
      'Never trust the client for competition scores.',
      'Handle content licences and the Google Play requirements before launch.',
    ],
    resourceIds: ['supabase-rls', 'supabase-auth', 'google-play-testing', 'expo-agents'],
    lessons: [
      {
        title: 'Row Level Security on every table',
        description:
          'Turn on RLS for every table in the first migration. Content tables are read-only for users. Every migration that creates a table must also enable RLS and add its policies.',
        objectives: [
          'Enable RLS in the same migration that creates each table.',
          'Make content tables read-only for users.',
          'Write a policy that limits a user to their own rows.',
        ],
        resources: ['supabase-rls'],
        exercises: ['Check: no table in your database has RLS switched off'],
        difficulty: 'advanced',
        minutes: 90,
      },
      {
        title: 'Keys and secrets',
        description:
          'The service_role key bypasses RLS and must never ship in the app. Never place secrets in the repository or the app bundle.',
        objectives: [
          'Explain what the service_role key can do and why it stays server-side.',
          'Search your repository and app bundle for secrets before every release.',
        ],
        resources: ['supabase-auth', 'expo-agents'],
        exercises: ['Check: no secret or service_role key exists in the repo or the app bundle'],
        difficulty: 'intermediate',
        minutes: 45,
      },
      {
        title: 'Do not trust the client (competition and cheating)',
        description:
          'Leagues and PvP get cheated and lost trust is hard to win back. Compute XP and league scores on the server from synced events, never from numbers sent by the client. This is why leagues wait until after validation.',
        objectives: [
          'Explain why a client-reported score cannot be trusted.',
          'Describe how server-side scoring from synced review events works.',
        ],
        resources: ['supabase-rls'],
        difficulty: 'advanced',
        minutes: 45,
      },
      {
        title: 'Content licences and attribution',
        description:
          'Words, audio and illustrations take longer than code, and some licences require attribution or share-alike terms. Start with 200 to 500 words and record each source and licence in the pack metadata.',
        objectives: [
          'Identify the licence of every word list, audio file and image you use.',
          'Know the difference between attribution and share-alike terms.',
          'Record source and licence in the pack metadata.',
        ],
        resources: [],
        exercises: ['Check: every item in your first pack has a recorded source and licence'],
        difficulty: 'intermediate',
        minutes: 60,
      },
      {
        title: 'Google Play testing requirements',
        description:
          'A personal developer account created after November 13, 2023 needs a closed test with 12 testers opted in for 14 continuous days before you can apply for production.',
        objectives: [
          'Know the 12-tester, 14-day rule.',
          'Create the developer account and start recruiting testers during the build.',
        ],
        resources: ['google-play-testing'],
        exercises: ['Check: developer account created and testers recruited'],
        difficulty: 'beginner',
        minutes: 45,
      },
      {
        title: 'Personal or organization Play account',
        description:
          'Organization accounts fall outside the 12-tester rule but need business verification, including a D-U-N-S number. Decide before day one.',
        objectives: [
          'Compare a personal and an organization account.',
          'Decide which one you will use, and why.',
        ],
        resources: ['google-play-testing'],
        difficulty: 'beginner',
        minutes: 30,
      },
      {
        title: 'Guardrails for AI-assisted work (CLAUDE.md)',
        description:
          'A strict CLAUDE.md keeps Claude Code reliable and safe: exact stack versions, checks that must pass, no new dependencies without asking, and rules about secrets and RLS.',
        objectives: [
          'State the stack with exact versions, and require typecheck, lint and test to pass before a task counts as done.',
          'Require npx expo install, no edits to generated native folders, and a question before adding any dependency.',
          'Require a unit test for every rating-policy change, and RLS on every new table.',
          'Work on one feature at a time and commit at each green milestone.',
        ],
        resources: ['expo-agents'],
        exercises: ['Check: your project has a CLAUDE.md containing these rules'],
        difficulty: 'intermediate',
        minutes: 60,
      },
    ],
  },
  {
    number: 11,
    title: 'Privacy and GDPR',
    duration: 'Ongoing, alongside Phases 9–10; finish before the closed test',
    estimatedWeeks: 2,
    ongoing: true,
    practiceLabel: 'Deliverables',
    description:
      'What you must do to handle your learners\' personal data responsibly. GDPR applies whenever you have users in the EU, EEA or UK, wherever you are based. This is a learning guide, not legal advice: for anything high-stakes, especially if children will use Lyra, check with a qualified professional.',
    objectives: [
      'Know exactly what personal data Lyra collects, why, and where it is stored.',
      'Choose a lawful basis for each purpose, and get consent where it is needed.',
      'Publish an accurate privacy policy and match it in the store disclosures.',
      'Build the features that let users access, export and delete their data.',
    ],
    resourceIds: ['ec-business-rules', 'ico-guide', 'gdpr-info', 'play-data-safety'],
    lessons: [
      {
        title: 'What counts as personal data in Lyra',
        description:
          'Personal data is anything that relates to an identifiable person: an email address, a user id, a device id, and the review history tied to an account. Learn when GDPR applies to you and the difference between a controller (you) and a processor (Supabase, Expo, analytics tools).',
        objectives: [
          'List the personal data Lyra will hold.',
          'Explain when GDPR applies, regardless of where you live.',
          'Distinguish controller from processor.',
        ],
        resources: ['ec-business-rules', 'ico-guide'],
        difficulty: 'beginner',
        minutes: 60,
      },
      {
        title: 'Data inventory and minimisation',
        description:
          'For every piece of data, write down why you need it, where it is stored (phone SQLite, Supabase, analytics) and how long you keep it. Collect only what you need, which is the single most effective privacy decision.',
        objectives: [
          'Create a data inventory: item, purpose, location, retention.',
          'Remove anything you collect "just in case".',
          'Understand data minimisation and storage limitation.',
        ],
        resources: ['gdpr-info', 'ico-guide'],
        exercises: ['Deliverable: a data inventory table for Lyra'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Lawful bases and consent',
        description:
          'Every purpose needs one of six lawful bases. For Lyra, running the account and learning features is usually "contract", while non-essential analytics usually needs consent. Consent must be freely given, specific, informed, unambiguous and as easy to withdraw as to give.',
        objectives: [
          'Name the six lawful bases.',
          'Pick a basis for each purpose in your inventory.',
          'Know what valid consent requires, and when you do not need it.',
        ],
        resources: ['gdpr-info', 'ico-guide'],
        exercises: ['Deliverable: a lawful basis chosen for every purpose in the inventory'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'Writing the privacy policy',
        description:
          'Your policy must say who you are, what you collect, why, the lawful basis, who receives it, how long you keep it, whether it leaves the EEA, and what rights users have. Write it in plain language and make it match what the app really does.',
        objectives: [
          'Cover the required information (GDPR Article 13).',
          'Write for learners, not lawyers.',
          'Link the policy from the app, the sign-up screen and the store listing.',
        ],
        resources: ['gdpr-info', 'ico-guide'],
        exercises: ['Deliverable: a first draft of the Lyra privacy policy'],
        difficulty: 'intermediate',
        minutes: 120,
      },
      {
        title: 'Analytics and tracking consent',
        description:
          'The review defers PostHog until real testers exist. When you add it, do not collect non-essential analytics before the user opts in, make withdrawing easy, and prefer anonymous or minimal events. Test what is actually sent.',
        objectives: [
          'Decide which analytics are essential and which need consent.',
          'Build an opt-in screen that works before any tracking starts.',
          'Verify with a network inspector that nothing is sent before consent.',
        ],
        resources: ['ico-guide', 'gdpr-info'],
        exercises: ['Deliverable: analytics stays off until the user opts in'],
        difficulty: 'intermediate',
        minutes: 90,
      },
      {
        title: 'User rights: access, export and deletion',
        description:
          'Users can ask to see, correct, export and erase their data, and you generally have one month to respond. Build this into the app instead of handling emails by hand. Google Play and Apple also require that account deletion can be started inside the app.',
        objectives: [
          'List the main rights: access, rectification, erasure, portability, objection.',
          'Build an in-app "Download my data" and "Delete my account".',
          'Make deletion remove the user\'s review events and profile on the server.',
        ],
        resources: ['gdpr-info', 'play-account-deletion', 'supabase-auth'],
        exercises: ['Deliverable: in-app data export and account deletion that really delete'],
        difficulty: 'advanced',
        minutes: 180,
      },
      {
        title: 'Processors, contracts and data transfers',
        description:
          'Each service that handles user data for you (Supabase, Expo/EAS, analytics) is a processor and needs a data processing agreement. Check where data is stored, choose an EU region where you can, and understand the safeguards used when data leaves the EEA.',
        objectives: [
          'List every processor and what it receives.',
          'Accept or sign the data processing agreement for each.',
          'Choose the Supabase region deliberately.',
        ],
        resources: ['supabase-dpa', 'ec-business-rules'],
        exercises: ['Deliverable: a processor list with a DPA and region noted for each'],
        difficulty: 'intermediate',
        minutes: 60,
      },
      {
        title: 'Children and age limits',
        description:
          'Decide early who Lyra is for. Under GDPR, the age at which a child can consent for themselves is 16, and EU countries may lower it to as low as 13. In the US, COPPA covers children under 13. Apps aimed at children face much stricter rules, so most solo projects choose a clear minimum age.',
        objectives: [
          'Decide the minimum age for Lyra.',
          'Understand why children\'s data gets extra protection.',
          'Know when to get professional advice before targeting children.',
        ],
        resources: ['ico-guide', 'ftc-coppa'],
        exercises: ['Deliverable: a written decision on minimum age and how you enforce it'],
        difficulty: 'intermediate',
        minutes: 60,
      },
      {
        title: 'Security and breach response',
        description:
          'GDPR expects appropriate security, which connects directly to Phase 10: Row Level Security, no secrets in the app, and encryption in transit. If personal data is breached and it is likely to put people at risk, you must notify the regulator within 72 hours of becoming aware. Keep a short written incident plan.',
        objectives: [
          'Tie the Phase 10 security measures to your GDPR duties.',
          'Know the 72-hour regulator notification rule.',
          'Write a one-page incident plan: who, what, when, how to tell users.',
        ],
        resources: ['gdpr-info', 'ico-guide', 'supabase-rls'],
        exercises: ['Deliverable: a one-page incident response plan'],
        difficulty: 'intermediate',
        minutes: 60,
      },
      {
        title: 'Store disclosures and pre-launch checklist',
        description:
          'Google Play\'s Data safety form (and Apple\'s privacy labels, once you add iOS) must match what the app really does and what your privacy policy says. Do a final consistency check before the closed test, and get a professional review if anything is uncertain.',
        objectives: [
          'Fill in the Data safety form accurately from your data inventory.',
          'Check the app, policy and store disclosures all agree.',
          'Know when to ask a lawyer or data protection professional.',
        ],
        resources: ['play-data-safety', 'apple-privacy-details', 'google-play-testing'],
        exercises: ['Deliverable: Data safety form completed and checked against the policy'],
        difficulty: 'intermediate',
        minutes: 90,
      },
    ],
  },
];

export const curriculum: Phase[] = phaseInputs.map(buildPhase);

export const allLessons: Lesson[] = curriculum.flatMap((p) => p.lessons);

const lessonById = new Map(allLessons.map((l) => [l.id, l]));
const phaseById = new Map(curriculum.map((p) => [p.id, p]));

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function getPhase(id: string): Phase | undefined {
  return phaseById.get(id);
}

export const allExerciseIds: string[] = allLessons.flatMap((l) => l.exercises.map((e) => e.id));
