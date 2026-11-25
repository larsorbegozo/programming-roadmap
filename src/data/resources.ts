import type { Resource } from '../types/curriculum';

/**
 * Every free resource referenced by the curriculum. Lessons reference these by id.
 * Core resources come straight from the roadmap; the rest are deep links into the same sites.
 */
export const resources: Resource[] = [
  // Phase 0 — Development Environment
  { id: 'vscode', phaseId: 'p0', name: 'Visual Studio Code', type: 'tool', url: 'https://code.visualstudio.com/', description: 'Free code editor used throughout the roadmap.', topics: ['Editor', 'Setup'] },
  { id: 'vscode-docs', phaseId: 'p0', name: 'VS Code — Getting Started', type: 'documentation', url: 'https://code.visualstudio.com/docs/getstarted/getting-started', description: 'Official walkthrough of the editor interface, extensions and settings.', topics: ['Editor', 'Extensions'] },
  { id: 'nodejs', phaseId: 'p0', name: 'Node.js', type: 'tool', url: 'https://nodejs.org/', description: 'JavaScript runtime used to run code and tooling outside the browser. Install the LTS version.', topics: ['Runtime', 'Setup', 'npm'] },
  { id: 'git', phaseId: 'p0', name: 'Git', type: 'tool', url: 'https://git-scm.com/', description: 'Version control system for tracking changes to your code.', topics: ['Version control', 'Setup'] },
  { id: 'github', phaseId: 'p0', name: 'GitHub', type: 'tool', url: 'https://github.com/', description: 'Hosting platform for Git repositories and collaboration.', topics: ['Version control', 'Hosting'] },
  { id: 'mdn-getting-started', phaseId: 'p0', name: 'MDN — Getting Started', type: 'tutorial', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started', description: 'Beginner-friendly introduction to how the web, files and tooling fit together.', topics: ['Fundamentals', 'Files', 'Terminal'] },

  // Phase 1 — JavaScript Fundamentals
  { id: 'fcc-js', phaseId: 'p1', name: 'freeCodeCamp — JavaScript Algorithms and Data Structures', type: 'interactive-course', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/', description: 'Primary interactive course for JavaScript fundamentals with in-browser exercises.', topics: ['JavaScript', 'Exercises', 'Fundamentals'] },
  { id: 'jsinfo', phaseId: 'p1', name: 'javascript.info — The Modern JavaScript Tutorial', type: 'tutorial', url: 'https://javascript.info/', description: 'Thorough, well-structured written tutorial. Supplementary for fundamentals, primary for intermediate topics.', topics: ['JavaScript', 'Reference'] },
  { id: 'jsinfo-variables', phaseId: 'p1', name: 'javascript.info — Variables', type: 'reference', url: 'https://javascript.info/variables', description: 'let, const and naming rules.', topics: ['Variables'] },
  { id: 'jsinfo-types', phaseId: 'p1', name: 'javascript.info — Data types', type: 'reference', url: 'https://javascript.info/types', description: 'The eight basic data types in JavaScript.', topics: ['Data types'] },
  { id: 'jsinfo-operators', phaseId: 'p1', name: 'javascript.info — Basic operators', type: 'reference', url: 'https://javascript.info/operators', description: 'Arithmetic, assignment and comparison operators.', topics: ['Operators'] },
  { id: 'jsinfo-ifelse', phaseId: 'p1', name: 'javascript.info — Conditional branching', type: 'reference', url: 'https://javascript.info/ifelse', description: 'if, else and the ternary operator.', topics: ['Conditionals'] },
  { id: 'jsinfo-functions', phaseId: 'p1', name: 'javascript.info — Functions', type: 'reference', url: 'https://javascript.info/function-basics', description: 'Declaring functions, parameters and return values.', topics: ['Functions'] },
  { id: 'jsinfo-array', phaseId: 'p1', name: 'javascript.info — Arrays', type: 'reference', url: 'https://javascript.info/array', description: 'Creating and working with ordered collections.', topics: ['Arrays'] },
  { id: 'jsinfo-object', phaseId: 'p1', name: 'javascript.info — Objects', type: 'reference', url: 'https://javascript.info/object', description: 'Key-value data structures.', topics: ['Objects'] },
  { id: 'jsinfo-loops', phaseId: 'p1', name: 'javascript.info — Loops', type: 'reference', url: 'https://javascript.info/while-for', description: 'while, for and loop control.', topics: ['Loops'] },
  { id: 'jsinfo-array-methods', phaseId: 'p1', name: 'javascript.info — Array methods', type: 'reference', url: 'https://javascript.info/array-methods', description: 'map, filter, find, reduce and friends.', topics: ['Arrays', 'Array methods'] },
  { id: 'jsinfo-closure', phaseId: 'p1', name: 'javascript.info — Variable scope, closure', type: 'reference', url: 'https://javascript.info/closure', description: 'How scope works and what closures are.', topics: ['Scope', 'Closures'] },

  // Phase 2 — Intermediate JavaScript
  { id: 'jsinfo-destructuring', phaseId: 'p2', name: 'javascript.info — Destructuring assignment', type: 'reference', url: 'https://javascript.info/destructuring-assignment', description: 'Unpacking arrays and objects into variables.', topics: ['Destructuring'] },
  { id: 'jsinfo-spread', phaseId: 'p2', name: 'javascript.info — Rest parameters and spread syntax', type: 'reference', url: 'https://javascript.info/rest-parameters-spread', description: 'Copying and combining arrays and objects.', topics: ['Spread'] },
  { id: 'jsinfo-modules', phaseId: 'p2', name: 'javascript.info — Modules, introduction', type: 'reference', url: 'https://javascript.info/modules-intro', description: 'Splitting code across files.', topics: ['Modules'] },
  { id: 'jsinfo-import-export', phaseId: 'p2', name: 'javascript.info — Export and import', type: 'reference', url: 'https://javascript.info/import-export', description: 'Named and default exports.', topics: ['Modules'] },
  { id: 'jsinfo-promise', phaseId: 'p2', name: 'javascript.info — Promise', type: 'reference', url: 'https://javascript.info/promise-basics', description: 'Representing values that arrive later.', topics: ['Async', 'Promises'] },
  { id: 'jsinfo-async', phaseId: 'p2', name: 'javascript.info — Async/await', type: 'reference', url: 'https://javascript.info/async-await', description: 'Writing asynchronous code that reads like synchronous code.', topics: ['Async'] },
  { id: 'jsinfo-try-catch', phaseId: 'p2', name: 'javascript.info — Error handling, "try...catch"', type: 'reference', url: 'https://javascript.info/try-catch', description: 'Catching and handling runtime errors.', topics: ['Errors'] },
  { id: 'jsinfo-json', phaseId: 'p2', name: 'javascript.info — JSON methods', type: 'reference', url: 'https://javascript.info/json', description: 'JSON.stringify and JSON.parse.', topics: ['JSON'] },
  { id: 'jsinfo-fetch', phaseId: 'p2', name: 'javascript.info — Fetch', type: 'reference', url: 'https://javascript.info/fetch', description: 'Making network requests from JavaScript.', topics: ['Fetch', 'APIs'] },
  { id: 'jsinfo-custom-errors', phaseId: 'p2', name: 'javascript.info — Custom errors', type: 'reference', url: 'https://javascript.info/custom-errors', description: 'Creating and extending error types.', topics: ['Errors'] },

  // Phase 3 — TypeScript
  { id: 'ts-from-scratch', phaseId: 'p3', name: 'TypeScript for the New Programmer', type: 'documentation', url: 'https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html', description: 'Official introduction to TypeScript for people new to programming.', topics: ['TypeScript', 'Introduction'] },
  { id: 'ts-handbook', phaseId: 'p3', name: 'The TypeScript Handbook', type: 'documentation', url: 'https://www.typescriptlang.org/docs/handbook/', description: 'Complete official guide to the TypeScript language.', topics: ['TypeScript', 'Reference'] },
  { id: 'ts-everyday-types', phaseId: 'p3', name: 'Handbook — Everyday Types', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', description: 'Primitives, arrays, annotations, unions, aliases and interfaces.', topics: ['Types', 'Interfaces', 'Unions'] },
  { id: 'ts-inference', phaseId: 'p3', name: 'Handbook — Type Inference', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/type-inference.html', description: 'How TypeScript figures out types on its own.', topics: ['Inference'] },
  { id: 'ts-objects', phaseId: 'p3', name: 'Handbook — Object Types', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html', description: 'Describing object shapes, optional and readonly properties.', topics: ['Objects', 'Optional properties'] },
  { id: 'ts-functions', phaseId: 'p3', name: 'Handbook — More on Functions', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html', description: 'Typing parameters, return values and callbacks.', topics: ['Functions'] },
  { id: 'ts-generics', phaseId: 'p3', name: 'Handbook — Generics', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', description: 'Writing reusable, type-safe code.', topics: ['Generics'] },
  { id: 'ts-modules', phaseId: 'p3', name: 'Handbook — Modules', type: 'reference', url: 'https://www.typescriptlang.org/docs/handbook/2/modules.html', description: 'Importing and exporting values and types.', topics: ['Modules'] },

  // Phase 4 — React Fundamentals
  { id: 'react-learn', phaseId: 'p4', name: 'react.dev — Learn React', type: 'documentation', url: 'https://react.dev/learn', description: 'Official, interactive React course. Primary resource for this phase.', topics: ['React', 'Components', 'Hooks'] },
  { id: 'react-components', phaseId: 'p4', name: 'react.dev — Your First Component', type: 'reference', url: 'https://react.dev/learn/your-first-component', description: 'Defining and using components.', topics: ['Components'] },
  { id: 'react-jsx', phaseId: 'p4', name: 'react.dev — Writing Markup with JSX', type: 'reference', url: 'https://react.dev/learn/writing-markup-with-jsx', description: 'JSX syntax and rules.', topics: ['JSX'] },
  { id: 'react-props', phaseId: 'p4', name: 'react.dev — Passing Props to a Component', type: 'reference', url: 'https://react.dev/learn/passing-props-to-a-component', description: 'Passing data into components.', topics: ['Props'] },
  { id: 'react-state', phaseId: 'p4', name: "react.dev — State: A Component's Memory", type: 'reference', url: 'https://react.dev/learn/state-a-components-memory', description: 'Remembering values between renders.', topics: ['State', 'useState'] },
  { id: 'react-events', phaseId: 'p4', name: 'react.dev — Responding to Events', type: 'reference', url: 'https://react.dev/learn/responding-to-events', description: 'Handling clicks and other user input.', topics: ['Events'] },
  { id: 'react-conditional', phaseId: 'p4', name: 'react.dev — Conditional Rendering', type: 'reference', url: 'https://react.dev/learn/conditional-rendering', description: 'Showing different UI based on conditions.', topics: ['Conditional rendering'] },
  { id: 'react-lists', phaseId: 'p4', name: 'react.dev — Rendering Lists', type: 'reference', url: 'https://react.dev/learn/rendering-lists', description: 'Rendering arrays of data with keys.', topics: ['Lists'] },
  { id: 'react-hooks', phaseId: 'p4', name: 'react.dev — Built-in React Hooks', type: 'reference', url: 'https://react.dev/reference/react/hooks', description: 'Overview of every built-in hook.', topics: ['Hooks'] },
  { id: 'react-usestate', phaseId: 'p4', name: 'react.dev — useState', type: 'reference', url: 'https://react.dev/reference/react/useState', description: 'API reference for useState.', topics: ['useState'] },
  { id: 'react-useeffect', phaseId: 'p4', name: 'react.dev — useEffect', type: 'reference', url: 'https://react.dev/reference/react/useEffect', description: 'API reference for useEffect.', topics: ['useEffect'] },

  // Phase 5 — React Native and Expo
  { id: 'expo-tutorial', phaseId: 'p5', name: 'Expo Tutorial', type: 'tutorial', url: 'https://docs.expo.dev/tutorial/introduction/', description: 'Official step-by-step tutorial building a real Expo app. Primary resource for this phase.', topics: ['Expo', 'React Native', 'Mobile'] },
  { id: 'expo-create', phaseId: 'p5', name: 'Expo — Create a project', type: 'reference', url: 'https://docs.expo.dev/get-started/create-a-project/', description: 'Creating a new Expo app with create-expo-app.', topics: ['Expo', 'Setup'] },
  { id: 'expo-router', phaseId: 'p5', name: 'Expo Router — Introduction', type: 'documentation', url: 'https://docs.expo.dev/router/introduction/', description: 'File-based navigation for Expo apps.', topics: ['Navigation'] },
  { id: 'rn-getting-started', phaseId: 'p5', name: 'React Native — Getting Started', type: 'documentation', url: 'https://reactnative.dev/docs/getting-started', description: 'Official React Native documentation.', topics: ['React Native'] },
  { id: 'rn-core-components', phaseId: 'p5', name: 'React Native — Core Components', type: 'reference', url: 'https://reactnative.dev/docs/intro-react-native-components', description: 'View, Text, Image, ScrollView and other building blocks.', topics: ['Components'] },
  { id: 'rn-flexbox', phaseId: 'p5', name: 'React Native — Layout with Flexbox', type: 'reference', url: 'https://reactnative.dev/docs/flexbox', description: 'How layout works in React Native.', topics: ['Styling', 'Flexbox'] },
  { id: 'rn-flatlist', phaseId: 'p5', name: 'React Native — FlatList', type: 'reference', url: 'https://reactnative.dev/docs/flatlist', description: 'Efficiently rendering long lists.', topics: ['Lists'] },
  { id: 'rn-animations', phaseId: 'p5', name: 'React Native — Animations', type: 'reference', url: 'https://reactnative.dev/docs/animations', description: 'The Animated API and layout animations.', topics: ['Animations'] },

  // Phase 6 — SQL and Supabase
  { id: 'sqlbolt', phaseId: 'p6', name: 'SQLBolt', type: 'interactive-course', url: 'https://sqlbolt.com/', description: 'Interactive SQL lessons with exercises in the browser.', topics: ['SQL', 'Databases'] },
  { id: 'sqlbolt-joins', phaseId: 'p6', name: 'SQLBolt — Multi-table queries with JOINs', type: 'reference', url: 'https://sqlbolt.com/lesson/select_queries_with_joins', description: 'Combining data from related tables.', topics: ['JOIN'] },
  { id: 'supabase-start', phaseId: 'p6', name: 'Supabase — Getting Started', type: 'documentation', url: 'https://supabase.com/docs/guides/getting-started', description: 'Overview of Supabase and its features.', topics: ['Supabase', 'Postgres'] },
  { id: 'supabase-expo', phaseId: 'p6', name: 'Supabase — Expo React Native Quickstart', type: 'tutorial', url: 'https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native', description: 'Connecting an Expo app to a Supabase project.', topics: ['Supabase', 'Expo'] },
  { id: 'supabase-auth', phaseId: 'p6', name: 'Supabase — Auth', type: 'documentation', url: 'https://supabase.com/docs/guides/auth', description: 'User sign-up, sign-in and sessions.', topics: ['Authentication'] },
  { id: 'supabase-rls', phaseId: 'p6', name: 'Supabase — Row Level Security', type: 'documentation', url: 'https://supabase.com/docs/guides/database/postgres/row-level-security', description: 'Restricting which rows each user can read or write.', topics: ['Security', 'RLS'] },

  // Phase 7 — Git, Testing, and Development Workflow
  { id: 'github-skills', phaseId: 'p7', name: 'GitHub Skills', type: 'interactive-course', url: 'https://skills.github.com/', description: 'Free interactive courses that run inside real GitHub repositories.', topics: ['Git', 'GitHub'] },
  { id: 'git-docs', phaseId: 'p7', name: 'Git Documentation', type: 'documentation', url: 'https://git-scm.com/doc', description: 'Official Git reference, including the free Pro Git book.', topics: ['Git', 'Reference'] },
  { id: 'github-learning', phaseId: 'p7', name: 'GitHub — Git and GitHub learning resources', type: 'reference', url: 'https://docs.github.com/en/get-started/start-your-journey/git-and-github-learning-resources', description: 'Curated list of learning material for Git and GitHub.', topics: ['Git', 'GitHub'] },
  { id: 'pro-git', phaseId: 'p7', name: 'Pro Git (book)', type: 'reference', url: 'https://git-scm.com/book/en/v2', description: 'Free book covering Git from basics to branching and undoing changes.', topics: ['Git', 'Branches'] },

  // Phase 8 — Build the Lyra Prototype
  { id: 'expo-docs', phaseId: 'p8', name: 'Expo Documentation', type: 'documentation', url: 'https://docs.expo.dev/', description: 'Main reference while building Lyra.', topics: ['Expo', 'Reference'] },
  { id: 'expo-typescript', phaseId: 'p8', name: 'Expo — Using TypeScript', type: 'reference', url: 'https://docs.expo.dev/guides/typescript/', description: 'Configuring TypeScript in an Expo project.', topics: ['TypeScript', 'Expo'] },
];

const byId = new Map(resources.map((r) => [r.id, r]));

export function getResource(id: string): Resource | undefined {
  return byId.get(id);
}
